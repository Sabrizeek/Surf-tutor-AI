# Migration Guide - Consolidated Location

## New Project Structure

All files are now consolidated in one location to avoid path length issues:

```
C:\dev\SurfTutorApp\
├── package.json              # React Native app
├── App.tsx                   # React Native app
├── src\                      # React Native source files
├── android\                  # Android native files
├── ios\                      # iOS native files
├── backend\                  # Node.js + Python backend
│   ├── server.js
│   ├── model_server.py
│   ├── start_model_server.py
│   ├── package.json
│   └── requirements.txt
└── ai_training\              # ML models and training
    ├── recommender_model.joblib
    ├── skill_encoder.joblib
    ├── goal_encoder.joblib
    ├── exercise_encoder.joblib
    └── cardio_plans_1000.csv
```

## Path References

### Model Server Path
The `backend/model_server.py` uses relative paths:
```python
BASE_DIR = os.path.dirname(__file__)  # backend/
MODEL_DIR = os.path.join(BASE_DIR, '..', 'ai_training')  # ../ai_training
```

This correctly resolves to `C:\dev\SurfTutorApp\ai_training\` from `C:\dev\SurfTutorApp\backend\`.

### Backend Server
The `backend/server.js` connects to the model server at:
- Default: `http://127.0.0.1:8000/predict`
- Configurable via `MODEL_SERVER_URL` environment variable

### Frontend API
The React Native app connects to the backend at:
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Physical Device: Update with your computer's IP

## Running from New Location

### Quick Start
```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

### Manual Start

**Terminal 1 - Model Server:**
```bash
cd C:\dev\SurfTutorApp\backend
python start_model_server.py
```

**Terminal 2 - Backend Server:**
```bash
cd C:\dev\SurfTutorApp\backend
npm start
```

**Terminal 3 - Frontend Metro:**
```bash
cd C:\dev\SurfTutorApp
npm start
```

**Terminal 4 - Run App:**
```bash
cd C:\dev\SurfTutorApp
npm run android  # or npm run ios
```

## Verification

1. **Check Model Server:**
   - Open: http://localhost:8000/health
   - Should return: `{"status":"ok","modelLoaded":true}`

2. **Check Backend Server:**
   - Open: http://localhost:3000/health
   - Should return: `{"status":"ok"}`

3. **Check Model Files:**
   ```powershell
   Test-Path C:\dev\SurfTutorApp\ai_training\recommender_model.joblib
   Test-Path C:\dev\SurfTutorApp\ai_training\skill_encoder.joblib
   Test-Path C:\dev\SurfTutorApp\ai_training\goal_encoder.joblib
   Test-Path C:\dev\SurfTutorApp\ai_training\exercise_encoder.joblib
   ```

## Troubleshooting

### "Model file not found"
- Verify `ai_training` folder is at `C:\dev\SurfTutorApp\ai_training\`
- Check model files exist in that folder
- Verify path in `backend/model_server.py` (should be `../ai_training`)

### "Cannot connect to backend"
- Check backend is running on port 3000
- For Android emulator, verify API uses `10.0.2.2:3000`
- For physical device, update API URL with your computer's IP

### "Path too long" errors
- Make sure you're running from `C:\dev\SurfTutorApp\`
- This location has shorter paths than the original OneDrive location
- If still having issues, enable long path support in Windows

## Benefits of Consolidated Location

1. **Shorter Paths**: `C:\dev\SurfTutorApp\` is much shorter than `C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project\`
2. **Single Location**: Everything in one place, easier to manage
3. **No Duplication**: No need to copy files between locations
4. **Simpler Scripts**: All startup scripts work from one root directory

