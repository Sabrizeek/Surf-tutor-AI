# PowerShell script to restart backend
Write-Host "Stopping existing Node processes on port 3000..."
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process $pid"
}

Start-Sleep -Seconds 2

Write-Host "Starting backend server..."
Set-Location $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Write-Host "Backend restart initiated. Check the new window for server output."

