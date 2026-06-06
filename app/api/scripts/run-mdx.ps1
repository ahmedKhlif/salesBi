param(
  [Parameter(Mandatory = $true)]
  [string]$Server,

  [Parameter(Mandatory = $true)]
  [string]$Database,

  [Parameter(Mandatory = $true)]
  [string]$AdomdPath,

  [Parameter(Mandatory = $true)]
  [string]$QueryBase64
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $AdomdPath)) {
  throw "ADOMD.NET DLL not found at $AdomdPath"
}

Add-Type -Path $AdomdPath

$query = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($QueryBase64))
$connection = New-Object Microsoft.AnalysisServices.AdomdClient.AdomdConnection("Data Source=$Server;Catalog=$Database;")

try {
  $connection.Open()
  $command = $connection.CreateCommand()
  $command.CommandText = $query
  $cellSet = $command.ExecuteCellSet()

  $rows = New-Object 'System.Collections.Generic.List[object]'
  $columnCount = if ($cellSet.Axes.Count -gt 0 -and $cellSet.Axes[0].Positions.Count -gt 0) {
    $cellSet.Axes[0].Positions.Count
  } else {
    1
  }

  if ($cellSet.Axes.Count -gt 1 -and $cellSet.Axes[1].Positions.Count -gt 0) {
    for ($rowIndex = 0; $rowIndex -lt $cellSet.Axes[1].Positions.Count; $rowIndex++) {
      $position = $cellSet.Axes[1].Positions[$rowIndex]
      $member = $position.Members[0]
      $cell = $cellSet.Cells[$rowIndex * $columnCount]

      $rows.Add([PSCustomObject]@{
        uniqueName = $member.UniqueName
        caption = $member.Caption
        value = if ($null -eq $cell.Value) { $null } else { [double]$cell.Value }
      })
    }
  }
  else {
    $cell = $cellSet.Cells[0]
    $rows.Add([PSCustomObject]@{
      uniqueName = ''
      caption = ''
      value = if ($null -eq $cell.Value) { $null } else { [double]$cell.Value }
    })
  }

  ConvertTo-Json -InputObject $rows.ToArray() -Compress -Depth 4
}
catch {
  $line = if ($_.InvocationInfo.ScriptLineNumber) { $_.InvocationInfo.ScriptLineNumber } else { 'unknown' }
  throw "MDX runner failed on line ${line}: $($_.Exception.Message)"
}
finally {
  if ($connection.State -eq [System.Data.ConnectionState]::Open) {
    $connection.Close()
  }
}
