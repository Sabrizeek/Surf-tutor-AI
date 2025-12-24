import pandas as pd
import random

# --- 1. Define the Building Blocks and TEMPLATES ---

skill_levels = ['Beginner', 'Intermediate', 'Pro']
goals = ['Endurance', 'Power', 'Fat Loss', 'Stamina']
equipment_options = ['None', 'Kettlebell', 'Gym']
durations = [15, 20, 25, 30, 35, 40]

# Expanded exercise library (50+ exercises organized by category)
warmup_exercises = [
    'Jumping Jacks', 'Arm Circles', 'Leg Swings', 'Torso Twists', 'Neck Rolls',
    'Shoulder Rotations', 'Hip Circles', 'Ankle Rotations', 'Walking Lunges', 'Butt Kicks',
    'High Knees', 'Side Steps', 'Knee Hugs', 'Quad Stretches', 'Hamstring Stretches'
]

endurance_exercises = [
    'Jogging', 'Cycling', 'Swimming', 'Rowing Machine', 'Elliptical Trainer',
    'Stair Climber', 'Jump Rope', 'Walking', 'Brisk Walking', 'Steady State Running',
    'Long Distance Running', 'Cycling Sprints', 'Swimming Laps', 'Rowing Intervals',
    'Cross Trainer', 'Treadmill Running', 'Outdoor Running', 'Bike Riding', 'Pool Swimming'
]

power_exercises = [
    'Burpees', 'Box Jumps', 'Tuck Jumps', 'Medicine Ball Slams', 'Kettlebell Swings',
    'Plyometric Push-ups', 'Jump Squats', 'Explosive Lunges', 'Power Cleans', 'Thruster Jumps',
    'Broad Jumps', 'Single Leg Hops', 'Clapping Push-ups', 'Dumbbell Snatches', 'Wall Ball Throws',
    'Heavy Kettlebell Swings', 'Advanced Box Jumps', 'Plyometric Lunges', 'Jumping Burpees'
]

stamina_exercises = [
    'Circuit Training', 'Interval Running', 'Assault Bike', 'Shuttle Runs', 'Fartlek Training',
    'Tabata Intervals', 'Full Body Circuit', 'HIIT Circuit', 'CrossFit WOD', 'AMRAP Workouts',
    'EMOM Workouts', 'Rowing Intervals', 'Cycling Intervals', 'Swimming Intervals', 'Stair Running'
]

fatloss_exercises = [
    'HIIT Sprints', 'Battle Ropes', 'Mountain Climbers', 'Jumping Jacks', 'High Knees',
    'Burpees', 'Sprint Intervals', 'Kettlebell Swings', 'Assault Bike Sprints', 'Rowing Sprints',
    'Weighted Burpees', 'Intense Battle Ropes', 'Jump Rope Intervals', 'Sprint Burpees', 'Power Snatches'
]

# Function to select exercises based on goal and skill level (for variety in generation)
def get_exercises_for_template(skill_level, goal):
    exercises_pool = []
    
    if goal == 'Endurance':
        exercises_pool = warmup_exercises[:5] + endurance_exercises
    elif goal == 'Power':
        exercises_pool = warmup_exercises[:3] + power_exercises
    elif goal == 'Fat Loss':
        exercises_pool = warmup_exercises[:3] + fatloss_exercises
    elif goal == 'Stamina':
        exercises_pool = warmup_exercises[:3] + stamina_exercises
    
    # Filter by skill level
    if skill_level == 'Beginner':
        # Remove advanced exercises
        filtered = [e for e in exercises_pool if 'Advanced' not in e and 'Heavy' not in e 
                   and 'Intense' not in e and 'Weighted' not in e]
        num_exercises = random.randint(4, 5)
    elif skill_level == 'Intermediate':
        filtered = [e for e in exercises_pool if 'Advanced' not in e and 'Heavy' not in e]
        num_exercises = random.randint(5, 6)
    else:  # Pro
        filtered = exercises_pool
        num_exercises = random.randint(5, 6)
    
    # Select random exercises
    selected = random.sample(filtered, min(num_exercises, len(filtered)))
    return ';'.join(selected)

# Base templates for ML model training (consistent patterns)
base_templates = {
    ('Beginner', 'Endurance'): "Jumping Jacks;Jogging;Rowing Machine;Cycling;Walking",
    ('Beginner', 'Power'): "Burpees;Tuck Jumps;Bodyweight Squats;Jump Squats;Explosive Lunges",
    ('Beginner', 'Fat Loss'): "High Knees;Mountain Climbers;Jumping Jacks;HIIT Sprints;Burpees",
    ('Beginner', 'Stamina'): "Jump Rope;Stair Climber;Shuttle Runs;Circuit Training;Interval Running",

    ('Intermediate', 'Endurance'): "Interval Running;Cycling;Swimming;Rowing Machine;Elliptical Trainer",
    ('Intermediate', 'Power'): "Box Jumps;Kettlebell Swings;Medicine Ball Slams;Plyometric Push-ups;Thruster Jumps",
    ('Intermediate', 'Fat Loss'): "HIIT Sprints;Battle Ropes;Burpees;Assault Bike Sprints;Jump Rope Intervals",
    ('Intermediate', 'Stamina'): "Assault Bike;Circuit Training;Rowing Machine;Tabata Intervals;CrossFit WOD",

    ('Pro', 'Endurance'): "Intense Swimming Intervals;Long Distance Running;Cycling Sprints;Rowing Intervals;Cross Trainer",
    ('Pro', 'Power'): "Advanced Box Jumps;Heavy Kettlebell Swings;Plyometric Push-ups;Power Cleans;Wall Ball Throws",
    ('Pro', 'Fat Loss'): "Intense Battle Ropes;Assault Bike Sprints;Weighted Burpees;Sprint Burpees;Power Snatches",
    ('Pro', 'Stamina'): "Full Body Circuit Training;Advanced Stair Climber;Heavy Rope Jumps;EMOM Workouts;AMRAP Workouts",
}

# This creates a clear pattern for the AI to learn with expanded exercises.
# Use base templates for consistency, but allow some variation
workout_templates = base_templates

# --- 2. Generate the Data ---

num_rows_to_generate = 1000
workout_plans = []

print(f"[AI] Generating {num_rows_to_generate} structured workout plans...")

for i in range(num_rows_to_generate):
    # Randomly select a skill level and goal
    plan_skill = random.choice(skill_levels)
    plan_goal = random.choice(goals)
    
    # These can still be random as they are not used for prediction
    plan_equipment = random.choice(equipment_options)
    plan_duration = random.choice(durations)
    
    # Get the pre-defined exercises from our template (with some variation)
    base_exercises = workout_templates.get((plan_skill, plan_goal), "Jumping Jacks;Jogging;Burpees")
    
    # Add some variety: occasionally use the dynamic function for more diversity
    if random.random() < 0.3:  # 30% chance to use dynamic generation
        plan_exercises_str = get_exercises_for_template(plan_skill, plan_goal)
    else:
        plan_exercises_str = base_exercises
    
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

print(f"[OK] Success! Your structured dataset has been saved to '{output_filename}'.")