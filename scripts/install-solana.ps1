$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host "Installing Solana CLI (Windows) from latest GitHub release..."

# Get latest release tag
$release = Invoke-RestMethod 'https://api.github.com/repos/solana-labs/solana/releases/latest'
$tag = $release.tag_name
if (-not $tag) { throw 'Unable to determine latest Solana release tag.' }
Write-Host "Latest release: $tag"

# Download Windows archive
$tarUrl = "https://github.com/solana-labs/solana/releases/download/$tag/solana-release-x86_64-pc-windows-msvc.tar.bz2"
$tarPath = Join-Path $env:TEMP 'solana-release-x86_64-pc-windows-msvc.tar.bz2'
Write-Host "Downloading: $tarUrl"
Invoke-WebRequest -Uri $tarUrl -OutFile $tarPath
Write-Host "Downloaded to: $tarPath"

# Extract to user-local install dir
$installRoot = Join-Path $env:USERPROFILE '.local\share\solana\install'
New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
Write-Host "Extracting to: $installRoot"
tar -xjf $tarPath -C $installRoot
Write-Host 'Extraction complete.'

# Locate solana.exe
$solExe = Get-ChildItem -Path $installRoot -Recurse -Filter solana.exe | Select-Object -First 1 -ExpandProperty FullName
if (-not $solExe) { throw 'solana.exe not found after extraction.' }
$solBin = Split-Path $solExe -Parent
Write-Host "Found solana.exe at: $solExe"

# Update PATH for current session and print version
if ((";$env:Path;").IndexOf(";$solBin;", [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
  $env:Path = "$solBin;$env:Path"
}

& $solExe --version

Write-Host 'Solana CLI installed for current session.'

