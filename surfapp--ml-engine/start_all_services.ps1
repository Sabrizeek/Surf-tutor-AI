# Surf AI - ML Services Startup (PowerShell)
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Surf AI - ML Services Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting both ML services:" -ForegroundColor Yellow
Write-Host "  1. Cardio AI (Model Server) - Port 8000" -ForegroundColor Green
Write-Host "  2. Pose Detection Server - Port 8001" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

python start_all_services.py

