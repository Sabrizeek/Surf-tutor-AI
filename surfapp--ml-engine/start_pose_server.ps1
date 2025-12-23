# Surf AI Pose Detection Server Startup Script (PowerShell)

Write-Host "Starting Surf AI Pose Detection Server..." -ForegroundColor Cyan
Write-Host ""

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
}

# Start the server
python start_pose_server.py

