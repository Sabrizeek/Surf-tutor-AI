# Backend - Consolidated Location

This backend is now part of the consolidated project structure at `C:\dev\SurfTutorApp\`.

## Structure

```
C:\dev\SurfTutorApp\
├── backend\              # This folder
│   ├── server.js        # Node.js Express server
│   ├── model_server.py  # Python FastAPI model server
│   ├── start_model_server.py
│   └── ...
├── ai_training\         # ML models (sibling folder)
│   └── *.joblib files
└── (React Native app at root)
```

## Path References

### Model Server → AI Training
The model server loads models from the sibling `ai_training` folder:
```python
# In backend/model_server.py
BASE_DIR = os.path.dirname(__file__)  # backend/
MODEL_DIR = os.path.join(BASE_DIR, '..', 'ai_training')  # ../ai_training
```

This resolves to: `C:\dev\SurfTutorApp\ai_training\`

### Backend Server → Model Server
The backend server connects to the model server at:
- Default: `http://127.0.0.1:8000/predict`
- Configurable via `MODEL_SERVER_URL` environment variable

## Running

### Start Model Server
```bash
cd C:\dev\SurfTutorApp\backend
python start_model_server.py
```

### Start Backend Server
```bash
cd C:\dev\SurfTutorApp\backend
npm start
```

### Start Both (from project root)
```powershell
cd C:\dev\SurfTutorApp
.\start_all_services.ps1
```

## Environment Variables

Create a `.env` file in the `backend` folder (optional):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/surf_ai
JWT_SECRET=your-secret-key-here
MODEL_SERVER_URL=http://127.0.0.1:8000/predict
FIREBASE_SERVICE_ACCOUNT=./firebase-key.json
```

## Verification

1. Model Server: http://localhost:8000/health
2. Backend Server: http://localhost:3000/health
3. Model files: Check `../ai_training/*.joblib` files exist

