@echo off
echo Starting Surf AI ML Model Server...
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Start the server
python start_server.py

pause

