import pandas as pd
import random

# --- 1. Define the Building Blocks and TEMPLATES ---

skill_levels = ['Beginner', 'Intermediate', 'Pro']
goals = ['Endurance', 'Power', 'Fat Loss', 'Stamina']
equipment_options = ['None', 'Kettlebell', 'Gym']
durations = [15, 20, 25, 30, 35, 40]



# This creates a clear pattern for the AI to learn.
workout_templates = {
    ('Beginner', 'Endurance'): "Jogging;Jumping Jacks;Rowing Machine",
    ('Beginger', 'Power'): "Burpees;Tuck Jumps;Bodyweight Squats",
    ('Beginner', 'Fat Loss'): "High Knees;Mountain Climbers;Jumping Jacks",
    ('Beginner', 'Stamina'): "Jump Rope;Stair Climber;Shuttle Runs",

    ('Intermediate', 'Endurance'): "Interval Running;Cycling;Swimming",
    ('Intermediate', 'Power'): "Box Jumps;Kettlebell Swings;Medicine Ball Slams",
    ('Intermediate', 'Fat Loss'): "HIIT Sprints;Battle Ropes;Burpees",
    ('Intermediate', 'Stamina'): "Assault Bike;Circuit Training;Rowing Machine",

    ('Pro', 'Endurance'): "Intense Swimming Intervals;Long Distance Running;Cycling Sprints",
    ('Pro', 'Power'): "Advanced Box Jumps;Heavy Kettlebell Swings;Plyometric Push-ups",
    ('Pro', 'Fat Loss'): "Intense Battle Ropes;Assault Bike Sprints;Weighted Burpees",
    ('Pro', 'Stamina'): "Full Body Circuit Training;Advanced Stair Climber;Heavy Rope Jumps",
}

# --- 2. Generate the Data ---

num_rows_to_generate = 1000
workout_plans = []

print(f"🤖 Generating {num_rows_to_generate} structured workout plans...")

for i in range(num_rows_to_generate):
    # Randomly select a skill level and goal
    plan_skill = random.choice(skill_levels)
    plan_goal = random.choice(goals)
    
    # These can still be random as they are not used for prediction
    plan_equipment = random.choice(equipment_options)
    plan_duration = random.choice(durations)
    
    # Get the pre-defined exercises from our template
    plan_exercises_str = workout_templates.get((plan_skill, plan_goal), "Default Exercises;Go Here")
    
    # Create a descriptive name
    plan_name = f"{plan_skill} {plan_goal} Plan #{i+1}"
    
    # Add the generated plan to our list
    workout_plans.append({
        'planName': plan_name,
        'skillLevel': plan_skill,
        'goal': plan_goal,
        'equipment': plan_equipment,
        'durationMinutes': plan_duration,
        'focus': plan_goal,
        'exercises': plan_exercises_str
    })

# --- 3. Save the Data to a CSV File ---

df_generated = pd.DataFrame(workout_plans)
output_filename = 'cardio_plans_1000.csv' # Overwrite the old random file
df_generated.to_csv(output_filename, index=False)

print(f"✅ Success! Your structured dataset has been saved to '{output_filename}'.")