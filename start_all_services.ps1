# PowerShell script to start all services for Surf Tutor AI
# Uses the location where the script is located

# Get the directory where this script is located
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Using project location: $scriptRoot" -ForegroundColor Cyan

Write-Host "`nStarting Surf Tutor AI Services..." -ForegroundColor Green
Write-Host "Project Location: $scriptRoot" -ForegroundColor Cyan

# Check if Python is available
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Verify directory structure
if (-not (Test-Path "$scriptRoot\backend")) {
    Write-Host "Error: backend folder not found at $scriptRoot\backend" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct project directory." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "$scriptRoot\ai_training")) {
    Write-Host "Error: ai_training folder not found at $scriptRoot\ai_training" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct project directory." -ForegroundColor Yellow
    exit 1
}

# Start Model Server (Python FastAPI)
Write-Host "`n[1/3] Starting Model Server (Python FastAPI)..." -ForegroundColor Yellow
Write-Host "  Location: $scriptRoot\backend" -ForegroundColor Gray
Start-Process python -ArgumentList "$scriptRoot\backend\start_model_server.py" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start Backend Server (Node.js)
Write-Host "[2/3] Starting Backend Server (Node.js)..." -ForegroundColor Yellow
Write-Host "  Location: $scriptRoot\backend" -ForegroundColor Gray
Set-Location "$scriptRoot\backend"
Start-Process npm -ArgumentList "start" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start Frontend (React Native Metro)
Write-Host "[3/3] Starting Frontend Metro Bundler..." -ForegroundColor Yellow
# Check if React Native app is in SurfTutorApp subfolder or at root
if (Test-Path "$scriptRoot\SurfTutorApp\package.json") {
    $frontendPath = "$scriptRoot\SurfTutorApp"
    Write-Host "  Location: $frontendPath (SurfTutorApp subfolder)" -ForegroundColor Gray
} elseif (Test-Path "$scriptRoot\package.json") {
    $frontendPath = "$scriptRoot"
    Write-Host "  Location: $frontendPath (root)" -ForegroundColor Gray
} else {
    Write-Host "  Warning: Could not find React Native app" -ForegroundColor Yellow
    $frontendPath = "$scriptRoot"
}
Set-Location "$frontendPath"
Start-Process npm -ArgumentList "start" -WindowStyle Normal

Write-Host "`nAll services are starting..." -ForegroundColor Green
Write-Host "`nModel Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend Server: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: React Native Metro Bundler" -ForegroundColor Cyan
Write-Host "`nTo run the app on device/emulator:" -ForegroundColor Yellow
if (Test-Path "$scriptRoot\SurfTutorApp\package.json") {
    Write-Host "  cd $scriptRoot\SurfTutorApp" -ForegroundColor White
} else {
    Write-Host "  cd $scriptRoot" -ForegroundColor White
}
Write-Host "  npm run android  (for Android)" -ForegroundColor White
Write-Host "  npm run ios      (for iOS)" -ForegroundColor White

Set-Location $scriptRoot
