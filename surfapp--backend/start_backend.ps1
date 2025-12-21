# Backend Server Startup Script
Write-Host "Starting Surf AI Backend Server..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting server on port 3000..." -ForegroundColor Green
node server.js


