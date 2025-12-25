/**
 * Enhanced Progress Formatter
 * Standardizes progress units across all modules with additional stats
 */

export const PROGRESS_UNITS = {
  TIME: 'minutes',
  SECONDS: 'seconds',
  SESSIONS: 'sessions',
  ACCURACY: 'percentage',
  COMPLETION: 'percentage',
  CALORIES: 'kcal',
  DISTANCE: 'km',
};

export interface FormattedProgress {
  time: string;
  sessions: string;
  completion?: string;
  accuracy?: string;
  calories?: string; // ✅ NEW
  averageSessionTime?: string; // ✅ NEW
  streak?: string; // ✅ NEW
  improvement?: string; // ✅ NEW
}

/**
 * ✅ ENHANCED: Main progress formatter with more stats
 */
export function formatProgress(module: 'cardio' | 'pose' | 'ar', data: any): FormattedProgress {
  switch (module) {
    case 'cardio':
      const totalMinutes = data.totalMinutes || (data.totalDurationActual || 0);
      const workoutsCompleted = data.workoutsCompleted || data.sessions || 0;
      const completionRate = data.averageCompletionRate || data.completionRate || 0;
      const totalCalories = data.totalCalories || 0;
      const streak = data.streak || 0;
      
      // Calculate average session time
      const avgSessionTime = workoutsCompleted > 0 
        ? Math.round(totalMinutes / workoutsCompleted) 
        : 0;
      
      return {
        time: `${totalMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${workoutsCompleted} workouts`,
        completion: `${Math.round(completionRate)}%`,
        calories: totalCalories > 0 ? `${totalCalories} ${PROGRESS_UNITS.CALORIES}` : undefined,
        averageSessionTime: avgSessionTime > 0 ? `${avgSessionTime} min/workout` : undefined,
        streak: streak > 0 ? `${streak} days` : undefined,
      };
    
    case 'pose':
      const poseMinutes = data.totalMinutes || (data.totalTime ? Math.floor(data.totalTime / 60) : 0);
      const poseSessions = data.sessions || 0;
      const poseAccuracy = data.averageAccuracy || (data.scores ? calculateAverageScore(data.scores) : 0);
      const poseImprovement = data.improvement || 0;
      
      return {
        time: `${poseMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${poseSessions} ${PROGRESS_UNITS.SESSIONS}`,
        accuracy: `${Math.round(poseAccuracy)}%`,
        improvement: poseImprovement > 0 ? `+${poseImprovement}%` : undefined,
      };
    
    case 'ar':
      const arMinutes = data.totalMinutes || (data.totalTime ? Math.floor(data.totalTime / 60) : 0);
      const arSessions = data.sessions || 0;
      const arAccuracy = data.spatialAccuracy || 0;
      
      return {
        time: `${arMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${arSessions} ${PROGRESS_UNITS.SESSIONS}`,
        accuracy: `${Math.round(arAccuracy)}%`,
      };
    
    default:
      return {
        time: `0 ${PROGRESS_UNITS.TIME}`,
        sessions: `0 ${PROGRESS_UNITS.SESSIONS}`,
      };
  }
}

/**
 * Calculate average score from various score formats
 */
function calculateAverageScore(scores: Record<string, number | number[]>): number {
  const allScores: number[] = [];
  
  Object.values(scores).forEach(value => {
    if (typeof value === 'number') {
      allScores.push(value);
    } else if (Array.isArray(value)) {
      allScores.push(...value);
    }
  });
  
  if (allScores.length === 0) return 0;
  
  const sum = allScores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / allScores.length) * 100) / 100;
}

/**
 * Format time in seconds to minutes string
 */
export function formatTimeToMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes} ${PROGRESS_UNITS.TIME}`;
}

/**
 * ✅ NEW: Format time in seconds to MM:SS string
 */
export function formatTimeToMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ✅ NEW: Format time in seconds to human-readable string (e.g., "2h 15m")
 */
export function formatTimeToHumanReadable(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format completion rate to percentage string
 */
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}%`;
}

/**
 * ✅ NEW: Format calories burned
 */
