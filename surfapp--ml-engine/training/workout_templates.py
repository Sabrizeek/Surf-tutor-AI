"""
Workout Templates System
Deterministic workout plan generation based on skill level, goal, duration, BMI, and limitations
"""

def get_bmi_category(height=None, weight=None, bmi=None):
    """
    Calculate BMI category from height/weight or use provided BMI
    
    Args:
        height: Height in cm (optional)
        weight: Weight in kg (optional)
        bmi: Pre-calculated BMI (optional)
    
    Returns:
        'underweight', 'normal', or 'overweight'
    """
    if bmi is not None:
        calculated_bmi = bmi
    elif height and weight:
        calculated_bmi = weight / ((height / 100) ** 2)
    else:
        return 'normal'  # Default to normal if no data
    
    if calculated_bmi < 18.5:
        return 'underweight'
    elif calculated_bmi > 25:
        return 'overweight'
    else:
        return 'normal'

# Exercise pools by category
WARMUP_EXERCISES = [
    'Arm Circles', 'Leg Swings', 'Torso Twists', 'Neck Rolls',
    'Shoulder Rotations', 'Hip Circles', 'Ankle Rotations', 'Walking Lunges',
    'Butt Kicks', 'High Knees', 'Side Steps', 'Knee Hugs',
    'Quad Stretches', 'Hamstring Stretches'
]

ENDURANCE_EXERCISES = [
    'Jogging', 'Cycling', 'Swimming', 'Rowing Machine', 'Elliptical Trainer',
    'Stair Climber', 'Jump Rope', 'Walking', 'Brisk Walking', 'Steady State Running',
    'Long Distance Running', 'Cycling Sprints', 'Swimming Laps', 'Rowing Intervals',
    'Cross Trainer', 'Treadmill Running', 'Outdoor Running', 'Bike Riding', 'Pool Swimming'
]

POWER_EXERCISES = [
    'Burpees', 'Box Jumps', 'Tuck Jumps', 'Medicine Ball Slams', 'Kettlebell Swings',
    'Plyometric Push-ups', 'Jump Squats', 'Explosive Lunges', 'Power Cleans', 'Thruster Jumps',
    'Broad Jumps', 'Single Leg Hops', 'Clapping Push-ups', 'Dumbbell Snatches', 'Wall Ball Throws',
    'Heavy Kettlebell Swings', 'Advanced Box Jumps', 'Plyometric Lunges', 'Jumping Burpees'
]

STAMINA_EXERCISES = [
    'Circuit Training', 'Interval Running', 'Assault Bike', 'Shuttle Runs', 'Fartlek Training',
    'Tabata Intervals', 'Full Body Circuit', 'HIIT Circuit', 'CrossFit WOD', 'AMRAP Workouts',
    'EMOM Workouts', 'Rowing Intervals', 'Cycling Intervals', 'Swimming Intervals', 'Stair Running'
]

FATLOSS_EXERCISES = [
    'HIIT Sprints', 'Battle Ropes', 'Mountain Climbers', 'Jumping Jacks', 'High Knees',
    'Burpees', 'Sprint Intervals', 'Kettlebell Swings', 'Assault Bike Sprints', 'Rowing Sprints',
    'Weighted Burpees', 'Intense Battle Ropes', 'Jump Rope Intervals', 'Sprint Burpees', 'Power Snatches'
]

