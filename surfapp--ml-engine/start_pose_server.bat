@echo off
echo Starting Surf AI Pose Detection Server...
echo.

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Start the server
python start_pose_server.py

pause

