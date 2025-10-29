Backend README
================

This backend provides:
- `server.js` - Node/Express API that forwards requests to a model server and exposes basic Firebase-backed auth endpoints.
- `model_server.py` - A small FastAPI model server that loads joblib artifacts from `../ai_training/` and exposes `/predict`.

Quick start (development):

1) Install Node deps

   cd backend
   npm install

2) Install Python deps (recommended in a virtualenv)

   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt

3) Start model server (in backend folder)

   # from backend/
   .\.venv\Scripts\python -m uvicorn model_server:app --reload --port 8000

4) Start Node server (in a separate terminal)

   npm start

Environment variables
- FIREBASE_SERVICE_ACCOUNT - path to Firebase service account JSON (optional)
- MODEL_SERVER_URL - full URL to model server (defaults to http://127.0.0.1:8000/predict)
- PORT - port for Node server (defaults to 3000)

Payload notes
- The `/api/recommend` endpoint accepts the following JSON body:
   - skillLevel: string (required)
   - goal: string (required)
   - userId: string (optional) — if provided and Firebase is configured, the recommended plan will be saved to `users/{userId}/plans`.
   - userDetails: object (optional) — e.g. `{ "bmi": 22.5, "age": 32, "weight": 72.5, "height": 175 }`. These numeric fields will be forwarded to the model server and used when the model supports extra numeric inputs.

Quick test (Node)
 - After starting your Node backend and (optionally) the model server, you can run the included test script to POST a sample request:

```powershell
cd backend
node test_recommend.js
```


Notes
- If you don't configure Firebase, signup/login endpoints will return 501 and the server will still process recommendations.
- The model server expects joblib files inside `ai_training/` sibling to this repo root (e.g., ../ai_training/recommender_model.joblib).
