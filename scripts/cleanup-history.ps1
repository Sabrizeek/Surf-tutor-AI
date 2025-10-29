<#
PowerShell script to automate git history cleanup using git-filter-repo.

USAGE: Run this from the repository root (the folder that contains .git)
  PS> Set-Location 'C:\path\to\repo'
  PS> .\scripts\cleanup-history.ps1

This script will:
- verify you're in a git repository
- prompt for confirmation
- install git-filter-repo (via pip) if it's not available
- run git-filter-repo with the provided replace.txt in the repo root
- perform git reflog expire and git gc

IMPORTANT: rotate credentials (MongoDB user password) BEFORE or IMMEDIATELY AFTER running this script.

#>
param()

function Abort([string]$msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path .git)) {
    Abort("No .git directory found. Run this script from your repository root (the clone that contains .git).")
}

Write-Host "This will rewrite git history in the current repository. This is destructive and requires force-pushing to update the remote." -ForegroundColor Yellow
Write-Host "Make sure you have rotated any leaked credentials (e.g. MongoDB user) BEFORE running this. Continue? (Y/N)"
$c = Read-Host
if ($c -notin @('Y','y')) { Write-Host 'Aborted by user.'; exit 0 }

# ensure replace.txt exists
$replaceFile = Join-Path (Get-Location) 'replace.txt'
if (-not (Test-Path $replaceFile)) {
    Abort("$replaceFile not found. Create a replace.txt mapping file in the repo root with lines of the form OLD==>NEW.")
}

Write-Host "Checking for git-filter-repo..."
$gfr = (Get-Command git-filter-repo -ErrorAction SilentlyContinue)
if (-not $gfr) {
    Write-Host "git-filter-repo not found on PATH. Installing via pip (user) ..." -ForegroundColor Cyan
    python -m pip install --user git-filter-repo | Out-Null
    if ($LASTEXITCODE -ne 0) { Abort('Failed to install git-filter-repo via pip. Install it manually or ensure Python/pip are available.') }
}

Write-Host "Running git-filter-repo using $replaceFile ..." -ForegroundColor Cyan
# Run via python module to avoid PATH issues
python -m git_filter_repo --replace-text "$replaceFile"
if ($LASTEXITCODE -ne 0) { Abort('git-filter-repo failed. See output above.') }

Write-Host "Running git reflog expire and git gc ..." -ForegroundColor Cyan
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "History rewritten locally. Review commits now (e.g. git log) before force-pushing." -ForegroundColor Green
Write-Host "When ready, force-push to update remote (coordinate with collaborators):" -ForegroundColor Yellow
Write-Host "  git push --force --all" -ForegroundColor White
Write-Host "  git push --force --tags" -ForegroundColor White

Write-Host "DONE. Remember to alert collaborators and have them re-clone the repo." -ForegroundColor Green
