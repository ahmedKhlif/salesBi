param(
    [string]$ServerName = "KAYTA\AHMED",
    [string]$DatabaseName = "SalesAnalysisCube",
    [string]$DimensionName = "Dim Date"
)

$ErrorActionPreference = "Stop"

$base = "C:\Program Files\Microsoft SQL Server Management Studio 22\Release\Common7\IDE"
[System.Reflection.Assembly]::LoadFrom((Join-Path $base "PrivateAssemblies\Newtonsoft.Json.13.0.3.0\Newtonsoft.Json.dll")) | Out-Null
[System.Reflection.Assembly]::LoadFrom((Join-Path $base "Microsoft.AnalysisServices.Core.dll")) | Out-Null
[System.Reflection.Assembly]::LoadFrom((Join-Path $base "Microsoft.AnalysisServices.dll")) | Out-Null

$server = New-Object Microsoft.AnalysisServices.Server

try {
    $server.Connect("Data Source=$ServerName;Timeout=0")
    Write-Host "Connected to $ServerName"

    $db = $server.Databases.FindByName($DatabaseName)
    if ($null -eq $db) {
        throw "Database '$DatabaseName' not found."
    }

    $dim = $db.Dimensions.FindByName($DimensionName)
    if ($null -eq $dim) {
        throw "Dimension '$DimensionName' not found."
    }

    Write-Host "Processing dimension '$DimensionName'..."
    $dim.Process([Microsoft.AnalysisServices.ProcessType]::ProcessFull)
    Write-Host "PROCESS_OK"
}
catch {
    Write-Host "PROCESS_FAILED"
    Write-Host $_.Exception.Message

    $inner = $_.Exception.InnerException
    while ($null -ne $inner) {
        Write-Host "INNER: $($inner.Message)"
        $inner = $inner.InnerException
    }

    throw
}
finally {
    if ($server.Connected) {
        $server.Disconnect()
    }
}
