import pandas as pd
import random
import json

# ============================================================================
# PROFESSIONAL CARDIO WORKOUT DATA GENERATOR
# Generates 2000+ diverse, realistic workout plans
# ============================================================================

# --- EXERCISE LIBRARY WITH METADATA ---

EXERCISES = {
    # Warm-up exercises (1-2 min each)
    'Jumping Jacks': {
        'category': 'warmup',
        'duration_range': (60, 120),
        'intensity': 'low',
        'equipment': 'None',
        'limitations_exclude': [],
        'skill_min': 'Beginner'
    },
    'Arm Circles': {
        'category': 'warmup',
        'duration_range': (45, 90),
        'intensity': 'low',
        'equipment': 'None',
        'limitations_exclude': ['Shoulder injury', 'Rotator cuff issues'],
        'skill_min': 'Beginner'
    },
    'Leg Swings': {
        'category': 'warmup',
        'duration_range': (60, 90),
        'intensity': 'low',
        'equipment': 'None',
        'limitations_exclude': ['Hip problems', 'Groin injury'],
        'skill_min': 'Beginner'
    },
    'High Knees': {
        'category': 'warmup',
        'duration_range': (45, 90),
        'intensity': 'medium',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Hip problems'],
        'skill_min': 'Beginner'
    },
    'Butt Kicks': {
        'category': 'warmup',
        'duration_range': (45, 90),
        'intensity': 'medium',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Hamstring injury'],
        'skill_min': 'Beginner'
    },
    
    # Endurance exercises (3-10 min each)
    'Jogging': {
        'category': 'endurance',
        'duration_range': (180, 600),
        'intensity': 'medium',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints'],
        'skill_min': 'Beginner'
    },
    'Brisk Walking': {
        'category': 'endurance',
        'duration_range': (300, 600),
        'intensity': 'low',
        'equipment': 'None',
        'limitations_exclude': ['Ankle injury'],
        'skill_min': 'Beginner'
    },
    'Cycling': {
        'category': 'endurance',
        'duration_range': (300, 900),
        'intensity': 'medium',
        'equipment': 'Gym',
        'limitations_exclude': ['Knee discomfort'],
        'skill_min': 'Beginner'
    },
    'Swimming': {
        'category': 'endurance',
        'duration_range': (300, 900),
        'intensity': 'medium',
        'equipment': 'Gym',
        'limitations_exclude': ['Shoulder injury', 'Rotator cuff issues'],
        'skill_min': 'Intermediate'
    },
    'Rowing Machine': {
        'category': 'endurance',
        'duration_range': (180, 600),
        'intensity': 'medium',
        'equipment': 'Gym',
        'limitations_exclude': ['Lower back issues', 'Knee discomfort'],
        'skill_min': 'Beginner'
    },
    'Elliptical Trainer': {
        'category': 'endurance',
        'duration_range': (300, 900),
        'intensity': 'medium',
        'equipment': 'Gym',
        'limitations_exclude': [],
        'skill_min': 'Beginner'
    },
    'Stair Climber': {
        'category': 'endurance',
        'duration_range': (180, 480),
        'intensity': 'high',
        'equipment': 'Gym',
        'limitations_exclude': ['Knee discomfort', 'Hip problems'],
        'skill_min': 'Intermediate'
    },
    'Jump Rope': {
        'category': 'endurance',
        'duration_range': (120, 300),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints', 'Calf strain'],
        'skill_min': 'Beginner'
    },
    'Steady State Running': {
        'category': 'endurance',
        'duration_range': (600, 1800),
        'intensity': 'medium',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints'],
        'skill_min': 'Intermediate'
    },
    'Long Distance Running': {
        'category': 'endurance',
        'duration_range': (1200, 2400),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints', 'Hip problems'],
        'skill_min': 'Pro'
    },
    
    # Power exercises (30s-2min high intensity)
    'Burpees': {
        'category': 'power',
        'duration_range': (30, 120),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Wrist pain', 'Shoulder injury', 'Knee discomfort', 'Lower back issues'],
        'skill_min': 'Beginner'
    },
    'Box Jumps': {
        'category': 'power',
        'duration_range': (30, 90),
        'intensity': 'very_high',
        'equipment': 'Gym',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Hip problems', 'Achilles tendon issues'],
        'skill_min': 'Intermediate'
    },
    'Jump Squats': {
        'category': 'power',
        'duration_range': (30, 90),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Hip problems'],
        'skill_min': 'Beginner'
    },
    'Tuck Jumps': {
        'category': 'power',
        'duration_range': (30, 60),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Hip problems', 'Lower back issues'],
        'skill_min': 'Intermediate'
    },
    'Medicine Ball Slams': {
        'category': 'power',
        'duration_range': (45, 120),
        'intensity': 'high',
        'equipment': 'Gym',
        'limitations_exclude': ['Shoulder injury', 'Lower back issues', 'Wrist pain'],
        'skill_min': 'Intermediate'
    },
    'Kettlebell Swings': {
        'category': 'power',
        'duration_range': (60, 180),
        'intensity': 'high',
        'equipment': 'Kettlebell',
        'limitations_exclude': ['Lower back issues', 'Shoulder injury', 'Wrist pain'],
        'skill_min': 'Intermediate'
    },
    'Plyometric Push-ups': {
        'category': 'power',
        'duration_range': (30, 90),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Wrist pain', 'Shoulder injury', 'Elbow pain'],
        'skill_min': 'Intermediate'
    },
    'Explosive Lunges': {
        'category': 'power',
        'duration_range': (45, 120),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Hip problems', 'Ankle injury'],
        'skill_min': 'Intermediate'
    },
    'Broad Jumps': {
        'category': 'power',
        'duration_range': (30, 90),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Hip problems'],
        'skill_min': 'Intermediate'
    },
    'Power Cleans': {
        'category': 'power',
        'duration_range': (60, 180),
        'intensity': 'very_high',
        'equipment': 'Gym',
        'limitations_exclude': ['Wrist pain', 'Shoulder injury', 'Lower back issues', 'Knee discomfort'],
        'skill_min': 'Pro'
    },
    
    # Stamina/HIIT exercises (varied intervals)
    'HIIT Sprints': {
        'category': 'stamina',
        'duration_range': (120, 300),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints', 'Hip problems'],
        'skill_min': 'Intermediate'
    },
    'Mountain Climbers': {
        'category': 'stamina',
        'duration_range': (45, 120),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Wrist pain', 'Shoulder injury', 'Hip problems'],
        'skill_min': 'Beginner'
    },
    'Battle Ropes': {
        'category': 'stamina',
        'duration_range': (30, 90),
        'intensity': 'very_high',
        'equipment': 'Gym',
        'limitations_exclude': ['Shoulder injury', 'Elbow pain', 'Wrist pain', 'Lower back issues'],
        'skill_min': 'Intermediate'
    },
    'Assault Bike': {
        'category': 'stamina',
        'duration_range': (120, 300),
        'intensity': 'very_high',
        'equipment': 'Gym',
        'limitations_exclude': ['Knee discomfort'],
        'skill_min': 'Intermediate'
    },
    'Shuttle Runs': {
        'category': 'stamina',
        'duration_range': (90, 240),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints'],
        'skill_min': 'Beginner'
    },
    'Tabata Intervals': {
        'category': 'stamina',
        'duration_range': (240, 480),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': [],
        'skill_min': 'Intermediate'
    },
    'Circuit Training': {
        'category': 'stamina',
        'duration_range': (300, 900),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': [],
        'skill_min': 'Beginner'
    },
    'Interval Running': {
        'category': 'stamina',
        'duration_range': (180, 600),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints'],
        'skill_min': 'Intermediate'
    },
    'Rowing Intervals': {
        'category': 'stamina',
        'duration_range': (180, 480),
        'intensity': 'high',
        'equipment': 'Gym',
        'limitations_exclude': ['Lower back issues', 'Knee discomfort'],
        'skill_min': 'Intermediate'
    },
    'Fartlek Training': {
        'category': 'stamina',
        'duration_range': (300, 900),
        'intensity': 'high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury'],
        'skill_min': 'Intermediate'
    },
    
    # Fat Loss exercises (high intensity, shorter duration)
    'Sprint Intervals': {
        'category': 'fatloss',
        'duration_range': (120, 300),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Shin splints'],
        'skill_min': 'Intermediate'
    },
    'Jumping Burpees': {
        'category': 'fatloss',
        'duration_range': (30, 90),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Wrist pain', 'Shoulder injury', 'Knee discomfort', 'Ankle injury'],
        'skill_min': 'Intermediate'
    },
    'High Intensity Cycling': {
        'category': 'fatloss',
        'duration_range': (180, 480),
        'intensity': 'very_high',
        'equipment': 'Gym',
        'limitations_exclude': ['Knee discomfort'],
        'skill_min': 'Intermediate'
    },
    'Kettlebell HIIT': {
        'category': 'fatloss',
        'duration_range': (120, 300),
        'intensity': 'very_high',
        'equipment': 'Kettlebell',
        'limitations_exclude': ['Lower back issues', 'Shoulder injury', 'Wrist pain'],
        'skill_min': 'Intermediate'
    },
    'Jump Rope HIIT': {
        'category': 'fatloss',
        'duration_range': (90, 240),
        'intensity': 'very_high',
        'equipment': 'None',
        'limitations_exclude': ['Knee discomfort', 'Ankle injury', 'Calf strain'],
        'skill_min': 'Beginner'
    }
}

