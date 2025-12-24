/**
 * Progress Formatter
 * Standardizes progress units across all modules (Cardio, Pose, AR)
 */

export const PROGRESS_UNITS = {
  TIME: 'minutes', // Always minutes for consistency
  SESSIONS: 'sessions',
  ACCURACY: 'percentage',
  COMPLETION: 'percentage',
};

export interface FormattedProgress {
  time: string;
  sessions: string;
  completion?: string;
  accuracy?: string;
}

export function formatProgress(module: 'cardio' | 'pose' | 'ar', data: any): FormattedProgress {
  switch (module) {
    case 'cardio':
      const totalMinutes = data.totalMinutes || (data.totalDurationActual || 0);
      const workoutsCompleted = data.workoutsCompleted || data.sessions || 0;
      const completionRate = data.averageCompletionRate || data.completionRate || 0;
      
      return {
        time: `${totalMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${workoutsCompleted} workouts`,
        completion: `${completionRate}%`,
      };
    
    case 'pose':
      const poseMinutes = data.totalMinutes || (data.totalTime ? Math.floor(data.totalTime / 60) : 0);
      const poseSessions = data.sessions || 0;
      const poseAccuracy = data.averageAccuracy || (data.scores ? calculateAverageScore(data.scores) : 0);
      
      return {
        time: `${poseMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${poseSessions} ${PROGRESS_UNITS.SESSIONS}`,
        accuracy: `${poseAccuracy}%`,
      };
    
    case 'ar':
      const arMinutes = data.totalMinutes || (data.totalTime ? Math.floor(data.totalTime / 60) : 0);
      const arSessions = data.sessions || 0;
      const arAccuracy = data.spatialAccuracy || 0;
      
      return {
        time: `${arMinutes} ${PROGRESS_UNITS.TIME}`,
        sessions: `${arSessions} ${PROGRESS_UNITS.SESSIONS}`,
        accuracy: `${arAccuracy}%`,
      };
    
    default:
      return {
        time: `0 ${PROGRESS_UNITS.TIME}`,
        sessions: `0 ${PROGRESS_UNITS.SESSIONS}`,
      };
  }
}

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
 * Format completion rate to percentage string
 */
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}${PROGRESS_UNITS.COMPLETION}`;
}

