# Connection Diagram - Surf Tutor AI

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Frontend                     │
│                    (SurfTutorApp)                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Home    │  │  Cardio  │  │    AR    │  │ Practice │  │
│  │  Screen  │  │  Screen  │  │  Screen  │  │  Screen  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Service Layer (api.ts)                    │  │
│  │  - Auth API                                           │  │
│  │  - Cardio API                                         │  │
│  │  - Progress API                                       │  │
│  │  - Gamification API                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ (Port 3000)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend Server                          │
│              (backend/server.js)                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express Routes:                                      │  │
│  │  - /api/auth/*        (auth.js)                      │  │
│  │  - /api/progress/*    (progress.js)                  │  │
│  │  - /api/gamification/* (gamification.js)            │  │
│  │  - /api/recommend     (forwards to Model Server)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Connections:                                │  │
│  │  - MongoDB (optional, for user data)                  │  │
│  │  - Firebase (optional, for auth/plans)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            │ (Port 8000)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│          Python FastAPI Model Server                         │
│          (backend/model_server.py)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Endpoints:                                            │  │
│  │  - GET  /health                                        │  │
│  │  - POST /predict                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ML Models (from ai_training/):                       │  │
│  │  - recommender_model.joblib                          │  │
│  │  - skill_encoder.joblib                               │  │
│  │  - goal_encoder.joblib                                │  │
│  │  - exercise_encoder.joblib                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Reads
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Training Folder                               │
│              (ai_training/)                                   │
│                                                              │
│  - recommender_model.joblib                                  │
│  - skill_encoder.joblib                                       │
│  - goal_encoder.joblib                                        │
│  - exercise_encoder.joblib                                    │
│  - cardio_plans_1000.csv                                      │
│  - finalize_model.py                                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Cardio Plans Request Flow

```
User Input (Frontend)
  ↓
CardioPlansScreen.tsx
  ↓
cardioAPI.getRecommendations()
  ↓
POST /api/recommend (Backend Server)
  ↓
POST http://127.0.0.1:8000/predict (Model Server)
  ↓
Load models from ai_training/
  ↓
Process prediction
  ↓
Return recommendedExercises
  ↓
Backend Server
  ↓
Frontend displays results
```

### 2. Authentication Flow

```
User Login/Register (Frontend)
  ↓
authAPI.login() / authAPI.register()
  ↓
POST /api/auth/login or /api/auth/register
  ↓
Backend validates and creates JWT token
  ↓
Token stored in AsyncStorage
  ↓
All subsequent requests include token in header
```

### 3. Progress Tracking Flow

```
User completes drill (Frontend)
  ↓
progressAPI.saveProgress()
  ↓
POST /api/progress/save
  ↓
Backend saves to MongoDB
  ↓
gamificationAPI.awardPoints()
  ↓
POST /api/gamification/award
  ↓
Backend updates user stats
```

## Port Configuration

- **Frontend Metro**: Default React Native port (8081)
- **Backend Server**: Port 3000 (configurable via PORT env var)
- **Model Server**: Port 8000 (configurable via MODEL_SERVER_PORT env var)

## Network Configuration

### Development
- **Android Emulator**: Backend URL = `http://10.0.2.2:3000`
- **iOS Simulator**: Backend URL = `http://localhost:3000`
- **Physical Device**: Backend URL = `http://<your-computer-ip>:3000`

### Production
- Update `API_BASE_URL` in `SurfTutorApp/src/services/api.ts`
- Update `MODEL_SERVER_URL` in backend `.env` file
- Configure CORS origins in both servers

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/surf_ai
JWT_SECRET=your-secret-key
MODEL_SERVER_URL=http://127.0.0.1:8000/predict
FIREBASE_SERVICE_ACCOUNT=./firebase-key.json
```

### Model Server
```env
MODEL_SERVER_PORT=8000
MODEL_SERVER_HOST=127.0.0.1
```