# --- GOAL CONFIGURATIONS ---
GOAL_CONFIGS = {
    'Endurance': {
        'primary_categories': ['endurance'],
        'secondary_categories': ['warmup', 'stamina'],
        'intensity_preference': ['low', 'medium'],
        'rest_ratio': 0.3,  # 30% rest time
        'sets_range': (2, 3)
    },
    'Power': {
        'primary_categories': ['power'],
        'secondary_categories': ['warmup', 'stamina'],
        'intensity_preference': ['high', 'very_high'],
        'rest_ratio': 0.5,  # 50% rest time (power needs recovery)
        'sets_range': (3, 4)
    },
    'Fat Loss': {
        'primary_categories': ['fatloss', 'stamina'],
        'secondary_categories': ['warmup', 'power'],
        'intensity_preference': ['high', 'very_high'],
        'rest_ratio': 0.2,  # 20% rest time (minimal rest)
        'sets_range': (2, 4)
    },
    'Stamina': {
        'primary_categories': ['stamina', 'endurance'],
        'secondary_categories': ['warmup', 'power'],
        'intensity_preference': ['medium', 'high'],
        'rest_ratio': 0.25,  # 25% rest time
        'sets_range': (2, 3)
    }
}

# --- SKILL LEVEL ADJUSTMENTS ---
SKILL_MODIFIERS = {
    'Beginner': {
        'intensity_multiplier': 0.7,
        'rest_multiplier': 1.3,
        'max_exercises': 5,
        'prefer_low_impact': True
    },
    'Intermediate': {
        'intensity_multiplier': 1.0,
        'rest_multiplier': 1.0,
        'max_exercises': 6,
        'prefer_low_impact': False
    },
    'Pro': {
        'intensity_multiplier': 1.3,
        'rest_multiplier': 0.8,
        'max_exercises': 7,
        'prefer_low_impact': False
    }
}

