# PowerShell script to start the Python model server
Write-Host "Starting Python Model Server..."
Write-Host "Working directory: $PSScriptRoot"
Set-Location $PSScriptRoot

# Check if venv exists
if (Test-Path .venv\Scripts\python.exe) {
    Write-Host "Using virtual environment Python"
    $pythonExe = ".venv\Scripts\python.exe"
} else {
    Write-Host "Using system Python"
    $pythonExe = "python"
}

# Check Python version
Write-Host "Python version:"
& $pythonExe --version

# Check if uvicorn is available
Write-Host "Checking for uvicorn..."
try {
    & $pythonExe -m uvicorn --version
    Write-Host "Uvicorn found"
} catch {
    Write-Host "ERROR: Uvicorn not found. Installing..."
    & $pythonExe -m pip install uvicorn fastapi
}

# Start the server
Write-Host ""
Write-Host "Starting model server on http://127.0.0.1:8000"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

& $pythonExe -m uvicorn model_server:app --host 127.0.0.1 --port 8000 --reload

