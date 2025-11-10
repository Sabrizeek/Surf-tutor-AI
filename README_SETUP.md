# Surf Tutor AI - Setup Guide

This guide will help you set up and run the Surf Tutor AI application with all its components connected.

## Project Structure

**Consolidated Location:** `C:\dev\SurfTutorApp\`

```
C:\dev\SurfTutorApp\
├── package.json          # React Native app (root)
├── App.tsx               # React Native app
├── src/                  # React Native source files
├── android/              # Android native files
├── ios/                  # iOS native files
├── ai_training/          # ML models and training scripts
└── backend/              # Node.js + Python backend server
```

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Python** (3.8 or higher)
3. **MongoDB** (optional, for user data persistence)
4. **React Native development environment**
   - Android Studio (for Android)
   - Xcode (for iOS, macOS only)

## Setup Instructions

### 1. Navigate to Project Root

```bash
cd C:\dev\SurfTutorApp
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Python Dependencies for Model Server

```bash
cd backend
pip install -r requirements.txt
```

Or if using a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd C:\dev\SurfTutorApp  # Back to root
npm install
```

For iOS (macOS only):
```bash
cd ios
pod install
cd ..
```

### 5. Verify Model Files

Make sure the following files exist in `C:\dev\SurfTutorApp\ai_training\`:
- `recommender_model.joblib`
- `skill_encoder.joblib`
- `goal_encoder.joblib`
- `exercise_encoder.joblib`

If they don't exist, run:
```bash
cd C:\dev\SurfTutorApp\ai_training
python finalize_model.py
```

## Running the Application

### Option 1: Use the Startup Script (Windows PowerShell)

```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

This will start all three services:
1. Model Server (Python FastAPI) on port 8000
2. Backend Server (Node.js) on port 3000
3. Frontend Metro Bundler

### Option 2: Manual Startup

#### Terminal 1: Model Server
```bash
cd C:\dev\SurfTutorApp\backend
python start_model_server.py
```

Or:
```bash
cd C:\dev\SurfTutorApp\backend
uvicorn model_server:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2: Backend Server
```bash
cd C:\dev\SurfTutorApp\backend
npm start
```

#### Terminal 3: Frontend Metro
```bash
cd C:\dev\SurfTutorApp
npm start
```

#### Terminal 4: Run on Device/Emulator

For Android:
```bash
cd C:\dev\SurfTutorApp
npm run android
```

For iOS:
```bash
cd C:\dev\SurfTutorApp
npm run ios
```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory (optional):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/surf_ai
JWT_SECRET=your-secret-key-here
MODEL_SERVER_URL=http://127.0.0.1:8000/predict
FIREBASE_SERVICE_ACCOUNT=./firebase-key.json
```

### Frontend Configuration

The API base URL is configured in `SurfTutorApp/src/services/api.ts`:
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

## Features

### 1. Cardio Plans
- Enter physical details (height, weight, skill level, goal)
- Get AI-generated workout recommendations
- Personalized based on your profile

### 2. AR Visualization
- View surfing techniques in AR (FBX models coming soon)
- Learn timing and motion before hitting the water

### 3. Pose Practice
- Practice land drills with camera
- Real-time feedback on body position
- Color-coded coaching (Green/Yellow/Red)

### 4. Progress Tracking
- Track completed drills
- View scores and achievements
- Gamification with points and badges

## Troubleshooting

### Model Server Not Starting
- Check that model files exist in `ai_training/`
- Verify Python dependencies are installed
- Check port 8000 is not in use

### Backend Not Connecting to Model Server
- Verify Model Server is running on port 8000
- Check `MODEL_SERVER_URL` in backend `.env` or `server.js`

### Frontend Can't Connect to Backend
- For Android Emulator: Use `10.0.2.2` instead of `localhost`
- For Physical Device: Use your computer's IP address
- Check backend is running on port 3000
- Verify CORS is enabled in backend

### Camera Not Working
- Grant camera permissions in device settings
- For Android: Check `AndroidManifest.xml` has camera permissions
- For iOS: Check `Info.plist` has camera usage description

## Development Notes

- FBX animation models are still being created for AR visualization
- Pose estimation integration is ready but needs MediaPipe or similar library
- MongoDB is optional - the app can work without it for basic features

## Next Steps

1. Integrate FBX models for AR visualization
2. Add pose estimation library (MediaPipe) for real-time feedback
3. Enhance gamification features
4. Add more workout plans and techniques

