# How to Start All Services

## Quick Start (All Services)

### 1. Start ML Services (Both Cardio AI + Pose Detection)

**Option A: Unified Script (Recommended)**
```bash
cd surfapp--ml-engine
python start_all_services.py
```

**Option B: Start Separately**
```bash
# Terminal 1: Cardio AI
cd surfapp--ml-engine
python start_server.py

# Terminal 2: Pose Detection
cd surfapp--ml-engine
python start_pose_server.py
```

**Windows:**
- `start_all_services.bat` - Starts both
- `start_server.bat` - Cardio AI only
- `start_pose_server.bat` - Pose Detection only

### 2. Start Backend Server

```bash
cd surfapp--backend
npm start
```

Backend will run on: http://localhost:3000

### 3. Start Frontend

```bash
cd SurfApp--frontend
npx expo run:android
```

Or for development:
```bash
npx expo start
```

## Service Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Cardio AI | 8000 | http://localhost:8000 | ✅ Running |
| Pose Detection | 8001 | http://localhost:8001 | ✅ Running |
| Backend API | 3000 | http://localhost:3000 | ✅ Running |
| Frontend | 8081 | Metro Bundler | Building... |

## Health Checks

Test if services are running:

```bash
# Cardio AI
curl http://localhost:8000/health

# Pose Detection
curl http://localhost:8001/health

# Backend
curl http://localhost:3000/health
```

All should return `{"status": "ok"}`

## Troubleshooting

### ML Services Not Starting

1. **Unicode Errors**: Fixed in latest version - scripts now handle Windows encoding
2. **Port Already in Use**: 
   ```bash
   # Windows
   netstat -ano | findstr ":8000"
   # Kill process if needed
   taskkill /PID <PID> /F
   ```
3. **Import Errors**: Make sure you're in `surfapp--ml-engine` directory
4. **Dependencies**: Run `pip install -r requirements.txt`

### Backend Not Starting

1. Check MongoDB is running (if using local DB)
2. Check `.env` file exists in `surfapp--backend`
3. Check port 3000 is not in use

### Frontend Build Errors

1. **React Native Reanimated**: Already fixed - `react-native-worklets` installed
2. **Metro Bundler**: Run `npx expo start --clear`
3. **Android Build**: Run `npx expo prebuild --clean` then rebuild

## Notes

- **ML Services**: Must start BOTH Cardio AI (8000) and Pose Detection (8001)
- **Backend**: Connects to both ML services automatically
- **Frontend**: Connects to backend on port 3000
- **Physical Device**: Update IP in `SurfApp--frontend/services/api.ts` (currently `192.168.8.102`)

