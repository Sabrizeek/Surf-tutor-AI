/**
 * Badge Awarding Logic
 * Checks progress and awards badges accordingly
 */

import { Badge, BadgeCategory, POSE_ESTIMATION_BADGES, CARDIO_BADGES, AR_BADGES } from './badges';

export interface PoseProgress {
  completedDrills: string[];
  scores: { [drillId: string]: number[] };
  totalTime: number; // seconds
  sessions: number;
  badges: string[];
  lastPracticeDate?: number;
  consecutiveDays?: number;
}

export interface CardioProgress {
  completedWorkouts: string[];
  totalTime: number; // seconds
  calories: number;
  sessions: number;
  badges: string[];
}

export interface ARProgress {
  completedModules: string[];
  totalTime: number; // seconds
  sessions: number;
  badges: string[];
}

/**
 * Check and award pose estimation badges
 * Phase 4.2: Enhanced with performance-based triggers
 */
export function checkPoseBadges(
  progress: PoseProgress,
  currentSession?: {
    stabilityScore?: number;
    duration?: number;
    drillId?: string;
    popupVelocity?: number;
    perfectAnglesDuration?: number;
    consecutiveHighScores?: number;
  }
): string[] {
  const newBadges: string[] = [];
  const existingBadges = new Set(progress.badges || []);

  // pose_novice: Complete first drill
  if (progress.completedDrills.length >= 1 && !existingBadges.has('pose_novice')) {
    newBadges.push('pose_novice');
  }

  // pose_warrior: Complete all 8 drills
  if (progress.completedDrills.length >= 8 && !existingBadges.has('pose_warrior')) {
    newBadges.push('pose_warrior');
  }

  // pose_perfectionist: Score 90+ on any drill
  const hasHighScore = Object.values(progress.scores || {}).some(
    scores => scores.some(score => score >= 90)
  );
  if (hasHighScore && !existingBadges.has('pose_perfectionist')) {
    newBadges.push('pose_perfectionist');
  }

  // pose_master: Score 90+ on all drills
  const allDrillsHaveHighScore = Object.values(progress.scores || {}).every(
    scores => scores.some(score => score >= 90)
  ) && Object.keys(progress.scores || {}).length >= 8;
  if (allDrillsHaveHighScore && !existingBadges.has('pose_master')) {
    newBadges.push('pose_master');
  }

  // pose_marathon: Practice for 1 hour total (3600 seconds)
  if (progress.totalTime >= 3600 && !existingBadges.has('pose_marathon')) {
    newBadges.push('pose_marathon');
  }

  // pose_consistent: Practice 7 days in a row
  if (progress.consecutiveDays && progress.consecutiveDays >= 7 && !existingBadges.has('pose_consistent')) {
    newBadges.push('pose_consistent');
  }

  // Phase 4.2: Performance-based badges
  // steady_rail: Maintain >0.9 stability for 30 seconds
  if (
    currentSession &&
    currentSession.stabilityScore !== undefined &&
    currentSession.duration !== undefined &&
    currentSession.stabilityScore > 0.9 &&
    currentSession.duration >= 30 &&
    !existingBadges.has('steady_rail')
  ) {
    newBadges.push('steady_rail');
  }

  // popup_king: Pop-up speed in top 10% (velocity > threshold)
  const POPUP_VELOCITY_THRESHOLD = 0.5; // Normalized units per second
  if (
    currentSession &&
    currentSession.drillId === 'popup' &&
    currentSession.popupVelocity !== undefined &&
    currentSession.popupVelocity > POPUP_VELOCITY_THRESHOLD &&
    !existingBadges.has('popup_king')
  ) {
    newBadges.push('popup_king');
  }

  // angle_master: Maintain perfect angles for 60 seconds
  if (
    currentSession &&
    currentSession.perfectAnglesDuration !== undefined &&
    currentSession.perfectAnglesDuration >= 60 &&
    !existingBadges.has('angle_master')
  ) {
    newBadges.push('angle_master');
  }

  // form_perfectionist: Score 95%+ on 10 consecutive drills
  if (
    currentSession &&
    currentSession.consecutiveHighScores !== undefined &&
    currentSession.consecutiveHighScores >= 10 &&
    !existingBadges.has('form_perfectionist')
  ) {
    newBadges.push('form_perfectionist');
  }

  // marathon_surfer: Complete 100 drills total
  const totalDrillCompletions = Object.values(progress.scores || {}).reduce(
    (sum, scores) => sum + scores.length,
    0
  );
  if (totalDrillCompletions >= 100 && !existingBadges.has('marathon_surfer')) {
    newBadges.push('marathon_surfer');
  }

  // Drill-specific expert badges: Score 95+ on specific drill 10 times
  const drillIds = ['stance', 'popup', 'paddling', 'bottom_turn', 'pumping', 'tube_stance', 'falling', 'cutback'];
  drillIds.forEach(drillId => {
    const badgeId = `${drillId}_expert`;
    const scores = progress.scores[drillId] || [];
    const highScores = scores.filter(score => score >= 95);
    if (highScores.length >= 10 && !existingBadges.has(badgeId)) {
      newBadges.push(badgeId);
    }
  });

  return newBadges;
}

/**
 * Check and award cardio badges
 */
export function checkCardioBadges(progress: CardioProgress): string[] {
  const newBadges: string[] = [];
  const existingBadges = new Set(progress.badges || []);

  // cardio_starter: Complete first workout
  if (progress.completedWorkouts.length >= 1 && !existingBadges.has('cardio_starter')) {
    newBadges.push('cardio_starter');
  }

  // cardio_burner: Burn 500 calories
  if (progress.calories >= 500 && !existingBadges.has('cardio_burner')) {
    newBadges.push('cardio_burner');
  }

  // cardio_warrior: Complete 10 workouts
  if (progress.completedWorkouts.length >= 10 && !existingBadges.has('cardio_warrior')) {
    newBadges.push('cardio_warrior');
  }

  // cardio_marathon: 5 hours total cardio time (18000 seconds)
  if (progress.totalTime >= 18000 && !existingBadges.has('cardio_marathon')) {
    newBadges.push('cardio_marathon');
  }

  return newBadges;
}

/**
 * Check and award AR badges
 */
export function checkARBadges(progress: ARProgress): string[] {
  const newBadges: string[] = [];
  const existingBadges = new Set(progress.badges || []);

  // ar_explorer: Complete first AR module
  if (progress.completedModules.length >= 1 && !existingBadges.has('ar_explorer')) {
    newBadges.push('ar_explorer');
  }

  // ar_master: Complete all AR modules (assuming 5 modules)
  if (progress.completedModules.length >= 5 && !existingBadges.has('ar_master')) {
    newBadges.push('ar_master');
  }

  return newBadges;
}

/**
 * Award badge via API
 */
export async function awardBadge(category: BadgeCategory, badgeId: string): Promise<void> {
  try {
    const { gamificationAPI } = require('../services/api');
    await gamificationAPI.awardPoints(0, badgeId);
  } catch (error) {
    console.error(`[Badge] Error awarding badge ${badgeId}:`, error);
  }
}

