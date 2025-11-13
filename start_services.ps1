# PowerShell script to start all services for SurfTutorApp
Write-Host "=========================================="
Write-Host "Starting SurfTutorApp Services"
Write-Host "=========================================="
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Stop existing services on ports 3000 and 8000
Write-Host "Checking for existing services..."
if (Test-Port -Port 3000) {
    Write-Host "Stopping existing service on port 3000..."
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $processes) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

if (Test-Port -Port 8000) {
    Write-Host "Stopping existing service on port 8000..."
    $processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $processes) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Starting Backend Server (Port 3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm start" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "Starting Model Server (Port 8000)..."
Set-Location $backendDir
if (Test-Path .venv\Scripts\python.exe) {
    $python = ".venv\Scripts\python.exe"
    Write-Host "Using venv Python"
} else {
    $python = "python"
    Write-Host "Using system Python"
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; & '$python' -m uvicorn model_server:app --host 127.0.0.1 --port 8000" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=========================================="
Write-Host "Services Starting..."
Write-Host "=========================================="
Write-Host "Backend Server: http://127.0.0.1:3000"
Write-Host "Model Server: http://127.0.0.1:8000"
Write-Host ""
Write-Host "Waiting 15 seconds for services to initialize..."
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Checking service status..."
$backendOk = $false
$modelOk = $false

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Backend Server: RUNNING"
    $backendOk = $true
} catch {
    Write-Host "❌ Backend Server: NOT RUNNING"
    Write-Host "   Error: $($_.Exception.Message)"
    Write-Host "   Check the backend PowerShell window for errors"
}

try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Model Server: RUNNING"
    Write-Host "   Response: $($response.Content)"
    $modelOk = $true
} catch {
    Write-Host "❌ Model Server: NOT RUNNING"
    Write-Host "   Error: $($_.Exception.Message)"
    Write-Host "   Check the model server PowerShell window for errors"
}

Write-Host ""
if ($backendOk -and $modelOk) {
    Write-Host "=========================================="
    Write-Host "✅ All services are running!"
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Ensure ADB reverse is set up:"
    Write-Host "   adb reverse tcp:3000 tcp:3000"
    Write-Host "   adb reverse tcp:8081 tcp:8081"
    Write-Host ""
    Write-Host "2. Run the app: npm run android"
} else {
    Write-Host "=========================================="
    Write-Host "⚠️  Some services failed to start"
    Write-Host "Check the PowerShell windows for errors"
    Write-Host "=========================================="
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

