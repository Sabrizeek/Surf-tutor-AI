# Surf AI ML Services - Startup Guide

## Overview

The ML engine consists of **TWO separate services** that need to be started:

1. **Cardio AI (Model Server)** - Port 8000
   - Provides AI-powered cardio workout plan recommendations
   - Uses machine learning models trained on exercise data
   - Endpoint: `POST /predict`

2. **Pose Detection Server** - Port 8001
   - Provides real-time pose estimation using MediaPipe
   - Processes images and returns body landmarks
   - Endpoint: `POST /detect`

## Quick Start - Start Both Services

### Option 1: Unified Startup Script (Recommended)

**Windows:**
```bash
cd surfapp--ml-engine
start_all_services.bat
```

**PowerShell:**
```powershell
cd surfapp--ml-engine
.\start_all_services.ps1
```

**Python (Cross-platform):**
```bash
cd surfapp--ml-engine
python start_all_services.py
```

This will start **both services simultaneously** in the same terminal.

### Option 2: Start Services Separately

**Start Cardio AI (Port 8000):**
```bash
cd surfapp--ml-engine
python start_server.py
# OR
start_server.bat
```

**Start Pose Detection (Port 8001):**
```bash
cd surfapp--ml-engine
python start_pose_server.py
# OR
start_pose_server.bat
```

## Service URLs

### Cardio AI (Model Server)
- **Base URL:** http://localhost:8000
- **Health Check:** http://localhost:8000/health
- **Predict:** POST http://localhost:8000/predict
  ```json
  {
    "skillLevel": "Beginner",
    "goal": ["Endurance", "Power"],
    "userDetails": {
      "age": 25,
      "height": 183,
      "weight": 85,
      "bmi": 25.4
    }
  }
  ```

### Pose Detection Server
- **Base URL:** http://localhost:8001
- **Health Check:** http://localhost:8001/health
- **Detect:** POST http://localhost:8001/detect
  ```json
  {
    "image": "base64_encoded_image_string",
    "drillId": "stance" // optional
  }
  ```

## Backend Configuration

The backend (`surfapp--backend`) is configured to proxy requests to these services:

- **Cardio Plans:** Backend → Model Server (port 8000)
- **Pose Detection:** Backend → Pose Server (port 8001)

See `surfapp--backend/config/constants.js`:
- `MODEL_SERVER_URL`: http://127.0.0.1:8000/predict
- `POSE_SERVER_URL`: http://127.0.0.1:8001/detect

## Requirements

Make sure you have installed Python dependencies:
```bash
cd surfapp--ml-engine
pip install -r requirements.txt
```

Required packages:
- `fastapi`
- `uvicorn`
- `mediapipe` (for pose detection)
- `joblib` (for cardio AI models)
- `pandas`
- `numpy`
- `opencv-python`
- `Pillow`

## Stopping Services

Press `Ctrl+C` in the terminal where services are running.

If using the unified startup script, it will stop both services together.

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
- Check if services are already running: `netstat -ano | findstr :8000` (Windows)
- Kill the process or use different ports

### Import Errors
- Make sure you're in the `surfapp--ml-engine` directory
- Verify `services/` directory exists with all Python files
- Check that all dependencies are installed

### Model Files Missing
- Cardio AI requires model files in `models/` directory
- Pose Detection uses MediaPipe (no model files needed)

## Development Notes

- Both services use FastAPI and support CORS
- Services run independently and can be started/stopped separately
- The unified script (`start_all_services.py`) manages both processes
- Health check endpoints are available for monitoring