# --- DURATION TARGETS ---
DURATION_TARGETS = {
    '5-10 minutes': {'min': 300, 'max': 600, 'target': 450},
    '10-20 minutes': {'min': 600, 'max': 1200, 'target': 900},
    '20+ minutes': {'min': 1200, 'max': 2400, 'target': 1500}
}

# --- WORKOUT PLAN GENERATOR ---
def generate_realistic_plan(skill_level, goal, equipment, duration_range, limitations=None):
    """
    Generates a realistic, diverse workout plan based on user parameters
    """
    if limitations is None:
        limitations = []
    
    # Get configurations
    goal_config = GOAL_CONFIGS[goal]
    skill_modifier = SKILL_MODIFIERS[skill_level]
    duration_target = DURATION_TARGETS[duration_range]['target']
    
    # Filter available exercises
    available_exercises = []
    for ex_name, ex_data in EXERCISES.items():
        # Check skill level
        skill_order = ['Beginner', 'Intermediate', 'Pro']
        if skill_order.index(ex_data['skill_min']) > skill_order.index(skill_level):
            continue
        
        # Check equipment
        if ex_data['equipment'] != 'None' and ex_data['equipment'] != equipment and equipment != 'Gym':
            continue
        
        # Check limitations
        if any(lim in ex_data['limitations_exclude'] for lim in limitations):
            continue
        
        available_exercises.append((ex_name, ex_data))
    
    # Build workout plan
    selected_exercises = []
    total_duration = 0
    
    # 1. Add warm-up (15-20% of total time)
    warmup_target = duration_target * 0.175
    warmup_pool = [(n, d) for n, d in available_exercises if d['category'] == 'warmup']
    
    warmup_time = 0
    warmup_count = 0
    while warmup_time < warmup_target and warmup_count < 3 and warmup_pool:
        ex_name, ex_data = random.choice(warmup_pool)
        warmup_pool.remove((ex_name, ex_data))
        
        duration = random.randint(ex_data['duration_range'][0], ex_data['duration_range'][1])
        duration = int(duration * skill_modifier['intensity_multiplier'])
        
        selected_exercises.append({
            'name': ex_name,
            'duration': duration,
            'sets': 1,
            'rest': 15,
            'category': 'warmup'
        })
        warmup_time += duration + 15
        warmup_count += 1
    
    total_duration += warmup_time
    
    # 2. Add main exercises (80% of remaining time)
    remaining_target = duration_target - total_duration
    
    # Get primary exercises
    primary_pool = [(n, d) for n, d in available_exercises 
                   if d['category'] in goal_config['primary_categories']
                   and d['intensity'] in goal_config['intensity_preference']]
    
    # Get secondary exercises for variety
    secondary_pool = [(n, d) for n, d in available_exercises 
                     if d['category'] in goal_config['secondary_categories']
                     and d['category'] != 'warmup']
    
    main_exercises_count = 0
    max_main = skill_modifier['max_exercises'] - warmup_count
    
    while total_duration < duration_target * 0.95 and main_exercises_count < max_main:
        # 70% primary, 30% secondary
        if random.random() < 0.7 and primary_pool:
            ex_name, ex_data = random.choice(primary_pool)
            primary_pool.remove((ex_name, ex_data))
        elif secondary_pool:
            ex_name, ex_data = random.choice(secondary_pool)
            secondary_pool.remove((ex_name, ex_data))
        else:
            break
        
        # Calculate duration and sets
        duration = random.randint(ex_data['duration_range'][0], ex_data['duration_range'][1])
        duration = int(duration * skill_modifier['intensity_multiplier'])
        
        sets_min, sets_max = goal_config['sets_range']
        sets = random.randint(sets_min, sets_max)
        
        # Calculate rest based on intensity
        base_rest = 30 if ex_data['intensity'] in ['high', 'very_high'] else 20
        rest = int(base_rest * skill_modifier['rest_multiplier'])
        
        exercise_total_time = (duration * sets) + (rest * (sets - 1))
        
        # Don't add if it overshoots too much
        if total_duration + exercise_total_time > duration_target * 1.15:
            continue
        
        selected_exercises.append({
            'name': ex_name,
            'duration': duration,
            'sets': sets,
            'rest': rest,
            'category': ex_data['category']
        })
        
        total_duration += exercise_total_time
        main_exercises_count += 1
    
    # Format as semicolon-separated string
    exercises_str = ';'.join([ex['name'] for ex in selected_exercises])
    actual_duration = int(total_duration / 60)  # Convert to minutes
    
    # Create descriptive plan name
    plan_name = f"{skill_level} {goal} - {duration_range} ({equipment})"
    
    return {
        'planName': plan_name,
        'skillLevel': skill_level,
        'goal': goal,
        'equipment': equipment,
        'durationMinutes': actual_duration,
        'focus': goal,
        'exercises': exercises_str,
        'exerciseDetails': json.dumps(selected_exercises)  # Store detailed info
    }

