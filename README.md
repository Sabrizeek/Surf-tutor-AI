# Surf Tutor AI 🏄‍♂️

An AI-powered surf training application with pose detection, personalized workout recommendations, and gamification features.

## Project Structure

```
Surf-tutor-AI/
├── surfapp--backend/         # Node.js Express Backend (MVC Architecture)
│   ├── config/               # Configuration files
│   │   ├── constants.js      # App constants (JWT, ports, etc.)
│   │   ├── db.js             # MongoDB connection
│   │   └── firebaseAdmin.js  # Firebase Admin SDK
│   ├── controllers/          # Request handlers (business logic)
│   │   ├── authController.js
│   │   ├── progressController.js
│   │   ├── gamificationController.js
│   │   ├── poseController.js
│   │   └── recommendController.js
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Global error handling
│   ├── models/               # Data models
│   │   └── User.js           # User model with MongoDB operations
│   ├── routes/               # Route definitions
│   │   ├── auth.js
│   │   ├── progress.js
│   │   ├── gamification.js
│   │   ├── pose.js
│   │   ├── poseAnalysis.js
│   │   └── recommend.js
│   └── server.js             # App entry point
│
├── surfapp--ml-engine/       # Python ML Services (TWO separate servers)
│   ├── data/                 # Training data
│   │   └── cardio_plans_1000.csv
│   ├── models/               # Trained ML models (joblib files)
│   │   ├── recommender_model.joblib
│   │   ├── skill_encoder.joblib
│   │   ├── goal_encoder.joblib
│   │   └── exercise_encoder.joblib
│   ├── services/             # FastAPI servers
│   │   ├── model_server.py   # Cardio AI (Port 8000)
│   │   ├── pose_server.py   # Pose Detection (Port 8001)
│   │   └── pose_detection.py # MediaPipe pose detection logic
│   ├── training/             # Model training scripts
│   │   ├── generate_data.py
│   │   ├── finalize_model.py
│   │   └── test_pose_estimation.py
│   ├── start_server.py       # Cardio AI startup (Port 8000)
│   ├── start_pose_server.py  # Pose Detection startup (Port 8001)
│   └── start_all_services.py # Unified startup (BOTH services) ⭐ RECOMMENDED
│
└── SurfApp--frontend/        # React Native Expo Frontend
    ├── app/                  # Expo Router pages
    │   ├── (tabs)/           # Tab navigation screens
    │   │   ├── home.tsx
    │   │   ├── practice.tsx
    │   │   ├── cardio.tsx
    │   │   ├── progress.tsx
    │   │   ├── profile.tsx
    │   │   └── ar.tsx
    │   ├── login.tsx
    │   └── register.tsx
    ├── components/           # Reusable screen components
    │   ├── HomeScreen.tsx
    │   ├── PosePracticeScreen.tsx
    │   ├── CardioPlansScreen.tsx
    │   ├── ProgressScreen.tsx
    │   ├── ProfileScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   └── ARVisualizationScreen.tsx
    ├── services/             # API services
    │   └── api.ts
    ├── context/              # React Context providers
    │   └── AuthContext.tsx
    └── utils/                # Utility functions
        ├── poseDetection.ts
        └── mockPoseDetector.ts
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- MongoDB (local or Atlas)
- Android Studio / Xcode (for mobile development)

### 1. Start ML Services (TWO separate servers)

**Option A: Start Both Services Together (Recommended)**
```bash
cd surfapp--ml-engine
pip install -r requirements.txt
python start_all_services.py
```

**Option B: Start Services Separately**

**Cardio AI (Port 8000):**
```bash
cd surfapp--ml-engine
python start_server.py
```

**Pose Detection (Port 8001):**
```bash
cd surfapp--ml-engine
python start_pose_server.py
```

**Windows Scripts:**
- Start both: `start_all_services.bat` or `start_all_services.ps1`
- Cardio AI only: `start_server.bat` or `start_server.ps1`
- Pose Detection only: `start_pose_server.bat` or `start_pose_server.ps1`

**Note:** The ML engine has TWO services:
- **Cardio AI** (Port 8000) - Workout plan recommendations
- **Pose Detection** (Port 8001) - Real-time pose estimation

Both services must be running for full functionality!

### 2. Start Backend Server (Port 3000)

```bash
cd surfapp--backend
npm install
npm start
```

**Environment Variables (.env):**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=surf_ai
JWT_SECRET=your-secret-key
MODEL_SERVER_URL=http://127.0.0.1:8000/predict
POSE_SERVER_URL=http://127.0.0.1:8001/detect
```

### 3. Start Frontend (Expo)

```bash
cd SurfApp--frontend
npm install
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile (auth required) |
| PUT | `/api/auth/profile` | Update user profile (auth required) |

### Progress Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/progress/save` | Save user progress |
| GET | `/api/progress/load` | Load user progress |

### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gamification/award` | Award points/badges |
| GET | `/api/gamification/stats` | Get gamification stats |

### Pose Detection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pose/detect` | Detect pose from image (MediaPipe) |
| POST | `/api/pose/analyze` | Simple pose analysis |
| POST | `/api/pose-analysis/analyze` | Detailed pose analysis |
| GET | `/api/pose-analysis/health` | Health check |

### ML Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommend` | Get workout recommendations |

## Features

- **Pose Detection**: Real-time surf pose coaching using camera
- **8 Surf Drills**: Stance, Pop-Up, Paddling, Bottom Turn, Pumping, Tube Stance, Falling, Cutback
- **AI Recommendations**: ML-based personalized workout plans
- **Progress Tracking**: Track completed drills and scores
- **Gamification**: Points, badges, and streak system
- **User Profiles**: Customizable profiles with goals and skill levels

## Architecture

### Backend (MVC Pattern)
- **Models**: Database schemas and operations
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Middlewares**: Authentication, error handling

### Frontend
- **Expo Router**: File-based navigation
- **Components**: Reusable UI components
- **Services**: API communication layer
- **Context**: Global state management

### ML Engine
- **FastAPI**: High-performance API server
- **Scikit-learn**: ML model training
- **Joblib**: Model serialization

## Development

### Running Tests
```bash
# Backend
cd surfapp--backend
npm test

# ML Engine
cd surfapp--ml-engine
python -m pytest
```

### Code Style
- Backend: ESLint
- Frontend: TypeScript + ESLint
- Python: Black + Flake8

## License

MIT License

