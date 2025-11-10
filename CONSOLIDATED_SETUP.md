# Consolidated Setup Guide

## ✅ Project Location

All files are now consolidated in one location to avoid path length issues:

**Location:** `C:\dev\SurfTutorApp\`

## 📁 Directory Structure

```
C:\dev\SurfTutorApp\
├── package.json              # React Native app (root)
├── App.tsx                   # React Native app entry
├── src\                      # React Native source code
│   ├── navigation\
│   ├── screens\
│   ├── services\
│   └── types\
├── android\                  # Android native files
├── ios\                      # iOS native files
├── backend\                  # Node.js + Python backend
│   ├── server.js            # Express server
│   ├── model_server.py      # FastAPI model server
│   ├── start_model_server.py
│   ├── package.json
│   ├── requirements.txt
│   └── routes\
└── ai_training\              # ML models
    ├── recommender_model.joblib
    ├── skill_encoder.joblib
    ├── goal_encoder.joblib
    ├── exercise_encoder.joblib
    └── cardio_plans_1000.csv
```

## 🔗 Path References

### Model Server → AI Training
```python
# backend/model_server.py
BASE_DIR = os.path.dirname(__file__)  # backend/
MODEL_DIR = os.path.join(BASE_DIR, '..', 'ai_training')  # ../ai_training
```
**Resolves to:** `C:\dev\SurfTutorApp\ai_training\`

### Backend Server → Model Server
```javascript
// backend/server.js
const modelUrl = process.env.MODEL_SERVER_URL || 'http://127.0.0.1:8000/predict';
```

### Frontend → Backend
```typescript
// src/services/api.ts
// Android Emulator: http://10.0.2.2:3000
// iOS Simulator: http://localhost:3000
```

## 🚀 Quick Start

### 1. Verify Setup
```powershell
cd C:\dev\SurfTutorApp
.\verify_setup.ps1
```

### 2. Install Dependencies

**Backend:**
```powershell
cd C:\dev\SurfTutorApp\backend
npm install
pip install -r requirements.txt
```

**Frontend:**
```powershell
cd C:\dev\SurfTutorApp
npm install
```

### 3. Start All Services
```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

### 4. Run App
```powershell
cd C:\dev\SurfTutorApp
npm run android  # or npm run ios
```

## ✅ Verification Checklist

- [ ] All directories exist in `C:\dev\SurfTutorApp\`
- [ ] Model files exist in `ai_training\`
- [ ] Backend dependencies installed (`backend\node_modules`)
- [ ] Frontend dependencies installed (`node_modules`)
- [ ] Python dependencies installed
- [ ] Model Server runs on port 8000
- [ ] Backend Server runs on port 3000
- [ ] Frontend Metro runs successfully

## 🔧 Troubleshooting

### "Model file not found"
- Verify `ai_training` folder is at `C:\dev\SurfTutorApp\ai_training\`
- Check model files exist
- Verify path in `backend/model_server.py` (should be `../ai_training`)

### "Cannot connect to backend"
- Check backend is running: http://localhost:3000/health
- For Android emulator, API uses `10.0.2.2:3000`
- For physical device, update API URL with your computer's IP

### "Path too long" errors
- You're in the right place! `C:\dev\SurfTutorApp\` has short paths
- If still having issues, enable Windows long path support

### "Module not found"
- Run `npm install` in the correct directory
- For backend: `cd backend && npm install`
- For frontend: `cd C:\dev\SurfTutorApp && npm install`

## 📝 Important Notes

1. **Single Location**: Everything is in `C:\dev\SurfTutorApp\` - no duplication needed
2. **Relative Paths**: All path references use relative paths, so they work from any location
3. **Shorter Paths**: This location avoids Windows 260-character path limit
4. **No Duplication**: Don't copy files between locations - everything is in one place

## 🎯 Next Steps

1. Run `.\verify_setup.ps1` to check everything
2. Install dependencies if needed
3. Start services with `.\start_all_services.ps1`
4. Run the app on device/emulator

For detailed information, see:
- `README_SETUP.md` - Full setup guide
- `QUICK_START.md` - Quick reference
- `MIGRATION_GUIDE.md` - Migration details

