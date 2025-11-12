from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import json
import csv
from datetime import datetime
import pandas as pd


BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'ai_training'))
CSV_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'ai_training', 'cardio_plans_1000.csv'))


class PredictRequest(BaseModel):
    skillLevel: str
    goal: list[str]  # Now accepts multiple goals as array
    # Optional user details that can help personalize recommendations
    # e.g. {"bmi": 22.5, "age": 32, "weight": 72.5, "height": 175}
    userDetails: dict = None


app = FastAPI(title='Surf AI Model Server')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    
    # Load CSV data for structured plan details
    plans_df = None
    if os.path.exists(CSV_PATH):
        try:
            plans_df = pd.read_csv(CSV_PATH)
        except Exception as e:
            print(f"Warning: Could not load CSV data: {e}")
except Exception as e:
    # If startup fails, we still create the app but raise on requests
    model = None
    skill_encoder = None
    goal_encoder = None
    exercise_encoder = None
    plans_df = None
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
        # Handle multiple goals: use first goal for encoding (model expects single goal)
        # TODO: Retrain model with MultiLabelBinarizer for true multi-goal support
        primary_goal = req.goal[0] if isinstance(req.goal, list) and len(req.goal) > 0 else req.goal
        all_goals = req.goal if isinstance(req.goal, list) else [req.goal]
        
        try:
            goal_encoded = goal_encoder.transform([primary_goal])[0]
        except Exception:
            # Fallback if goal not in encoder
            goal_encoded = goal_encoder.transform(['Endurance'])[0]

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

        # If model reports expected feature count, align feature length
        if model_n is not None:
            if len(features) > model_n:
                # truncate extra features
                features = features[:model_n]
            elif model_n > len(features):
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

        # Build structured workout plans
        recommended_plans = []
        
        if plans_df is not None and len(recommended) > 0:
            # Try to find matching plans from CSV based on exercises and user criteria
            for exercise_str in recommended[:3]:  # Limit to 3 plans
                # Search for plans matching the exercise string and any of the user's goals
                goal_filter = None
                for g in all_goals:
                    if goal_filter is None:
                        goal_filter = plans_df['goal'].str.lower() == g.lower()
                    else:
                        goal_filter = goal_filter | (plans_df['goal'].str.lower() == g.lower())
                
                matching_plans = plans_df[
                    (plans_df['skillLevel'].str.lower() == req.skillLevel.lower()) &
                    (goal_filter if goal_filter is not None else True)
                ]
                
                if len(matching_plans) == 0:
                    # Fallback: just match skill level or any goal
                    matching_plans = plans_df[
                        (plans_df['skillLevel'].str.lower() == req.skillLevel.lower()) |
                        (goal_filter if goal_filter is not None else False)
                    ]
                
                if len(matching_plans) > 0:
                    # Take first matching plan
                    plan_row = matching_plans.iloc[0]
                    goals_str = ', '.join(all_goals) if isinstance(all_goals, list) else str(all_goals)
                    plan = {
                        "planName": str(plan_row.get('planName', 'Workout Plan')),
                        "skillLevel": str(plan_row.get('skillLevel', req.skillLevel)),
                        "goal": goals_str,
                        "equipment": str(plan_row.get('equipment', 'None')),
                        "durationMinutes": int(plan_row.get('durationMinutes', 30)) if pd.notna(plan_row.get('durationMinutes')) else 30,
                        "focus": str(plan_row.get('focus', goals_str)),
                        "exercises": str(plan_row.get('exercises', exercise_str))
                    }
                    recommended_plans.append(plan)
                else:
                    # Create a basic plan from exercise string
                    exercises_list = exercise_str.split(';') if isinstance(exercise_str, str) else [str(exercise_str)]
                    goals_str = ', '.join(all_goals) if isinstance(all_goals, list) else str(all_goals)
                    plan = {
                        "planName": f"{req.skillLevel} {goals_str} Plan",
                        "skillLevel": req.skillLevel,
                        "goal": goals_str,
                        "equipment": "None",
                        "durationMinutes": 30,
                        "focus": goals_str,
                        "exercises": exercises_list
                    }
                    recommended_plans.append(plan)
        else:
            # Fallback: create basic plans from exercise strings
            for idx, exercise_str in enumerate(recommended[:3]):
                exercises_list = exercise_str.split(';') if isinstance(exercise_str, str) else [str(exercise_str)]
                goals_str = ', '.join(all_goals) if isinstance(all_goals, list) else str(all_goals)
                plan = {
                    "planName": f"{req.skillLevel} {goals_str} Plan #{idx + 1}",
                    "skillLevel": req.skillLevel,
                    "goal": goals_str,
                    "equipment": "None",
                    "durationMinutes": 30,
                    "focus": goals_str,
                    "exercises": exercises_list
                }
                recommended_plans.append(plan)

        return {
            "recommendedPlans": recommended_plans,
            "recommendedExercises": recommended,  # Keep for backward compatibility
            "meta": {"modelVersion": "v1.0", "timestamp": datetime.utcnow().isoformat() + 'Z', "usedFeatures": len(features)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Prediction failed", "details": str(e)})
