import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import numpy as np

# --- 1. Load the dataset ---
try:
    df = pd.read_csv('cardio_plans_1000.csv') # Using your 1000-row file
except FileNotFoundError:
    print("Error: Dataset file not found.")
    exit()

# --- 2. Prepare the Data ---
df['goal'] = df['goal'].astype(str)
df['skillLevel'] = df['skillLevel'].astype(str)

skill_encoder = LabelEncoder()
goal_encoder = LabelEncoder()

exercise_encoder = LabelEncoder()

df['skill_encoded'] = skill_encoder.fit_transform(df['skillLevel'])
df['goal_encoded'] = goal_encoder.fit_transform(df['goal'])

df['exercises_encoded'] = exercise_encoder.fit_transform(df['exercises'])

# Ensure numeric auxiliary columns exist for training a 6-feature model
# If not present, synthesize plausible values
rng = np.random.default_rng(42)
if 'height' not in df.columns:
    df['height'] = rng.integers(150, 201, size=len(df))  # cm
if 'weight' not in df.columns:
    df['weight'] = rng.integers(50, 101, size=len(df))   # kg
if 'age' not in df.columns:
    df['age'] = rng.integers(16, 61, size=len(df))       # years
if 'bmi' not in df.columns:
    df['bmi'] = df['weight'] / ((df['height'] / 100.0) ** 2)

# --- 3. Split Data into Training and Testing Sets ---
X = df[['skill_encoded', 'goal_encoded', 'bmi', 'age', 'weight', 'height']]

y = df['exercises_encoded']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- 4. Train Model ---
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Model training complete!")

# --- 5. Check the Model's Accuracy ---
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Test Data: {accuracy * 100:.2f}%") # This should be much higher now!

# --- 6. Save the Model and Encoders for Your App ---
joblib.dump(model, 'recommender_model.joblib')
joblib.dump(skill_encoder, 'skill_encoder.joblib')
joblib.dump(goal_encoder, 'goal_encoder.joblib')

joblib.dump(exercise_encoder, 'exercise_encoder.joblib')

print("Model and encoders have been saved successfully.")
