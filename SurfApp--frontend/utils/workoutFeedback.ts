/**
 * Workout Feedback Generator
 * Generates contextual feedback messages based on user behavior
 */

import { WorkoutProgress } from './adaptiveProgress';
import { getMostSkippedActivity } from './adaptiveProgress';

export function generateWorkoutFeedback(
  workout: WorkoutProgress, 
  history: WorkoutProgress[]
): string[] {
  const feedback: string[] = [];
  
  // Completion rate feedback
  if (workout.completionRate >= 85) {
    feedback.push("Great job completing your workout! You're building consistency.");
  } else if (workout.completionRate >= 70 && workout.completionRate < 85) {
    feedback.push("Good effort! You're making progress.");
  } else if (workout.completionRate <= 50) {
    feedback.push("Consider taking longer rest between activities or reducing intensity.");
  } else if (workout.completionRate > 50 && workout.completionRate < 70) {
    feedback.push("You're doing well! Try to complete a few more activities next time.");
  }
  
  // Streak feedback
  const streak = calculateStreak(history);
  if (streak >= 7) {
    feedback.push(`Amazing! You've worked out ${streak} days in a row! Keep it up!`);
  } else if (streak >= 3) {
    feedback.push(`Great streak! You've worked out ${streak} days in a row.`);
  }
  
  // Activity-specific feedback
  const skippedActivities = workout.activities.filter(a => a.status === 'skipped');
  if (skippedActivities.length > 0) {
    const mostSkipped = getMostSkippedActivity(history);
    if (mostSkipped && skippedActivities.some(a => a.name === mostSkipped)) {
      feedback.push(`You often skip ${mostSkipped}. Consider trying a lower-impact alternative.`);
    } else if (skippedActivities.length === 1) {
      feedback.push(`You skipped ${skippedActivities[0].name}. That's okay - listen to your body!`);
    }
  }
  
  // Duration feedback
  if (workout.totalDurationPlanned > 0) {
    const durationRatio = workout.totalDurationActual / workout.totalDurationPlanned;
    if (durationRatio > 1.2) {
      feedback.push("You took longer than planned - great dedication!");
    } else if (durationRatio < 0.7) {
      feedback.push("You finished faster than planned. Consider increasing intensity next time!");
    }
  }
  
  // First workout feedback
  if (history.length === 0) {
    feedback.push("Welcome! This is your first workout. Keep it up!");
  }
  
  // Improvement feedback
  if (history.length >= 2) {
    const previousWorkout = history[history.length - 2];
    if (workout.completionRate > previousWorkout.completionRate + 10) {
      feedback.push("You're improving! Your completion rate increased significantly.");
    }
  }
  
  return feedback;
}

function calculateStreak(workouts: WorkoutProgress[]): number {
  if (workouts.length === 0) return 0;
  
  const sorted = [...workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const workout of sorted) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = new Date(workoutDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
}

