# Pose Detection Setup Guide

## Overview
This guide explains how to set up and run the server-side MediaPipe pose detection system.

## Architecture
- **Pose Detection Server** (Python/FastAPI): Runs on port 8001, processes images using MediaPipe
- **Backend API** (Node.js/Express): Runs on port 3000, proxies requests to pose server
- **Frontend** (React Native): Captures camera frames and sends to backend

## Prerequisites
1. Python 3.8+ installed
2. Node.js installed
3. All Python dependencies installed

## Installation

### 1. Install Python Dependencies
```bash
cd surfapp--ml-engine
pip install -r requirements.txt
```

Required packages:
- fastapi
- uvicorn
- opencv-python
- mediapipe
- Pillow
- numpy

### 2. Verify Node.js Backend Dependencies
The backend already has `node-fetch` installed, which is required for proxying requests.

## Running the Services

### Step 1: Start Pose Detection Server
```bash
cd surfapp--ml-engine
python start_pose_server.py
```

Or use the batch/PowerShell scripts:
- Windows: `start_pose_server.bat` or `start_pose_server.ps1`

The server will start on **http://localhost:8001**

### Step 2: Start Backend Server
```bash
cd surfapp--backend
npm start
```

The backend will start on **http://localhost:3000**

### Step 3: Start Frontend (Expo)
```bash
cd SurfApp--frontend
npx expo start
```

## Testing

### Health Check
Test the pose detection server:
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "pose-detection",
  "model": "MediaPipe Pose"
}
```

### Test Pose Detection
```bash
# First, encode an image to base64, then:
curl -X POST http://localhost:8001/detect \
  -H "Content-Type: application/json" \
  -d '{"image": "BASE64_IMAGE_STRING", "drillId": "stance"}'
```

## Troubleshooting

### Issue: "Cannot connect to pose detection server"
- Ensure the pose server is running on port 8001
- Check firewall settings
- Verify Python dependencies are installed

### Issue: "Import error in pose_server.py"
- Make sure you're running from the `surfapp--ml-engine` directory
- Check that `pose_detection.py` exists in the `services` folder

### Issue: "MediaPipe not found"
- Install MediaPipe: `pip install mediapipe`
- Ensure you're using Python 3.8+

### Issue: Slow performance
- The current implementation captures photos every 200ms (5 FPS)
- For better performance, consider implementing frame processors (requires native code)

## Performance Notes
- Current frame rate: ~5 FPS (limited by API call latency)
- Photo capture method: Uses `takePhoto()` API
- Future optimization: Implement frame processors for real-time processing

## File Structure
```
surfapp--ml-engine/
├── services/
│   ├── pose_detection.py    # MediaPipe pose detection logic
│   └── pose_server.py        # FastAPI server
├── start_pose_server.py     # Startup script
└── requirements.txt          # Python dependencies
```

