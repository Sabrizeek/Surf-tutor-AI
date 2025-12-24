/**
 * Exercise Data Mapping
 * Contains duration, rest, sets, description, and limitation exclusions for each exercise
 */

export interface ExerciseData {
  name: string;
  duration: number; // seconds
  rest: number; // seconds
  sets: number;
  description: string;
  excludedLimitations: string[]; // Limitations that should exclude this exercise
  icon?: string; // Material icon name
  animationType?: 'lottie' | 'gif' | 'video'; // Type of animation
  animationSource?: any; // Animation source (require() path)
}

// Limitation categories
export const LIMITATION_CATEGORIES = {
  KNEE: ['Knee discomfort', 'Knee injury', 'Knee surgery recovery'],
  BACK: ['Lower back tightness', 'Lower back pain', 'Upper back pain'],
  SHOULDER: ['Shoulder injury', 'Shoulder pain', 'Rotator cuff issues'],
  ANKLE: ['Ankle injury', 'Ankle pain', 'Ankle instability'],
  WRIST: ['Wrist injury', 'Wrist pain', 'Carpal tunnel'],
  HIP: ['Hip discomfort', 'Hip pain', 'Hip injury'],
  RESPIRATORY: ['Asthma', 'Breathing difficulties'],
  CARDIOVASCULAR: ['Heart conditions', 'High blood pressure'],
  NECK: ['Neck pain', 'Neck injury'],
  ELBOW: ['Elbow pain', 'Tennis elbow', 'Golfer\'s elbow'],
};

