# Quick Start Guide - Surf Tutor AI

## 🚀 Quick Setup (5 minutes)

### 1. Navigate to Project

```bash
cd C:\dev\SurfTutorApp
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
pip install -r requirements.txt
```

**Frontend:**
```bash
cd C:\dev\SurfTutorApp  # Back to root
npm install
```

### 3. Verify Models Exist

Check that these files exist in `C:\dev\SurfTutorApp\ai_training\`:
- `recommender_model.joblib`
- `skill_encoder.joblib`
- `goal_encoder.joblib`
- `exercise_encoder.joblib`

If missing, run:
```bash
cd C:\dev\SurfTutorApp\ai_training
python finalize_model.py
```

### 4. Verify Setup (Optional)

```powershell
cd C:\dev\SurfTutorApp
.\verify_setup.ps1
```

### 5. Start All Services

**Windows (PowerShell):**
```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

**Manual (3 terminals):**

Terminal 1 - Model Server:
```bash
cd C:\dev\SurfTutorApp\backend
python start_model_server.py
```

Terminal 2 - Backend Server:
```bash
cd C:\dev\SurfTutorApp\backend
npm start
```

Terminal 3 - Frontend:
```bash
cd C:\dev\SurfTutorApp
npm start
```

Terminal 4 - Run App:
```bash
cd C:\dev\SurfTutorApp
npm run android  # or npm run ios
```

## ✅ Verify Everything Works

1. **Model Server**: http://localhost:8000/health
   - Should return: `{"status":"ok","modelLoaded":true}`

2. **Backend Server**: http://localhost:3000/health
   - Should return: `{"status":"ok"}`

3. **Frontend**: App should launch on device/emulator

## 🔧 Common Issues

### "Cannot connect to backend"
- **Android Emulator**: API uses `10.0.2.2:3000` (already configured)
- **Physical Device**: Update `SurfTutorApp/src/services/api.ts` with your computer's IP address
- **iOS Simulator**: Should work with `localhost:3000`

### "Model server not found"
- Check Model Server is running on port 8000
- Verify model files exist in `C:\dev\SurfTutorApp\ai_training\`

### "Camera not working"
- Grant camera permissions in device settings
- For Android: Permissions are in `android/app/src/main/AndroidManifest.xml`
- For iOS: Check `ios/SurfTutorApp/Info.plist` has camera description

### "Path too long" errors
- Make sure you're running from `C:\dev\SurfTutorApp\`
- This location has shorter paths than OneDrive locations
- If still having issues, enable long path support in Windows

## 📱 Testing Features

1. **Cardio Plans**: 
   - Go to Cardio tab
   - Select skill level and goal
   - Enter optional physical details
   - Get AI recommendations

2. **AR Visualization**: 
   - Go to AR tab
   - Select a technique
   - (FBX models coming soon)

3. **Pose Practice**: 
   - Go to Practice tab
   - Select a drill
   - Grant camera permission
   - Practice with real-time feedback

4. **Progress**: 
   - Go to Progress tab
   - View stats, drills, scores, badges

## 🎯 Next Steps

- Integrate FBX models for AR
- Add pose estimation library (MediaPipe)
- Enhance gamification
- Add more workout plans

For detailed setup, see `README_SETUP.md`

