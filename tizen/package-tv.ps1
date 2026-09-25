param(
  [Parameter(Mandatory = $true)]
  [string]$CertificateProfile
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$DistPath = Join-Path $ProjectRoot 'dist'
$TizenCommand = Get-Command tizen -ErrorAction SilentlyContinue

if (-not $TizenCommand) {
  throw 'Tizen CLI was not found. Install Tizen Studio, Web CLI, TV Extensions, and Samsung Certificate Extension first.'
}

Push-Location $ProjectRoot
try {
  npm run tv:prepare
  & $TizenCommand.Source build-web -- $DistPath
  if ($LASTEXITCODE -ne 0) { throw 'Tizen web build failed.' }

  $BuildResult = Join-Path $DistPath '.buildResult'
  & $TizenCommand.Source package -t wgt -s $CertificateProfile -- $BuildResult
  if ($LASTEXITCODE -ne 0) { throw 'Tizen signing/package creation failed.' }

  $Package = Get-ChildItem -LiteralPath $BuildResult -Filter '*.wgt' | Select-Object -First 1
  if (-not $Package) { throw 'Tizen CLI completed but no .wgt package was produced.' }

  Write-Host "Signed TV package: $($Package.FullName)"
}
finally {
  Pop-Location
}