// Exercise data mapping
export const EXERCISE_DATA: { [key: string]: ExerciseData } = {
  // Warm-up exercises
  'Jumping Jacks': {
    name: 'Jumping Jacks',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Stand with feet together, jump while spreading legs and raising arms overhead',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Arm Circles': {
    name: 'Arm Circles',
    duration: 30,
    rest: 10,
    sets: 2,
    description: 'Stand with arms extended, rotate arms in large circles forward and backward',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.ELBOW],
  },
  'Leg Swings': {
    name: 'Leg Swings',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Hold onto support, swing leg forward and backward to warm up hip flexors',
    excludedLimitations: [...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.KNEE],
  },
  'Torso Twists': {
    name: 'Torso Twists',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Stand with feet shoulder-width apart, rotate torso left and right',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.NECK],
  },
  'Neck Rolls': {
    name: 'Neck Rolls',
    duration: 20,
    rest: 10,
    sets: 2,
    description: 'Gently roll neck in circular motion to release tension',
    excludedLimitations: [...LIMITATION_CATEGORIES.NECK],
  },
  'Shoulder Rotations': {
    name: 'Shoulder Rotations',
    duration: 30,
    rest: 10,
    sets: 2,
    description: 'Rotate shoulders forward and backward in circular motion',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.ELBOW],
  },
  'Hip Circles': {
    name: 'Hip Circles',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Stand on one leg, rotate hip in circular motion',
    excludedLimitations: [...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.KNEE],
  },
  'Ankle Rotations': {
    name: 'Ankle Rotations',
    duration: 20,
    rest: 10,
    sets: 2,
    description: 'Lift foot and rotate ankle in circular motion',
    excludedLimitations: [...LIMITATION_CATEGORIES.ANKLE],
  },
  'Walking Lunges': {
    name: 'Walking Lunges',
    duration: 45,
    rest: 30,
    sets: 2,
    description: 'Step forward into lunge position, alternate legs while walking forward',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.ANKLE],
  },
  'Butt Kicks': {
    name: 'Butt Kicks',
    duration: 30,
    rest: 20,
    sets: 2,
    description: 'Run in place, kicking heels toward glutes',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'High Knees': {
    name: 'High Knees',
    duration: 30,
    rest: 20,
    sets: 2,
    description: 'Run in place, lifting knees toward chest',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Side Steps': {
    name: 'Side Steps',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Step sideways, bringing feet together, repeat in both directions',
    excludedLimitations: [...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.KNEE],
  },
  'Knee Hugs': {
    name: 'Knee Hugs',
    duration: 20,
    rest: 10,
    sets: 2,
    description: 'Stand and pull knee to chest, hold briefly, alternate legs',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.BACK],
  },
  'Quad Stretches': {
    name: 'Quad Stretches',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Stand and pull foot toward glutes, hold stretch',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE],
  },
  'Hamstring Stretches': {
    name: 'Hamstring Stretches',
    duration: 30,
    rest: 15,
    sets: 2,
    description: 'Sit or stand, extend leg and lean forward to stretch hamstring',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK],
  },

  // Endurance exercises
  'Jogging': {
    name: 'Jogging',
    duration: 180,
    rest: 60,
    sets: 1,
    description: 'Light running at comfortable pace',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Cycling': {
    name: 'Cycling',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Stationary or outdoor cycling',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK],
  },
  'Swimming': {
    name: 'Swimming',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Swim laps at moderate pace',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Rowing Machine': {
    name: 'Rowing Machine',
    duration: 180,
    rest: 60,
    sets: 2,
    description: 'Rowing machine at moderate intensity',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Elliptical Trainer': {
    name: 'Elliptical Trainer',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Low-impact cardio on elliptical machine',
    excludedLimitations: [],
  },
  'Stair Climber': {
    name: 'Stair Climber',
    duration: 180,
    rest: 60,
    sets: 2,
    description: 'Climb stairs at steady pace',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Jump Rope': {
    name: 'Jump Rope',
    duration: 60,
    rest: 30,
    sets: 3,
    description: 'Jump rope at steady rhythm',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Walking': {
    name: 'Walking',
    duration: 300,
    rest: 30,
    sets: 1,
    description: 'Brisk walking at moderate pace',
    excludedLimitations: [],
  },
  'Brisk Walking': {
    name: 'Brisk Walking',
    duration: 300,
    rest: 30,
    sets: 1,
    description: 'Fast-paced walking',
    excludedLimitations: [],
  },
  'Steady State Running': {
    name: 'Steady State Running',
    duration: 600,
    rest: 120,
    sets: 1,
    description: 'Continuous running at steady pace',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Long Distance Running': {
    name: 'Long Distance Running',
    duration: 900,
    rest: 180,
    sets: 1,
    description: 'Extended running session',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Cycling Sprints': {
    name: 'Cycling Sprints',
    duration: 30,
    rest: 60,
    sets: 5,
    description: 'High-intensity cycling sprints',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Swimming Laps': {
    name: 'Swimming Laps',
    duration: 180,
    rest: 60,
    sets: 2,
    description: 'Swimming laps at moderate pace',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Rowing Intervals': {
    name: 'Rowing Intervals',
    duration: 60,
    rest: 90,
    sets: 4,
    description: 'High-intensity rowing intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Cross Trainer': {
    name: 'Cross Trainer',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Cross trainer machine workout',
    excludedLimitations: [],
  },
  'Treadmill Running': {
    name: 'Treadmill Running',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Running on treadmill',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Outdoor Running': {
    name: 'Outdoor Running',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Running outdoors',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Bike Riding': {
    name: 'Bike Riding',
    duration: 600,
    rest: 120,
    sets: 1,
    description: 'Outdoor bike riding',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK],
  },
  'Pool Swimming': {
    name: 'Pool Swimming',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Swimming in pool',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },

  // Power exercises
  'Burpees': {
    name: 'Burpees',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Squat, jump back to plank, push-up, jump forward, jump up',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Box Jumps': {
    name: 'Box Jumps',
    duration: 30,
    rest: 45,
    sets: 3,
    description: 'Jump onto box or platform, step down',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Tuck Jumps': {
    name: 'Tuck Jumps',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Jump up, bringing knees to chest',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Medicine Ball Slams': {
    name: 'Medicine Ball Slams',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Lift medicine ball overhead, slam to ground',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Kettlebell Swings': {
    name: 'Kettlebell Swings',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Swing kettlebell from between legs to chest height',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Plyometric Push-ups': {
    name: 'Plyometric Push-ups',
    duration: 20,
    rest: 40,
    sets: 3,
    description: 'Explosive push-ups with hands leaving ground',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.ELBOW],
  },
  'Jump Squats': {
    name: 'Jump Squats',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Squat down, explode up into jump',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Explosive Lunges': {
    name: 'Explosive Lunges',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Lunge with explosive jump, switch legs mid-air',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Power Cleans': {
    name: 'Power Cleans',
    duration: 20,
    rest: 60,
    sets: 3,
    description: 'Explosive lift from floor to shoulders (simulated)',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.KNEE],
  },
  'Thruster Jumps': {
    name: 'Thruster Jumps',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Squat with weight, press overhead, jump',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Broad Jumps': {
    name: 'Broad Jumps',
    duration: 20,
    rest: 40,
    sets: 4,
    description: 'Jump forward as far as possible',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Single Leg Hops': {
    name: 'Single Leg Hops',
    duration: 20,
    rest: 30,
    sets: 3,
    description: 'Hop on one leg, switch legs',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Clapping Push-ups': {
    name: 'Clapping Push-ups',
    duration: 15,
    rest: 45,
    sets: 3,
    description: 'Push-up with clap mid-air',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.ELBOW],
  },
  'Dumbbell Snatches': {
    name: 'Dumbbell Snatches',
    duration: 20,
    rest: 40,
    sets: 3,
    description: 'Explosive lift from floor to overhead',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Wall Ball Throws': {
    name: 'Wall Ball Throws',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Squat and throw medicine ball to wall target',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Heavy Kettlebell Swings': {
    name: 'Heavy Kettlebell Swings',
    duration: 30,
    rest: 45,
    sets: 3,
    description: 'Kettlebell swings with heavier weight',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Advanced Box Jumps': {
    name: 'Advanced Box Jumps',
    duration: 30,
    rest: 60,
    sets: 3,
    description: 'Higher box jumps for advanced users',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Plyometric Lunges': {
    name: 'Plyometric Lunges',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Explosive jumping lunges',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.HIP, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Jumping Burpees': {
    name: 'Jumping Burpees',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Burpees with jump at end',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },

  // Stamina exercises
  'Circuit Training': {
    name: 'Circuit Training',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Multiple exercises in sequence with minimal rest',
    excludedLimitations: [],
  },
  'Interval Running': {
    name: 'Interval Running',
    duration: 60,
    rest: 90,
    sets: 5,
    description: 'Alternate between sprint and recovery',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Assault Bike': {
    name: 'Assault Bike',
    duration: 180,
    rest: 60,
    sets: 2,
    description: 'High-intensity bike intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Shuttle Runs': {
    name: 'Shuttle Runs',
    duration: 30,
    rest: 30,
    sets: 5,
    description: 'Run back and forth between markers',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Fartlek Training': {
    name: 'Fartlek Training',
    duration: 600,
    rest: 120,
    sets: 1,
    description: 'Continuous running with varying speeds',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Tabata Intervals': {
    name: 'Tabata Intervals',
    duration: 20,
    rest: 10,
    sets: 8,
    description: '20 seconds work, 10 seconds rest, repeat 8 times',
    excludedLimitations: [...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Full Body Circuit': {
    name: 'Full Body Circuit',
    duration: 300,
    rest: 60,
    sets: 1,
    description: 'Complete body circuit workout',
    excludedLimitations: [],
  },
  'HIIT Circuit': {
    name: 'HIIT Circuit',
    duration: 30,
    rest: 30,
    sets: 6,
    description: 'High-intensity interval training circuit',
    excludedLimitations: [...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'CrossFit WOD': {
    name: 'CrossFit WOD',
    duration: 600,
    rest: 180,
    sets: 1,
    description: 'CrossFit workout of the day',
    excludedLimitations: [],
  },
  'AMRAP Workouts': {
    name: 'AMRAP Workouts',
    duration: 600,
    rest: 120,
    sets: 1,
    description: 'As many rounds as possible in time limit',
    excludedLimitations: [],
  },
  'EMOM Workouts': {
    name: 'EMOM Workouts',
    duration: 60,
    rest: 0,
    sets: 10,
    description: 'Every minute on the minute workout',
    excludedLimitations: [...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Rowing Intervals': {
    name: 'Rowing Intervals',
    duration: 60,
    rest: 90,
    sets: 4,
    description: 'High-intensity rowing intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Cycling Intervals': {
    name: 'Cycling Intervals',
    duration: 60,
    rest: 90,
    sets: 4,
    description: 'High-intensity cycling intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Swimming Intervals': {
    name: 'Swimming Intervals',
    duration: 60,
    rest: 90,
    sets: 4,
    description: 'High-intensity swimming intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Stair Running': {
    name: 'Stair Running',
    duration: 60,
    rest: 60,
    sets: 4,
    description: 'Running up and down stairs',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },

  // Fat loss exercises
  'HIIT Sprints': {
    name: 'HIIT Sprints',
    duration: 30,
    rest: 60,
    sets: 6,
    description: 'High-intensity sprint intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Battle Ropes': {
    name: 'Battle Ropes',
    duration: 30,
    rest: 30,
    sets: 4,
    description: 'Wave battle ropes up and down',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Mountain Climbers': {
    name: 'Mountain Climbers',
    duration: 30,
    rest: 30,
    sets: 3,
    description: 'Plank position, alternate bringing knees to chest',
    excludedLimitations: [...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.BACK],
  },
  'Sprint Intervals': {
    name: 'Sprint Intervals',
    duration: 30,
    rest: 90,
    sets: 5,
    description: 'Maximum effort sprint intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Assault Bike Sprints': {
    name: 'Assault Bike Sprints',
    duration: 30,
    rest: 60,
    sets: 5,
    description: 'Maximum effort bike sprints',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.RESPIRATORY, ...LIMITATION_CATEGORIES.CARDIOVASCULAR],
  },
  'Rowing Sprints': {
    name: 'Rowing Sprints',
    duration: 30,
    rest: 60,
    sets: 5,
    description: 'Maximum effort rowing sprints',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Weighted Burpees': {
    name: 'Weighted Burpees',
    duration: 30,
    rest: 45,
    sets: 3,
    description: 'Burpees with added weight',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Intense Battle Ropes': {
    name: 'Intense Battle Ropes',
    duration: 30,
    rest: 45,
    sets: 4,
    description: 'High-intensity battle rope waves',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Jump Rope Intervals': {
    name: 'Jump Rope Intervals',
    duration: 30,
    rest: 30,
    sets: 5,
    description: 'High-intensity jump rope intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.ANKLE, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Sprint Burpees': {
    name: 'Sprint Burpees',
    duration: 20,
    rest: 40,
    sets: 5,
    description: 'Fast-paced burpees',
    excludedLimitations: [...LIMITATION_CATEGORIES.KNEE, ...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
  'Power Snatches': {
    name: 'Power Snatches',
    duration: 20,
    rest: 40,
    sets: 4,
    description: 'Explosive snatch movement',
    excludedLimitations: [...LIMITATION_CATEGORIES.BACK, ...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.WRIST],
  },
  'Intense Swimming Intervals': {
    name: 'Intense Swimming Intervals',
    duration: 60,
    rest: 90,
    sets: 5,
    description: 'High-intensity swimming intervals',
    excludedLimitations: [...LIMITATION_CATEGORIES.SHOULDER, ...LIMITATION_CATEGORIES.RESPIRATORY],
  },
};

/**
 * Get exercise data by name
 */
export function getExerciseData(exerciseName: string): ExerciseData | null {
  return EXERCISE_DATA[exerciseName] || null;
}

/**
 * Get default exercise data if not found
 */
export function getDefaultExerciseData(exerciseName: string): ExerciseData {
  return {
    name: exerciseName,
    duration: 45,
    rest: 20,
    sets: 2,
    description: `${exerciseName} exercise`,
    excludedLimitations: [],
  };
}

/**
 * Check if exercise should be excluded based on limitations
 */
export function isExerciseExcluded(exerciseName: string, limitations: string[]): boolean {
  const exerciseData = getExerciseData(exerciseName);
  if (!exerciseData) return false;
  
  return limitations.some(limitation => 
    exerciseData.excludedLimitations.includes(limitation)
  );
}

/**
 * Filter exercises based on limitations
 */
export function filterExercisesByLimitations(exercises: string[], limitations: string[]): string[] {
  if (!limitations || limitations.length === 0 || limitations.includes('None')) {
    return exercises;
  }
  
  return exercises.filter(exercise => !isExerciseExcluded(exercise, limitations));
}

