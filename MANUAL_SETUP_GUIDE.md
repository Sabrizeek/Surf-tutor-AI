# 🚀 SurfTutorApp - Manual Setup Guide

This guide will help you run the SurfTutorApp manually on your Android device.

## 📋 Prerequisites

1. **Node.js** installed (v16 or higher)
2. **Python 3.8+** installed
3. **Android SDK** installed (via Android Studio)
4. **ADB** (Android Debug Bridge) in PATH or accessible
5. **MongoDB** running (or MongoDB Atlas connection string)
6. **Physical Android device** connected via USB with USB debugging enabled

---

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

#### Frontend Dependencies
```powershell
cd C:\dev\SurfTutorApp
npm install
```

#### Backend Dependencies
```powershell
cd C:\dev\SurfTutorApp\backend
npm install
```

#### Python Dependencies (Model Server)
```powershell
cd C:\dev\SurfTutorApp\backend

# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

### Step 2: Configure Environment Variables

Create or update `.env` file in `backend/` directory:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=surf_ai
JWT_SECRET=your-secret-key-here-change-in-production
MODEL_SERVER_URL=http://127.0.0.1:8000/predict
PORT=3000
```

---

### Step 3: Start All Services

You need to run **3 separate terminal windows**:

#### Terminal 1: Backend Server (Node.js)
```powershell
cd C:\dev\SurfTutorApp\backend
npm start
```

**Expected output:**
```
🚀 Server is running on http://localhost:3000
```

**Verify it's running:**
- Open browser: `http://localhost:3000/health`
- Should return: `{"status":"ok"}`

---

#### Terminal 2: AI Model Server (Python)
```powershell
cd C:\dev\SurfTutorApp\backend

# Activate virtual environment
.venv\Scripts\activate

# Start model server
python -m uvicorn model_server:app --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Verify it's running:**
- Open browser: `http://localhost:8000/health`
- Should return: `{"status":"ok","modelLoaded":true}`

---

#### Terminal 3: Metro Bundler (React Native)
```powershell
cd C:\dev\SurfTutorApp
npx react-native start --reset-cache
```

**Expected output:**
```
Metro waiting on port 8081
```

**Keep this terminal open** - Metro bundler must stay running.

---

### Step 4: Configure ADB Reverse (Port Forwarding)

This allows your Android device to access localhost services on your computer.

```powershell
# Find ADB path (usually in Android SDK)
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

# Or if ANDROID_HOME is set:
# $adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"

# Configure port forwarding
& $adbPath reverse tcp:3000 tcp:3000
& $adbPath reverse tcp:8081 tcp:8081
& $adbPath reverse tcp:8000 tcp:8000

# Verify device is connected
& $adbPath devices
```

**Expected output:**
```
List of devices attached
R5CY20R47PJ    device
```

---

### Step 5: Build and Run Android App

In a **new terminal window**:

```powershell
cd C:\dev\SurfTutorApp
npm run android
```

This will:
1. Build the Android APK
2. Install it on your connected device
3. Launch the app

**First build may take 2-5 minutes.** Subsequent builds are faster.

---

## ✅ Verification Checklist

After starting all services, verify everything is working:

### 1. Check Services
```powershell
# Backend
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Model Server
curl http://localhost:8000/health
# Should return: {"status":"ok","modelLoaded":true}

# Metro (check if port is listening)
netstat -ano | findstr ":8081"
```

### 2. Check ADB Reverse
```powershell
adb reverse --list
```

Should show:
```
3000 tcp:3000
8081 tcp:8081
8000 tcp:8000
```

### 3. Check Device Connection
```powershell
adb devices
```

Should show your device listed.

---

## 🐛 Troubleshooting

### Issue: "Backend not responding"
**Solution:**
- Check if MongoDB is running
- Verify `.env` file has correct MONGODB_URI
- Check Terminal 1 for error messages
- Try: `cd backend && npm start`

### Issue: "Model server not responding"
**Solution:**
- Verify Python virtual environment is activated
- Check if model files exist: `ai_training/recommender_model.joblib`
- Check if CSV file exists: `ai_training/cardio_plans_1000.csv`
- Try: `cd backend && .venv\Scripts\python.exe -m uvicorn model_server:app --host 127.0.0.1 --port 8000`