# Limitation exclusions mapping
LIMITATION_EXCLUSIONS = {
    'Knee discomfort': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Power Cleans', 'Thruster Jumps'],
    'Knee injury': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Power Cleans', 'Thruster Jumps'],
    'Knee surgery recovery': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Power Cleans', 'Thruster Jumps'],
    'Lower back tightness': ['Burpees', 'Medicine Ball Slams', 'Kettlebell Swings', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Mountain Climbers', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Heavy Kettlebell Swings', 'Weighted Burpees', 'Power Snatches', 'Torso Twists'],
    'Lower back pain': ['Burpees', 'Medicine Ball Slams', 'Kettlebell Swings', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Mountain Climbers', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Heavy Kettlebell Swings', 'Weighted Burpees', 'Power Snatches', 'Torso Twists'],
    'Upper back pain': ['Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Battle Ropes', 'Intense Battle Ropes', 'Power Cleans', 'Dumbbell Snatches', 'Power Snatches'],
    'Shoulder injury': ['Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Arm Circles', 'Shoulder Rotations', 'Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Battle Ropes', 'Intense Battle Ropes', 'Mountain Climbers', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Thruster Jumps'],
    'Shoulder pain': ['Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Arm Circles', 'Shoulder Rotations', 'Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Battle Ropes', 'Intense Battle Ropes', 'Mountain Climbers', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Thruster Jumps'],
    'Rotator cuff issues': ['Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Arm Circles', 'Shoulder Rotations', 'Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Battle Ropes', 'Intense Battle Ropes', 'Mountain Climbers', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Thruster Jumps'],
    'Ankle injury': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Broad Jumps', 'Single Leg Hops', 'Ankle Rotations'],
    'Ankle pain': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Broad Jumps', 'Single Leg Hops', 'Ankle Rotations'],
    'Ankle instability': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Broad Jumps', 'Single Leg Hops', 'Ankle Rotations'],
    'Wrist injury': ['Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Mountain Climbers', 'Battle Ropes', 'Intense Battle Ropes', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Medicine Ball Slams'],
    'Wrist pain': ['Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Mountain Climbers', 'Battle Ropes', 'Intense Battle Ropes', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Medicine Ball Slams'],
    'Carpal tunnel': ['Burpees', 'Plyometric Push-ups', 'Clapping Push-ups', 'Mountain Climbers', 'Battle Ropes', 'Intense Battle Ropes', 'Rowing Machine', 'Rowing Intervals', 'Rowing Sprints', 'Power Cleans', 'Dumbbell Snatches', 'Wall Ball Throws', 'Power Snatches', 'Kettlebell Swings', 'Heavy Kettlebell Swings', 'Medicine Ball Slams'],
    'Hip discomfort': ['Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'High Knees', 'Knee Hugs', 'Hip Circles', 'Leg Swings', 'Jump Squats', 'Burpees', 'Jumping Burpees'],
    'Hip pain': ['Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'High Knees', 'Knee Hugs', 'Hip Circles', 'Leg Swings', 'Jump Squats', 'Burpees', 'Jumping Burpees'],
    'Hip injury': ['Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'High Knees', 'Knee Hugs', 'Hip Circles', 'Leg Swings', 'Jump Squats', 'Burpees', 'Jumping Burpees'],
    'Neck pain': ['Neck Rolls', 'Torso Twists', 'Burpees', 'Mountain Climbers'],
    'Neck injury': ['Neck Rolls', 'Torso Twists', 'Burpees', 'Mountain Climbers'],
    'Elbow pain': ['Arm Circles', 'Shoulder Rotations', 'Plyometric Push-ups', 'Clapping Push-ups', 'Burpees', 'Push-ups'],
    'Tennis elbow': ['Arm Circles', 'Shoulder Rotations', 'Plyometric Push-ups', 'Clapping Push-ups', 'Burpees', 'Push-ups'],
    'Golfer\'s elbow': ['Arm Circles', 'Shoulder Rotations', 'Plyometric Push-ups', 'Clapping Push-ups', 'Burpees', 'Push-ups'],
    'Asthma': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Tabata Intervals', 'EMOM Workouts', 'HIIT Circuit'],
    'Breathing difficulties': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Tabata Intervals', 'EMOM Workouts', 'HIIT Circuit'],
    'Heart conditions': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Tabata Intervals', 'EMOM Workouts', 'HIIT Circuit', 'Cycling Sprints', 'Assault Bike', 'Assault Bike Sprints'],
    'High blood pressure': ['Jumping Jacks', 'Burpees', 'Box Jumps', 'Tuck Jumps', 'Jump Squats', 'Jogging', 'Running', 'Stair', 'Jump Rope', 'High Knees', 'Butt Kicks', 'Walking Lunges', 'Explosive Lunges', 'Plyometric Lunges', 'Jumping Burpees', 'Sprint', 'HIIT Sprints', 'Shuttle Runs', 'Stair Running', 'Swimming', 'Swimming Laps', 'Pool Swimming', 'Intense Swimming Intervals', 'Tabata Intervals', 'EMOM Workouts', 'HIIT Circuit', 'Cycling Sprints', 'Assault Bike', 'Assault Bike Sprints'],
}

def filter_exercises_by_limitations(exercises, limitations):
    """Filter out exercises that conflict with user limitations"""
    if not limitations or 'None' in limitations:
        return exercises
    
    excluded_keywords = set()
    for limitation in limitations:
        if limitation in LIMITATION_EXCLUSIONS:
            excluded_keywords.update(LIMITATION_EXCLUSIONS[limitation])
    
    filtered = []
    for exercise in exercises:
        should_exclude = False
        for keyword in excluded_keywords:
            if keyword.lower() in exercise.lower():
                should_exclude = True
                break
        if not should_exclude:
            filtered.append(exercise)
    
    return filtered

def get_exercise_pool_by_goal(goal):
    """Get exercise pool based on goal"""
    if goal == 'Warm up only':
        return WARMUP_EXERCISES
    elif goal == 'Improve endurance':
        return WARMUP_EXERCISES[:5] + ENDURANCE_EXERCISES
    elif goal == 'Improve explosive pop-up speed':
        return WARMUP_EXERCISES[:3] + POWER_EXERCISES
    else:
        # Map ML goals to quiz goals
        goal_mapping = {
            'Endurance': 'Improve endurance',
            'Power': 'Improve explosive pop-up speed',
            'Fat Loss': 'Improve endurance',  # Use endurance for fat loss
            'Stamina': 'Improve endurance',
        }
        mapped_goal = goal_mapping.get(goal, 'Improve endurance')
        return get_exercise_pool_by_goal(mapped_goal)

def calculate_workout_duration(exercises, exercise_durations):
    """Calculate total workout duration in seconds"""
    total = 0
    for exercise in exercises:
        # Estimate: 3 sets average, with rest
        duration = exercise_durations.get(exercise, {}).get('duration', 45)
        rest = exercise_durations.get(exercise, {}).get('rest', 20)
        sets = exercise_durations.get(exercise, {}).get('sets', 2)
        total += (duration + rest) * sets - rest  # Last set doesn't have rest after
    return total

# Exercise duration mapping (in seconds)
EXERCISE_DURATIONS = {
    # Warm-up: 20-30s duration, 10-15s rest, 2 sets
    'Arm Circles': {'duration': 30, 'rest': 10, 'sets': 2},
    'Leg Swings': {'duration': 30, 'rest': 15, 'sets': 2},
    'Torso Twists': {'duration': 30, 'rest': 15, 'sets': 2},
    'Neck Rolls': {'duration': 20, 'rest': 10, 'sets': 2},
    'Shoulder Rotations': {'duration': 30, 'rest': 10, 'sets': 2},
    'Hip Circles': {'duration': 30, 'rest': 15, 'sets': 2},
    'Ankle Rotations': {'duration': 20, 'rest': 10, 'sets': 2},
    'Walking Lunges': {'duration': 45, 'rest': 30, 'sets': 2},
    'Butt Kicks': {'duration': 30, 'rest': 20, 'sets': 2},
    'High Knees': {'duration': 30, 'rest': 20, 'sets': 2},
    'Side Steps': {'duration': 30, 'rest': 15, 'sets': 2},
    'Knee Hugs': {'duration': 20, 'rest': 10, 'sets': 2},
    'Quad Stretches': {'duration': 30, 'rest': 15, 'sets': 2},
    'Hamstring Stretches': {'duration': 30, 'rest': 15, 'sets': 2},
    
    # Endurance: 180-600s duration, 60-120s rest, 1-2 sets
    'Jogging': {'duration': 180, 'rest': 60, 'sets': 1},
    'Cycling': {'duration': 300, 'rest': 60, 'sets': 1},
    'Swimming': {'duration': 300, 'rest': 60, 'sets': 1},
    'Rowing Machine': {'duration': 180, 'rest': 60, 'sets': 2},
    'Elliptical Trainer': {'duration': 300, 'rest': 60, 'sets': 1},
    'Stair Climber': {'duration': 180, 'rest': 60, 'sets': 2},
    'Jump Rope': {'duration': 60, 'rest': 30, 'sets': 3},
    'Walking': {'duration': 300, 'rest': 30, 'sets': 1},
    'Brisk Walking': {'duration': 300, 'rest': 30, 'sets': 1},
    'Steady State Running': {'duration': 600, 'rest': 120, 'sets': 1},
    'Long Distance Running': {'duration': 900, 'rest': 180, 'sets': 1},
    'Cycling Sprints': {'duration': 30, 'rest': 60, 'sets': 5},
    'Swimming Laps': {'duration': 180, 'rest': 60, 'sets': 2},
    'Rowing Intervals': {'duration': 60, 'rest': 90, 'sets': 4},
    'Cross Trainer': {'duration': 300, 'rest': 60, 'sets': 1},
    'Treadmill Running': {'duration': 300, 'rest': 60, 'sets': 1},
    'Outdoor Running': {'duration': 300, 'rest': 60, 'sets': 1},
    'Bike Riding': {'duration': 600, 'rest': 120, 'sets': 1},
    'Pool Swimming': {'duration': 300, 'rest': 60, 'sets': 1},
    
    # Power: 15-30s duration, 30-60s rest, 3-4 sets
    'Burpees': {'duration': 30, 'rest': 30, 'sets': 3},
    'Box Jumps': {'duration': 30, 'rest': 45, 'sets': 3},
    'Tuck Jumps': {'duration': 30, 'rest': 30, 'sets': 3},
    'Medicine Ball Slams': {'duration': 30, 'rest': 30, 'sets': 3},
    'Kettlebell Swings': {'duration': 30, 'rest': 30, 'sets': 3},
    'Plyometric Push-ups': {'duration': 20, 'rest': 40, 'sets': 3},
    'Jump Squats': {'duration': 30, 'rest': 30, 'sets': 3},
    'Explosive Lunges': {'duration': 30, 'rest': 30, 'sets': 3},
    'Power Cleans': {'duration': 20, 'rest': 60, 'sets': 3},
    'Thruster Jumps': {'duration': 30, 'rest': 30, 'sets': 3},
    'Broad Jumps': {'duration': 20, 'rest': 40, 'sets': 4},
    'Single Leg Hops': {'duration': 20, 'rest': 30, 'sets': 3},
    'Clapping Push-ups': {'duration': 15, 'rest': 45, 'sets': 3},
    'Dumbbell Snatches': {'duration': 20, 'rest': 40, 'sets': 3},
    'Wall Ball Throws': {'duration': 30, 'rest': 30, 'sets': 3},
    'Heavy Kettlebell Swings': {'duration': 30, 'rest': 45, 'sets': 3},
    'Advanced Box Jumps': {'duration': 30, 'rest': 60, 'sets': 3},
    'Plyometric Lunges': {'duration': 30, 'rest': 30, 'sets': 3},
    'Jumping Burpees': {'duration': 30, 'rest': 30, 'sets': 3},
    
    # Stamina: 30-600s duration, 0-120s rest, 1-10 sets
    'Circuit Training': {'duration': 300, 'rest': 60, 'sets': 1},
    'Interval Running': {'duration': 60, 'rest': 90, 'sets': 5},
    'Assault Bike': {'duration': 180, 'rest': 60, 'sets': 2},
    'Shuttle Runs': {'duration': 30, 'rest': 30, 'sets': 5},
    'Fartlek Training': {'duration': 600, 'rest': 120, 'sets': 1},
    'Tabata Intervals': {'duration': 20, 'rest': 10, 'sets': 8},
    'Full Body Circuit': {'duration': 300, 'rest': 60, 'sets': 1},
    'HIIT Circuit': {'duration': 30, 'rest': 30, 'sets': 6},
    'CrossFit WOD': {'duration': 600, 'rest': 180, 'sets': 1},
    'AMRAP Workouts': {'duration': 600, 'rest': 120, 'sets': 1},
    'EMOM Workouts': {'duration': 60, 'rest': 0, 'sets': 10},
    'Cycling Intervals': {'duration': 60, 'rest': 90, 'sets': 4},
    'Swimming Intervals': {'duration': 60, 'rest': 90, 'sets': 4},
    'Stair Running': {'duration': 60, 'rest': 60, 'sets': 4},
    
    # Fat loss: 20-30s duration, 30-90s rest, 3-6 sets
    'HIIT Sprints': {'duration': 30, 'rest': 60, 'sets': 6},
    'Battle Ropes': {'duration': 30, 'rest': 30, 'sets': 4},
    'Mountain Climbers': {'duration': 30, 'rest': 30, 'sets': 3},
    'Jumping Jacks': {'duration': 30, 'rest': 15, 'sets': 2},
    'Sprint Intervals': {'duration': 30, 'rest': 90, 'sets': 5},
    'Assault Bike Sprints': {'duration': 30, 'rest': 60, 'sets': 5},
    'Rowing Sprints': {'duration': 30, 'rest': 60, 'sets': 5},
    'Weighted Burpees': {'duration': 30, 'rest': 45, 'sets': 3},
    'Intense Battle Ropes': {'duration': 30, 'rest': 45, 'sets': 4},
    'Jump Rope Intervals': {'duration': 30, 'rest': 30, 'sets': 5},
    'Sprint Burpees': {'duration': 20, 'rest': 40, 'sets': 5},
    'Power Snatches': {'duration': 20, 'rest': 40, 'sets': 4},
    'Intense Swimming Intervals': {'duration': 60, 'rest': 90, 'sets': 5},
}

def generate_workout_plan(skill_level, goal, duration_range, limitations=None, bmi_category='normal', rest_multiplier=1.0, sets_adjustment=0):
    """
    Generate a workout plan that matches the target duration
    
    Args:
        skill_level: 'Beginner', 'Intermediate', or 'Pro'
        goal: User's goal (quiz format or ML format)
        duration_range: '5-10 minutes', '10-20 minutes', or '20+ minutes'
        limitations: List of limitations
        bmi_category: 'underweight', 'normal', or 'overweight'
        rest_multiplier: Multiplier for rest times (1.0 = normal, >1.0 = longer rest)
        sets_adjustment: Adjustment to number of sets (-1, 0, +1)
    
    Returns:
        Dictionary with plan details
    """
    # Parse duration range
    if duration_range == '5-10 minutes':
        target_minutes = 7.5  # Middle of range
        min_minutes, max_minutes = 5, 10
    elif duration_range == '10-20 minutes':
        target_minutes = 15
        min_minutes, max_minutes = 10, 20
    else:  # 20+ minutes
        target_minutes = 25
        min_minutes, max_minutes = 20, 30
    
    target_seconds = target_minutes * 60
    
    # Get exercise pool
    exercise_pool = get_exercise_pool_by_goal(goal)
    
    # Filter by limitations
    if limitations:
        exercise_pool = filter_exercises_by_limitations(exercise_pool, limitations)
    
    # Filter by skill level
    if skill_level == 'Beginner':
        # Remove advanced exercises
        exercise_pool = [e for e in exercise_pool if 'Advanced' not in e and 'Heavy' not in e 
                        and 'Intense' not in e and 'Weighted' not in e and 'Power' not in e]
    elif skill_level == 'Intermediate':
        exercise_pool = [e for e in exercise_pool if 'Advanced' not in e and 'Heavy' not in e]
    
    # Select exercises to fit duration
    selected_exercises = []
    current_duration = 0
    
    # Add warm-up (always first)
    warmup_exercises = [e for e in exercise_pool if e in WARMUP_EXERCISES]
    if warmup_exercises:
        warmup = warmup_exercises[0]
        warmup_duration = EXERCISE_DURATIONS.get(warmup, {'duration': 30, 'rest': 15, 'sets': 2})
        # Apply BMI-based adjustments
        adjusted_rest = int(warmup_duration['rest'] * rest_multiplier)
        adjusted_sets = max(1, warmup_duration['sets'] + sets_adjustment)
        warmup_total = (warmup_duration['duration'] + adjusted_rest) * adjusted_sets - adjusted_rest
        if warmup_total <= target_seconds * 0.2:  # Warm-up should be max 20% of total
            selected_exercises.append(warmup)
            current_duration += warmup_total
            exercise_pool.remove(warmup)
    
    # Select main exercises
    remaining_pool = exercise_pool.copy()
    while current_duration < target_seconds * 0.8 and remaining_pool:  # Fill 80% of target
        # Try to find exercise that fits
        best_exercise = None
        best_duration = 0
        
        for exercise in remaining_pool:
            if exercise in EXERCISE_DURATIONS:
                ex_data = EXERCISE_DURATIONS[exercise]
                # Apply BMI-based adjustments
                adjusted_rest = int(ex_data['rest'] * rest_multiplier)
                adjusted_sets = max(1, ex_data['sets'] + sets_adjustment)
                ex_total = (ex_data['duration'] + adjusted_rest) * adjusted_sets - adjusted_rest
                
                if current_duration + ex_total <= target_seconds * 1.1:  # Allow 10% over
                    if ex_total > best_duration:
                        best_duration = ex_total
                        best_exercise = exercise
        
        if best_exercise:
            selected_exercises.append(best_exercise)
            current_duration += best_duration
            remaining_pool.remove(best_exercise)
        else:
            # No exercise fits, break
            break
    
    # If we're still under target, add shorter exercises
    if current_duration < target_seconds * 0.7:
        for exercise in remaining_pool[:3]:  # Add up to 3 more
            if exercise in EXERCISE_DURATIONS:
                ex_data = EXERCISE_DURATIONS[exercise]
                # Apply BMI-based adjustments
                adjusted_rest = int(ex_data['rest'] * rest_multiplier)
                adjusted_sets = max(1, ex_data['sets'] + sets_adjustment)
                ex_total = (ex_data['duration'] + adjusted_rest) * adjusted_sets - adjusted_rest
                if current_duration + ex_total <= target_seconds * 1.1:
                    selected_exercises.append(exercise)
                    current_duration += ex_total
    
    # Calculate final duration
    final_minutes = current_duration / 60
    
    return {
        'exercises': selected_exercises,
        'total_duration_seconds': current_duration,
        'total_duration_minutes': round(final_minutes, 1),
        'exercise_count': len(selected_exercises),
    }

def generate_3_plan_variations(skill_level, goal, duration_range, limitations=None, height=None, weight=None, bmi=None, adaptive_adjustments=None):
    """
    Generate 3 truly different workout plan variations based on quiz answers
    
    Args:
        skill_level: 'Beginner', 'Intermediate', or 'Pro'
        goal: User's goal
        duration_range: '5-10 minutes', '10-20 minutes', or '20+ minutes'
        limitations: List of limitations
        height: Height in cm (optional)
        weight: Weight in kg (optional)
        bmi: Pre-calculated BMI (optional)
    
    Returns:
        List of 3 plan dictionaries
    """
    # Calculate BMI category
    bmi_cat = get_bmi_category(height=height, weight=weight, bmi=bmi)
    
    # Determine adjustments based on BMI
    if bmi_cat == 'overweight':
        rest_multiplier_1 = 1.3  # Longer rest for overweight
        rest_multiplier_2 = 1.2  # Moderate rest
        sets_adj_1 = -1  # Fewer sets
        sets_adj_2 = 0
    elif bmi_cat == 'underweight':
        rest_multiplier_1 = 0.9  # Shorter rest
        rest_multiplier_2 = 1.0
        sets_adj_1 = 0
        sets_adj_2 = +1  # More sets
    else:  # normal
        rest_multiplier_1 = 1.0
        rest_multiplier_2 = 1.1
        sets_adj_1 = 0
        sets_adj_2 = 0
    
    # Apply adaptive adjustments if provided
    if adaptive_adjustments:
        rest_multiplier_1 *= (1.0 + adaptive_adjustments.get('rest_multiplier_adjustment', 0))
        rest_multiplier_2 *= (1.0 + adaptive_adjustments.get('rest_multiplier_adjustment', 0))
        sets_adj_1 += adaptive_adjustments.get('sets_adjustment', 0)
        sets_adj_2 += adaptive_adjustments.get('sets_adjustment', 0)
    
    plans = []
    
    # Apply exercise difficulty filter if adaptive adjustments specify it
    exercise_difficulty = adaptive_adjustments.get('exercise_difficulty', 'same') if adaptive_adjustments else 'same'
    
    # Plan 1: Optimized for exact quiz combination (primary match)
    plan1 = generate_workout_plan(
        skill_level, goal, duration_range, limitations,
        bmi_category=bmi_cat,
        rest_multiplier=rest_multiplier_1,
        sets_adjustment=sets_adj_1
    )
    
    # Filter exercises by difficulty if adaptive adjustments specify
    if exercise_difficulty == 'easier':
        # Remove advanced exercises from plan1
        plan1['exercises'] = [e for e in plan1['exercises'] if 'Advanced' not in e and 'Heavy' not in e and 'Intense' not in e]
    plans.append({
        'planName': f'{skill_level} {goal} Plan - Optimized',
        'skillLevel': skill_level,
        'goal': goal,
        'exercises': ';'.join(plan1['exercises']),
        'durationMinutes': int(plan1['total_duration_minutes']),
        'focus': goal,
        'equipment': 'None',
    })
    
    # Plan 2: Alternative intensity (different rest/sets based on BMI)
    plan2 = generate_workout_plan(
        skill_level, goal, duration_range, limitations,
        bmi_category=bmi_cat,
        rest_multiplier=rest_multiplier_2,
        sets_adjustment=sets_adj_2
    )
    # Try to get more variety if possible
    if len(plan2['exercises']) < 5:
        exercise_pool = get_exercise_pool_by_goal(goal)
        if limitations:
            exercise_pool = filter_exercises_by_limitations(exercise_pool, limitations)
        # Filter by skill level
        if skill_level == 'Beginner':
            exercise_pool = [e for e in exercise_pool if 'Advanced' not in e and 'Heavy' not in e 
                            and 'Intense' not in e and 'Weighted' not in e]
        elif skill_level == 'Intermediate':
            exercise_pool = [e for e in exercise_pool if 'Advanced' not in e and 'Heavy' not in e]
        # Add different exercises
        for ex in exercise_pool:
            if ex not in plan2['exercises'] and ex in EXERCISE_DURATIONS:
                plan2['exercises'].append(ex)
                if len(plan2['exercises']) >= 5:
                    break
    
    plans.append({
        'planName': f'{skill_level} {goal} Plan - Alternative Intensity',
        'skillLevel': skill_level,
        'goal': goal,
        'exercises': ';'.join(plan2['exercises']),
        'durationMinutes': int(plan2['total_duration_minutes']),
        'focus': goal,
        'equipment': 'None',
    })
    
    # Plan 3: Focused variation (fewer exercises, more intensity)
    plan3 = generate_workout_plan(
        skill_level, goal, duration_range, limitations,
        bmi_category=bmi_cat,
        rest_multiplier=max(0.8, rest_multiplier_1 - 0.1),  # Slightly shorter rest
        sets_adjustment=sets_adj_1
    )
    # Keep only first 4-5 exercises for focus
    if len(plan3['exercises']) > 5:
        plan3['exercises'] = plan3['exercises'][:5]
    
    plans.append({
        'planName': f'{skill_level} {goal} Plan - Focused',
        'skillLevel': skill_level,
        'goal': goal,
        'exercises': ';'.join(plan3['exercises']),
        'durationMinutes': int(plan3['total_duration_minutes']),
        'focus': goal,
        'equipment': 'None',
    })
    
    return plans

