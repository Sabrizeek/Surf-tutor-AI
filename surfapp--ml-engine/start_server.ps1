# Surf AI ML Model Server Startup Script (PowerShell)

Write-Host "Starting Surf AI ML Model Server..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
}

# Start the server
python start_server.py