### Issue: "Metro bundler port 8081 already in use"
**Solution:**
```powershell
# Kill process on port 8081
$conns = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($conns) {
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force
    }
}
# Then restart Metro
npx react-native start --reset-cache
```

### Issue: "ADB not found"
**Solution:**
- Install Android Studio
- Go to: Tools → SDK Manager → SDK Tools tab
- Check "Android SDK Platform-Tools"
- Add to PATH: `%LOCALAPPDATA%\Android\Sdk\platform-tools`

### Issue: "Device not detected"
**Solution:**
1. Enable USB Debugging on your phone:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. Connect phone via USB
3. Allow USB debugging when prompted on phone
4. Run: `adb devices`

### Issue: "App crashes on startup"
**Solution:**
- Check Metro bundler is running (Terminal 3)
- Check ADB reverse is configured
- Check backend and model server are running
- Clear app data: `adb shell pm clear com.surftutorapp`
- Reinstall: `npm run android`

---

## 📱 Testing the App

### 1. Registration Flow
1. Open app → Should show Login screen
2. Tap "Don't have an account? Register"
3. Fill in:
   - Email (required)
   - Password (required, min 6 chars)
   - Name (optional)
   - Age, Weight, Height (optional)
   - **Select multiple Goals** (tap multiple goal buttons)
   - Skill Level
4. Tap "Register"
5. Should redirect to Home screen

### 2. Login Flow
1. On Login screen
2. Enter registered email and password
3. Tap "Login"
4. Should redirect to Home screen

### 3. Profile Screen
1. Navigate to Profile tab (bottom navigation)
2. Should display:
   - Name, Email, Age, Height, Weight, BMI
   - Goals (comma-separated if multiple)
   - Skill Level
3. Tap edit icon → Can update all fields
4. **Select multiple goals** (tap multiple buttons with checkmarks)
5. Tap "Save"

### 4. Cardio Plans
1. Navigate to Cardio tab
2. Skill Level and Goals should be pre-filled from profile
3. **Select/deselect multiple goals** as needed
4. Tap "Get Recommendations"
5. Should display 3 structured workout plans with:
   - Plan name
   - Duration
   - Focus area
   - Equipment
   - Numbered exercise list

---

## 🔄 Quick Start Commands

### Start Everything (PowerShell Script)
Save this as `start-all.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\dev\SurfTutorApp\backend; npm start"

# Start Model Server
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\dev\SurfTutorApp\backend; .venv\Scripts\activate; python -m uvicorn model_server:app --host 127.0.0.1 --port 8000"

# Start Metro
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\dev\SurfTutorApp; npx react-native start --reset-cache"

# Configure ADB
Start-Sleep -Seconds 2
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb reverse tcp:3000 tcp:3000
& $adb reverse tcp:8081 tcp:8081
& $adb reverse tcp:8000 tcp:8000

Write-Host "All services starting..."
Write-Host "Wait 10 seconds, then run: npm run android"
```

Run it:
```powershell
.\start-all.ps1
```

---

## 📝 Service Ports Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend Server | 3000 | http://localhost:3000 | Node.js/Express API |
| Model Server | 8000 | http://localhost:8000 | Python FastAPI AI model |
| Metro Bundler | 8081 | http://localhost:8081 | React Native JS bundler |

---

## 🎯 Common Workflow

**Daily Development:**
1. Start Terminal 1: `cd backend && npm start`
2. Start Terminal 2: `cd backend && .venv\Scripts\activate && python -m uvicorn model_server:app --host 127.0.0.1 --port 8000`
3. Start Terminal 3: `cd C:\dev\SurfTutorApp && npx react-native start`
4. Configure ADB: `adb reverse tcp:3000 tcp:3000 && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8000 tcp:8000`
5. Run app: `npm run android`

**After code changes:**
- Frontend changes: Metro will auto-reload (shake device → Reload)
- Backend changes: Restart Terminal 1
- Model server changes: Restart Terminal 2

---

## 📞 Need Help?

If you encounter issues:
1. Check all 3 terminals for error messages
2. Verify all services are running (health checks)
3. Check ADB reverse is configured
4. Try clearing Metro cache: `npx react-native start --reset-cache`
5. Try rebuilding: `cd android && gradlew clean && cd .. && npm run android`

---

**Happy Coding! 🏄‍♂️**

