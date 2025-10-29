from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import json
from datetime import datetime


BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'ai_training'))


class PredictRequest(BaseModel):
    skillLevel: str
    goal: str
    # Optional user details that can help personalize recommendations
    # e.g. {"bmi": 22.5, "age": 32, "weight": 72.5, "height": 175}
    userDetails: dict = None


app = FastAPI(title='Surf AI Model Server')


def load_safe(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(path)
    return joblib.load(path)


# Load artifacts once at startup
try:
    model = load_safe('recommender_model.joblib')
    skill_encoder = load_safe('skill_encoder.joblib')
    goal_encoder = load_safe('goal_encoder.joblib')
    exercise_encoder = load_safe('exercise_encoder.joblib')
except Exception as e:
    # If startup fails, we still create the app but raise on requests
    model = None
    skill_encoder = None
    goal_encoder = None
    exercise_encoder = None
    startup_error = str(e)
else:
    startup_error = None


@app.get('/health')
def health():
    return {"status": "ok", "modelLoaded": model is not None}


@app.post('/predict')
def predict(req: PredictRequest):
    if startup_error:
        raise HTTPException(status_code=500, detail={"error": "Model server startup error", "details": startup_error})

    try:
        skill_encoded = skill_encoder.transform([req.skillLevel])[0]
        goal_encoded = goal_encoder.transform([req.goal])[0]

        # Build feature vector; start with encoded categorical features
        features = [skill_encoded, goal_encoded]

        # If the model expects more numeric features (e.g., BMI, age), try to append them
        model_n = getattr(model, 'n_features_in_', None)

        # Candidate numeric fields to use (in order)
        numeric_keys = ['bmi', 'age', 'weight', 'height']
        if req.userDetails and isinstance(req.userDetails, dict):
            for k in numeric_keys:
                if k in req.userDetails:
                    try:
                        v = float(req.userDetails[k])
                        features.append(v)
                    except Exception:
                        # skip non-convertible values
                        pass

        # If model reports expected feature count and we have fewer, pad with zeros
        if model_n is not None and model_n > len(features):
            # append zeros to match expected length
            needed = model_n - len(features)
            features.extend([0.0] * needed)

        # If model_n is None, we'll try to call predict and let exceptions surface
        prediction_code = model.predict([features])
        predicted = exercise_encoder.inverse_transform(prediction_code)
        # Normalize into list
        if hasattr(predicted, '__iter__') and not isinstance(predicted, str):
            recommended = list(predicted)
        else:
            recommended = [predicted]

        return {
            "recommendedExercises": recommended,
            "meta": {"modelVersion": "v1.0", "timestamp": datetime.utcnow().isoformat() + 'Z', "usedFeatures": len(features)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Prediction failed", "details": str(e)})
