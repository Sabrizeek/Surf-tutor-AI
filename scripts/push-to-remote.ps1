<#
PowerShell helper to initialize git (if missing), ensure .env is ignored, add remote, commit and push to GitHub.

USAGE:
  1) Review repository and ensure secrets are rotated (rotate MongoDB password if previously leaked).
  2) From repo root run:
     .\scripts\push-to-remote.ps1 -RemoteUrl 'https://github.com/Sabrizeek/Surf-tutor-AI.git' -Branch main

This script will:
 - Ensure .gitignore contains entries for .env and node_modules
 - Initialize git if necessary
 - Add all files, commit with a default message, and push to the provided remote URL and branch

IMPORTANT: This will create commits and may force-push if you choose so; read prompts carefully.
#>

param(
  [string]$RemoteUrl = 'https://github.com/Sabrizeek/Surf-tutor-AI.git',
  [string]$Branch = 'main'
)

function Abort($msg){ Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

if (-not (Test-Path .git)) {
  Write-Host "No .git found. This script will initialize a new git repository." -ForegroundColor Yellow
  $c = Read-Host "Initialize git repo here? (Y/N)"
  if ($c -notin @('Y','y')) { Abort('User aborted git init') }
  git init
}

# Ensure .gitignore contains .env
$gi = Get-Content .gitignore -ErrorAction SilentlyContinue
if ($gi -notmatch '\.env') {
  Write-Host 'Adding .env patterns to .gitignore' -ForegroundColor Cyan
  Add-Content -Path .gitignore -Value "`n# Local env files`n**/.env`nbackend/.env`nSurfTutorApp/.env"
}

Write-Host "About to add, commit and push your current working tree to: $RemoteUrl on branch $Branch" -ForegroundColor Green
$confirm = Read-Host "Proceed with commit and push? (Y/N)"
if ($confirm -notin @('Y','y')) { Abort('User aborted') }

git add -A
try {
  git commit -m "chore: project sync from local workspace" -q
} catch {
  Write-Host "No changes to commit or commit failed: $_" -ForegroundColor Yellow
}

# Add or update remote
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Remote 'origin' already exists: $existing" -ForegroundColor Cyan
  $c2 = Read-Host "Replace remote origin with $RemoteUrl? (Y/N)"
  if ($c2 -in @('Y','y')) { git remote set-url origin $RemoteUrl }
} else {
  git remote add origin $RemoteUrl
}

Write-Host "Now pushing to origin/$Branch" -ForegroundColor Green
$pushConfirm = Read-Host "Force push if necessary? Choose 'y' to force, 'n' to attempt normal push"
if ($pushConfirm -in @('y','Y')) {
  git push origin HEAD:$Branch --force
} else {
  git push origin HEAD:$Branch
}

Write-Host "Push complete. If this is the first push you may need to set default branch on GitHub or create a PR." -ForegroundColor Green
