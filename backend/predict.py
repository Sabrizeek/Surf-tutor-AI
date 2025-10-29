import os
import joblib
import sys
import json
import traceback


# Base directory for relative model file paths
BASE_DIR = os.path.dirname(__file__)


# --- Load the saved model and encoders ---
def load_joblib_safe(filename):
    path = os.path.join(BASE_DIR, filename)
    try:
        return joblib.load(path)
    except FileNotFoundError:
        # Print structured JSON error to stderr so the server can forward it
        err = {"error": f"Model file not found: {filename}. Run finalize_model.py in ai_training if needed."}
        print(json.dumps(err), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        err = {"error": f"Failed loading {filename}", "details": str(e)}
        print(json.dumps(err), file=sys.stderr)
        sys.exit(1)


model = load_joblib_safe('recommender_model.joblib')
skill_encoder = load_joblib_safe('skill_encoder.joblib')
goal_encoder = load_joblib_safe('goal_encoder.joblib')
exercise_encoder = load_joblib_safe('exercise_encoder.joblib')


# --- Parse input ---
def get_inputs():
    # Prefer command line args (script, skill, goal)
    if len(sys.argv) >= 3:
        return sys.argv[1], sys.argv[2]

    # Otherwise try to read JSON from stdin (more flexible)
    try:
        data = json.load(sys.stdin)
        return data.get('skillLevel'), data.get('goal')
    except Exception:
        print(json.dumps({"error": "No input provided"}), file=sys.stderr)
        sys.exit(1)


input_skill, input_goal = get_inputs()

if not input_skill or not input_goal:
    print(json.dumps({"error": "Missing input: skill or goal"}), file=sys.stderr)
    sys.exit(1)


# --- Make a Prediction ---
try:
    # Convert text input to the numbers the model understands
    try:
        skill_encoded = skill_encoder.transform([input_skill])[0]
    except Exception as e:
        print(json.dumps({"error": "Unknown skillLevel", "details": str(e)}), file=sys.stderr)
        sys.exit(1)

    try:
        goal_encoded = goal_encoder.transform([input_goal])[0]
    except Exception as e:
        print(json.dumps({"error": "Unknown goal", "details": str(e)}), file=sys.stderr)
        sys.exit(1)

    # Predict using the loaded model
    prediction_code = model.predict([[skill_encoded, goal_encoded]])

    # Convert the numeric prediction back to a readable exercise string/list
    try:
        predicted = exercise_encoder.inverse_transform(prediction_code)
    except Exception:
        # If inverse_transform fails for single item, try wrapping
        try:
            predicted = exercise_encoder.inverse_transform([prediction_code])[0]
        except Exception as e:
            print(json.dumps({"error": "Failed to decode prediction", "details": str(e)}), file=sys.stderr)
            sys.exit(1)

    # Normalize prediction to a list of strings
    if hasattr(predicted, '__iter__') and not isinstance(predicted, str):
        recommended = list(predicted)
    else:
        recommended = [predicted]

    # --- Return the result as JSON on stdout ---
    result = {"recommendedExercises": recommended}
    print(json.dumps(result))

except Exception as e:
    tb = traceback.format_exc()
    print(json.dumps({"error": str(e), "traceback": tb}), file=sys.stderr)
    sys.exit(1)

