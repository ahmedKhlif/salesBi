param(
    [string]$SolutionPath = ".\SalesAnalysisCube.sln",
    [string]$ProjectBinPath = ".\SalesAnalysisCube\bin",
    [string]$ServerName = "KAYTA\AHMED",
    [string]$DatabaseName = "SalesAnalysisCube",
    [switch]$SkipBuild,
    [switch]$SkipProcess
)

$ErrorActionPreference = "Stop"

function Import-AnalysisServicesAssemblies {
    $candidates = @(
        "C:\Program Files\Microsoft SQL Server Management Studio 22\Release\Common7\IDE",
        "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Business Intelligence Semantic Model\1.0",
        "C:\Program Files\Microsoft SQL Server\160\SDK\Assemblies"
    )

    foreach ($basePath in $candidates) {
        $corePath = Join-Path $basePath "Microsoft.AnalysisServices.Core.dll"
        $amoPath = Join-Path $basePath "Microsoft.AnalysisServices.dll"
        if (-not ((Test-Path $corePath) -and (Test-Path $amoPath))) {
            continue
        }

        $newtonsoftCandidates = @(
            (Join-Path $basePath "PrivateAssemblies\Newtonsoft.Json.13.0.3.0\Newtonsoft.Json.dll"),
            (Join-Path $basePath "Newtonsoft.Json.dll")
        )

        foreach ($newtonsoftPath in $newtonsoftCandidates) {
            if (Test-Path $newtonsoftPath) {
                [System.Reflection.Assembly]::LoadFrom($newtonsoftPath) | Out-Null
                break
            }
        }

        [System.Reflection.Assembly]::LoadFrom($corePath) | Out-Null
        [System.Reflection.Assembly]::LoadFrom($amoPath) | Out-Null
        return
    }

    throw "Unable to find Microsoft.AnalysisServices client assemblies."
}

function Remove-ReadOnlyAnalysisServicesNodes {
    param([xml]$Document)

    $namespaceManager = New-Object System.Xml.XmlNamespaceManager($Document.NameTable)
    $namespaceManager.AddNamespace("a", "http://schemas.microsoft.com/analysisservices/2003/engine")
    $namespaceManager.AddNamespace("ddl200", "http://schemas.microsoft.com/analysisservices/2010/engine/200")
    $namespaceManager.AddNamespace("ddl300", "http://schemas.microsoft.com/analysisservices/2011/engine/300")

    $xpaths = @(
        "//a:CreatedTimestamp",
        "//a:LastSchemaUpdate",
        "//a:LastProcessed",
        "//a:State",
        "//a:LastUpdate",
        "//a:CurrentStorageMode",
        "//a:ConnectionStringSecurity",
        "//a:ImpersonationInfoSecurity",
        "//ddl200:ProcessingState",
        "//ddl300:ProcessingState",
        "//ddl300:AttributeHierarchyProcessingState"
    )

    foreach ($xpath in $xpaths) {
        @($Document.SelectNodes($xpath, $namespaceManager)) | ForEach-Object {
            $_.ParentNode.RemoveChild($_) | Out-Null
        }
    }
}

function Invoke-Xmla {
    param(
        [Microsoft.AnalysisServices.Server]$Server,
        [string]$Xmla,
        [string]$OperationName
    )

    $result = $Server.Execute($Xmla)
    $messages = @($result.Messages)
    $errors = @($messages | Where-Object {
        $null -ne $_ -and $_.PSObject.Properties.Match("ErrorCode").Count -gt 0 -and $_.ErrorCode -ne 0
    })
    if ($errors.Count -gt 0) {
        $details = ($errors | ForEach-Object { $_.Description }) -join [Environment]::NewLine
        throw "$OperationName failed:`n$details"
    }

    foreach ($warning in @($messages | Where-Object {
        $null -ne $_ -and $_.PSObject.Properties.Match("WarningCode").Count -gt 0 -and $_.WarningCode -ne 0
    })) {
        Write-Host ("Warning during {0}: {1}" -f $OperationName, $warning.Description)
    }
}

if (-not $SkipBuild) {
    $devenv = "C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\devenv.com"
    if (-not (Test-Path $devenv)) {
        throw "Visual Studio 2022 devenv.com was not found at '$devenv'."
    }

    & $devenv $SolutionPath /Build Development
    if ($LASTEXITCODE -ne 0) {
        throw "Visual Studio build failed with exit code $LASTEXITCODE."
    }
}

$asDatabasePath = Join-Path $ProjectBinPath "SalesAnalysisCube.asdatabase"
if (-not (Test-Path $asDatabasePath)) {
    throw "Built database artifact not found: $asDatabasePath"
}

Import-AnalysisServicesAssemblies

[xml]$databaseDocument = Get-Content $asDatabasePath
Remove-ReadOnlyAnalysisServicesNodes -Document $databaseDocument
$databaseXml = $databaseDocument.OuterXml

$createXmla = @"
<Batch xmlns="http://schemas.microsoft.com/analysisservices/2003/engine">
  <Create AllowOverwrite="true">
    <ObjectDefinition>
$databaseXml
    </ObjectDefinition>
  </Create>
</Batch>
"@

$server = New-Object Microsoft.AnalysisServices.Server
try {
    $server.Connect("Data Source=$ServerName;Timeout=0")
    Invoke-Xmla -Server $server -Xmla $createXmla -OperationName "Deployment"

    if (-not $SkipProcess) {
        $processXmla = @"
<Batch xmlns="http://schemas.microsoft.com/analysisservices/2003/engine">
  <Process>
    <Object>
      <DatabaseID>$DatabaseName</DatabaseID>
    </Object>
    <Type>ProcessFull</Type>
    <WriteBackTableCreation>UseExisting</WriteBackTableCreation>
  </Process>
</Batch>
"@
        Invoke-Xmla -Server $server -Xmla $processXmla -OperationName "Processing"
    }

    $server.Refresh()
    $database = $server.Databases.FindByName($DatabaseName)
    if ($null -eq $database) {
        throw "Database '$DatabaseName' was not found after deployment."
    }

    Write-Host ("Deployment completed. Database '{0}' state: {1}" -f $database.Name, $database.State)
}
finally {
    if ($server.Connected) {
        $server.Disconnect()
    }
}
