import joblib

#  Load the saved model and encoders from your finalize script
try:
    model = joblib.load('recommender_model.joblib')
    skill_encoder = joblib.load('skill_encoder.joblib')
    goal_encoder = joblib.load('goal_encoder.joblib')
    exercise_encoder = joblib.load('exercise_encoder.joblib')
    print("✅ Model and encoders loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Model files not found. Please run 'finalize_model.py' first to create them.")
    exit()

#  GET USER INPUT 
test_skill = 'Beginner'
test_goal = 'Endurance'

print(f"\nTesting with Skill='{test_skill}' and Goal='{test_goal}'...")

# 2. MAKE A PREDICTION
try:
    # Convert text input to the numbers the model understands
    skill_encoded = skill_encoder.transform([test_skill])[0]
    goal_encoded = goal_encoder.transform([test_goal])[0]

    # Predict using the loaded model
    prediction_code = model.predict([[skill_encoded, goal_encoded]])

    # Convert the numeric prediction back to a readable exercise string
    predicted_exercises = exercise_encoder.inverse_transform(prediction_code)[0]

    #  SHOW THE OUTPUT 
    print(f"🤖 AI Recommendation: {predicted_exercises}")

except ValueError as e:
    print(f"❌ Error: An input value might be incorrect. Make sure '{test_skill}' and '{test_goal}' exist in your dataset.")
    print(f"   (Original error: {e})")
