/**
 * Adaptive Progress Intelligence
 * Calculates adaptive adjustments based on workout history
 */

export interface WorkoutProgress {
  date: string;
  planName: string;
  totalDurationPlanned: number;
  totalDurationActual: number;
  activities: Array<{
    name: string;
    status: string;
    durationPlanned: number;
    durationActual?: number;
    setsPlanned: number;
    setsCompleted?: number;
  }>;
  completionRate: number;
  activitiesCompleted: number;
  activitiesSkipped: number;
}

export interface AdaptiveAdjustments {
  intensityAdjustment: number;
  restMultiplierAdjustment: number;
  setsAdjustment: number;
  exerciseDifficultyAdjustment: 'easier' | 'same' | 'harder';
}

export function calculateAdaptiveAdjustments(
  recentWorkouts: WorkoutProgress[]
): AdaptiveAdjustments {
  // Guard against null/undefined
  if (!recentWorkouts || !Array.isArray(recentWorkouts) || recentWorkouts.length === 0) {
    return {
      intensityAdjustment: 0,
      restMultiplierAdjustment: 0,
      setsAdjustment: 0,
      exerciseDifficultyAdjustment: 'same',
    };
  }
  
  // Calculate average completion rate
  const avgCompletionRate = recentWorkouts.reduce(
    (sum, w) => sum + (w.completionRate || 0), 0
  ) / recentWorkouts.length;
  
  // Track skipped activities
  const skippedActivities: { [key: string]: number } = {};
  recentWorkouts.forEach(workout => {
    // Guard against missing activities array
    if (workout && workout.activities && Array.isArray(workout.activities)) {
      workout.activities.forEach(activity => {
        if (activity && activity.status === 'skipped') {
          skippedActivities[activity.name] = (skippedActivities[activity.name] || 0) + 1;
        }
      });
    }
  });
  
  // Calculate average duration ratio (actual vs planned)
  const avgDurationRatio = recentWorkouts.reduce((sum, w) => {
    if (w.totalDurationPlanned > 0) {
      return sum + (w.totalDurationActual / w.totalDurationPlanned);
    }
    return sum;
  }, 0) / recentWorkouts.length;
  
  const adjustments: AdaptiveAdjustments = {
    intensityAdjustment: 0,
    restMultiplierAdjustment: 0,
    setsAdjustment: 0,
    exerciseDifficultyAdjustment: 'same',
  };
  
  // Rule-based adaptation
  if (avgCompletionRate >= 85) {
    // User performing well - increase intensity
    adjustments.intensityAdjustment = 1;
    adjustments.setsAdjustment = +1;
    adjustments.exerciseDifficultyAdjustment = 'harder';
  } else if (avgCompletionRate <= 50) {
    // User struggling - reduce intensity
    adjustments.restMultiplierAdjustment = +0.2; // Longer rest (20% more)
    adjustments.setsAdjustment = -1; // Fewer sets
    adjustments.exerciseDifficultyAdjustment = 'easier';
  } else if (avgCompletionRate >= 70 && avgCompletionRate < 85) {
    // Moderate performance - slight increase
    adjustments.setsAdjustment = 0;
    adjustments.restMultiplierAdjustment = -0.1; // Slightly shorter rest
  }
  
  // If user consistently finishes early, they can handle more
  if (avgDurationRatio > 1.1 && avgCompletionRate >= 75) {
    adjustments.intensityAdjustment += 1;
    adjustments.setsAdjustment += 1;
  }
  
  // If user consistently takes longer, they need more rest
  if (avgDurationRatio < 0.8 && avgCompletionRate < 70) {
    adjustments.restMultiplierAdjustment += 0.15;
  }
  
  return adjustments;
}

/**
 * Get most frequently skipped activity
 */
export function getMostSkippedActivity(workouts: WorkoutProgress[]): string | null {
  // Guard against null/undefined
  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
    return null;
  }
  
  const skippedCounts: { [key: string]: number } = {};
  
  workouts.forEach(workout => {
    // Guard against missing activities array
    if (workout && workout.activities && Array.isArray(workout.activities)) {
      workout.activities.forEach(activity => {
        if (activity && activity.status === 'skipped') {
          skippedCounts[activity.name] = (skippedCounts[activity.name] || 0) + 1;
        }
      });
    }
  });
  
  let maxCount = 0;
  let mostSkipped: string | null = null;
  
  Object.entries(skippedCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostSkipped = name;
    }
  });
  
  return mostSkipped;
}