export function formatCalories(calories: number): string {
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k ${PROGRESS_UNITS.CALORIES}`;
  }
  return `${Math.round(calories)} ${PROGRESS_UNITS.CALORIES}`;
}

/**
 * ✅ NEW: Format distance
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  if (km >= 1) {
    return `${km.toFixed(2)} ${PROGRESS_UNITS.DISTANCE}`;
  }
  return `${Math.round(meters)}m`;
}

/**
 * ✅ NEW: Calculate and format improvement percentage
 */
export function calculateImprovement(current: number, previous: number): string {
  if (previous === 0) return '+0%';
  
  const improvement = ((current - previous) / previous) * 100;
  const sign = improvement > 0 ? '+' : '';
  return `${sign}${Math.round(improvement)}%`;
}

/**
 * ✅ NEW: Format workout summary
 */
export function formatWorkoutSummary(data: {
  duration: number; // seconds
  activitiesCompleted: number;
  totalActivities: number;
  caloriesBurned?: number;
  completionRate?: number;
}): string {
  const parts: string[] = [];
  
  // Duration
  parts.push(`Duration: ${formatTimeToHumanReadable(data.duration)}`);
  
  // Activities
  parts.push(`Activities: ${data.activitiesCompleted}/${data.totalActivities}`);
  
  // Completion rate
  if (data.completionRate !== undefined) {
    parts.push(`Completion: ${Math.round(data.completionRate)}%`);
  }
  
  // Calories
  if (data.caloriesBurned) {
    parts.push(`Calories: ${formatCalories(data.caloriesBurned)}`);
  }
  
  return parts.join(' • ');
}

/**
 * ✅ NEW: Format streak message
 */
export function formatStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return '🔥 1 day streak!';
  if (streak < 7) return `🔥 ${streak} days streak! Keep it up!`;
  if (streak < 30) return `🔥🔥 ${streak} days streak! Amazing!`;
  return `🔥🔥🔥 ${streak} days streak! Legendary!`;
}

/**
 * ✅ NEW: Get progress emoji based on completion rate
 */
export function getProgressEmoji(completionRate: number): string {
  if (completionRate >= 90) return '🌟'; // Excellent
  if (completionRate >= 75) return '💪'; // Great
  if (completionRate >= 60) return '👍'; // Good
  if (completionRate >= 40) return '📈'; // Improving
  return '💪'; // Keep trying
}

/**
 * ✅ NEW: Format weekly summary
 */
export function formatWeeklySummary(data: {
  workouts: number;
  totalMinutes: number;
  avgCompletionRate: number;
  totalCalories?: number;
  bestDay?: string;
}): string {
  const parts: string[] = [];
  
  parts.push(`${data.workouts} workouts this week`);
  parts.push(`${data.totalMinutes} minutes total`);
  parts.push(`${Math.round(data.avgCompletionRate)}% avg completion`);
  
  if (data.totalCalories) {
    parts.push(`${formatCalories(data.totalCalories)} burned`);
  }
  
  if (data.bestDay) {
    parts.push(`Best day: ${data.bestDay}`);
  }
  
  return parts.join('\n');
}

/**
 * ✅ NEW: Calculate pace (for running/cycling)
 */
export function calculatePace(distanceMeters: number, timeSeconds: number): string {
  if (distanceMeters === 0) return '0:00/km';
  
  const km = distanceMeters / 1000;
  const minutesPerKm = timeSeconds / 60 / km;
  const mins = Math.floor(minutesPerKm);
  const secs = Math.round((minutesPerKm - mins) * 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}/km`;
}

/**
 * ✅ NEW: Get motivational message based on progress
 */
export function getMotivationalMessage(completionRate: number, streak: number): string {
  if (streak >= 7 && completionRate >= 80) {
    return "You're on fire! 🔥 Keep this amazing momentum going!";
  }
  if (completionRate >= 90) {
    return "Outstanding performance! 🌟 You're crushing it!";
  }
  if (completionRate >= 75) {
    return "Great work! 💪 You're making excellent progress!";
  }
  if (completionRate >= 60) {
    return "Good job! 👍 You're building consistency!";
  }
  if (streak > 0) {
    return `Keep going! You're on a ${streak}-day streak! 🔥`;
  }
  return "Every workout counts! 💪 Let's keep moving forward!";
}

/**
 * ✅ NEW: Format personal record message
 */
export function formatPersonalRecord(type: 'duration' | 'calories' | 'completion', value: number, previousRecord?: number): string {
  let message = '';
  
  switch (type) {
    case 'duration':
      message = `🏆 New record! ${formatTimeToHumanReadable(value)}`;
      if (previousRecord) {
        message += ` (previous: ${formatTimeToHumanReadable(previousRecord)})`;
      }
      break;
    case 'calories':
      message = `🏆 New calorie record! ${formatCalories(value)}`;
      if (previousRecord) {
        message += ` (previous: ${formatCalories(previousRecord)})`;
      }
      break;
    case 'completion':
      message = `🏆 New completion record! ${Math.round(value)}%`;
      if (previousRecord) {
        message += ` (previous: ${Math.round(previousRecord)}%)`;
      }
      break;
  }
  
  return message;
}