# --- GENERATE DATASET ---
def generate_dataset(num_plans=2000):
    """
    Generate diverse, realistic workout plans
    """
    print(f"🏋️ Generating {num_plans} professional cardio workout plans...")
    
    plans = []
    
    # Common limitations to test
    limitation_sets = [
        [],
        ['Knee discomfort'],
        ['Lower back issues'],
        ['Shoulder injury'],
        ['Ankle injury'],
        ['Knee discomfort', 'Lower back issues'],
        ['Wrist pain', 'Shoulder injury'],
        ['Hip problems', 'Knee discomfort']
    ]
    
    for i in range(num_plans):
        # Random parameters
        skill = random.choice(['Beginner', 'Intermediate', 'Pro'])
        goal = random.choice(['Endurance', 'Power', 'Fat Loss', 'Stamina'])
        equipment = random.choice(['None', 'Kettlebell', 'Gym'])
        duration = random.choice(['5-10 minutes', '10-20 minutes', '20+ minutes'])
        limitations = random.choice(limitation_sets)
        
        # Generate plan
        try:
            plan = generate_realistic_plan(skill, goal, equipment, duration, limitations)
            plans.append(plan)
            
            if (i + 1) % 200 == 0:
                print(f"  ✓ Generated {i + 1}/{num_plans} plans")
        except Exception as e:
            print(f"  ✗ Error generating plan {i + 1}: {e}")
    
    return pd.DataFrame(plans)

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # Generate dataset
    df = generate_dataset(2000)
    
    # Save to CSV
    output_file = 'cardio_plans_professional_2000.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n✅ SUCCESS! Generated {len(df)} plans")
    print(f"📁 Saved to: {output_file}")
    print(f"\n📊 Dataset Statistics:")
    print(f"  - Skill Levels: {df['skillLevel'].value_counts().to_dict()}")
    print(f"  - Goals: {df['goal'].value_counts().to_dict()}")
    print(f"  - Equipment: {df['equipment'].value_counts().to_dict()}")
    print(f"  - Avg Duration: {df['durationMinutes'].mean():.1f} minutes")
    print(f"  - Unique Plans: {df['exercises'].nunique()}")
    print(f"\n🎯 Sample Plans:")
    print(df[['planName', 'exercises', 'durationMinutes']].head(3).to_string(index=False))