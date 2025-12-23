# ML Services Summary

## Answer to Your Question

**Q: When I start the ML, will it start both cardio AI and pose estimation AI?**

**A: NO - By default, they are separate services that need to be started individually.**

However, I've created a **unified startup script** that starts BOTH services together!

## Two ML Services

### 1. Cardio AI (Model Server) - Port 8000
- **Purpose:** AI-powered workout plan recommendations
- **Technology:** Scikit-learn ML models
- **Startup:** `python start_server.py` or `start_server.bat`
- **Health:** http://localhost:8000/health
- **Endpoint:** POST http://localhost:8000/predict

### 2. Pose Detection Server - Port 8001
- **Purpose:** Real-time pose estimation using MediaPipe
- **Technology:** MediaPipe BlazePose
- **Startup:** `python start_pose_server.py` or `start_pose_server.bat`
- **Health:** http://localhost:8001/health
- **Endpoint:** POST http://localhost:8001/detect

## Unified Startup (NEW! ⭐)

I've created `start_all_services.py` that starts **BOTH services simultaneously**:

```bash
cd surfapp--ml-engine
python start_all_services.py
```

**Windows:**
```bash
start_all_services.bat
# OR
.\start_all_services.ps1
```

This script:
- ✅ Starts Cardio AI on port 8000
- ✅ Starts Pose Detection on port 8001
- ✅ Monitors both services
- ✅ Stops both with Ctrl+C

## Backend Integration

The backend (`surfapp--backend`) connects to both services:

- **Cardio Plans** → Backend → Model Server (8000)
- **Pose Detection** → Backend → Pose Server (8001)

See `surfapp--backend/config/constants.js`:
```javascript
MODEL_SERVER_URL: 'http://127.0.0.1:8000/predict'  // Cardio AI
POSE_SERVER_URL: 'http://127.0.0.1:8001/detect'    // Pose Detection
```

## Quick Reference

| Service | Port | Startup Script | Purpose |
|---------|------|----------------|---------|
| Cardio AI | 8000 | `start_server.py` | Workout recommendations |
| Pose Detection | 8001 | `start_pose_server.py` | Pose estimation |
| **Both** | **8000 + 8001** | **`start_all_services.py`** ⭐ | **Start everything** |

## Verification

After starting services, verify they're running:

```bash
# Check Cardio AI
curl http://localhost:8000/health

# Check Pose Detection
curl http://localhost:8001/health
```

Both should return `{"status": "ok"}`.

