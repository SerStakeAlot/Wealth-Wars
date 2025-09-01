Param(
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$workDir = Resolve-Path (Join-Path $PSScriptRoot '..\apps\web')
Write-Host "Starting Next.js dev server in $workDir on http://localhost:$Port ..."

# Start the dev server detached so this script can return
$npm = (Get-Command npm).Source
$proc = Start-Process -FilePath $npm -ArgumentList @('run','dev','--','-p',"$Port") -WorkingDirectory $workDir -PassThru
Start-Sleep -Seconds 4

$listening = $false
try {
  $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop | Where-Object { $_.State -eq 'Listen' }
  if ($conns) { $listening = $true }
} catch { }

Write-Host "Process Id: $($proc.Id)"
if ($listening) {
  Write-Host "Dev server is listening at http://localhost:$Port"
} else {
  Write-Host "Dev server started (it may still be warming up). Try http://localhost:$Port"
}
