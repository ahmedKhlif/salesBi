$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiRoot = Resolve-Path (Join-Path $scriptDir "..")
$entryCandidates = @(
  (Join-Path $apiRoot "dist\api\src\main.js"),
  (Join-Path $apiRoot "dist\main.js")
)

function Get-CompiledEntrypoint {
  foreach ($candidate in $entryCandidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $entryCandidates[0]
}

Write-Host "Starting SalesLens API build watcher..." -ForegroundColor Cyan
$builder = Start-Process -FilePath "npm.cmd" `
  -ArgumentList @("run", "build", "--", "--watch") `
  -WorkingDirectory $apiRoot `
  -NoNewWindow `
  -PassThru

try {
  $attempts = 0
  $entryFile = Get-CompiledEntrypoint

  while (-not (Test-Path $entryFile)) {
    if ($builder.HasExited) {
      throw "The API build watcher stopped before $entryFile was created."
    }

    Start-Sleep -Milliseconds 500
    $attempts++
    $entryFile = Get-CompiledEntrypoint

    if ($attempts % 10 -eq 0) {
      Write-Host "Waiting for compiled API entrypoint..." -ForegroundColor DarkGray
    }
  }

  Write-Host "Starting SalesLens API runtime watcher with $entryFile ..." -ForegroundColor Green
  node --watch $entryFile
}
finally {
  if ($builder -and -not $builder.HasExited) {
    Stop-Process -Id $builder.Id -Force
  }
}
