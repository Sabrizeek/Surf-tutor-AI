# Simple script to start model server
Write-Host "Starting Python Model Server..."
Set-Location $PSScriptRoot

# Determine Python executable
if (Test-Path .venv\Scripts\python.exe) {
    $python = ".venv\Scripts\python.exe"
    Write-Host "Using venv Python: $python"
} else {
    $python = "python"
    Write-Host "Using system Python: $python"
}

# Check if uvicorn is installed
Write-Host "Checking dependencies..."
& $python -m pip show uvicorn fastapi joblib pandas scikit-learn 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..."
    & $python -m pip install uvicorn fastapi joblib pandas scikit-learn
}

# Start server
Write-Host ""
Write-Host "=========================================="
Write-Host "Starting Model Server on http://127.0.0.1:8000"
Write-Host "Press Ctrl+C to stop"
Write-Host "=========================================="
Write-Host ""

& $python -m uvicorn model_server:app --host 127.0.0.1 --port 8000

