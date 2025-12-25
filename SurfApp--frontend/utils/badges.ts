/**
 * ENHANCED Badge Definitions - 30+ Badges with GIF Support
 * Defines all badges for Pose Estimation, Cardio, and AR categories
 */

export type BadgeCategory = 'poseEstimation' | 'cardio' | 'ar';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  color: string;
  gifUrl?: string; // GIF animation URL
  requirement: number; // Numeric requirement for progress tracking
  requirementType: 'count' | 'time' | 'streak' | 'score' | 'percentage';
  requirementUnit: string; // "workouts", "minutes", "days", etc.
}

// ============================================================================
// CARDIO BADGES - 20 NEW BADGES WITH VARIETY
// ============================================================================

export const CARDIO_BADGES: Badge[] = [
  // BEGINNER TIER (Bronze)
  {
    id: 'cardio_first_step',
    name: 'First Step',
    description: 'Complete your first workout',
    category: 'cardio',
    tier: 'bronze',
    icon: 'directions-walk',
    color: '#CD7F32',
    requirement: 1,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_early_bird',
    name: 'Early Bird',
    description: 'Complete 3 workouts',
    category: 'cardio',
    tier: 'bronze',
    icon: 'wb-sunny',
    color: '#CD7F32',
    requirement: 3,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_30_min_club',
    name: '30 Minute Club',
    description: 'Complete 30 minutes total cardio',
    category: 'cardio',
    tier: 'bronze',
    icon: 'timer',
    color: '#CD7F32',
    requirement: 30,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'cardio_3_day_streak',
    name: '3-Day Streak',
    description: 'Work out 3 days in a row',
    category: 'cardio',
    tier: 'bronze',
    icon: 'local-fire-department',
    color: '#FF6B4A',
    requirement: 3,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
  
  // INTERMEDIATE TIER (Silver)
  {
    id: 'cardio_warrior',
    name: 'Cardio Warrior',
    description: 'Complete 10 workouts',
    category: 'cardio',
    tier: 'silver',
    icon: 'fitness-center',
    color: '#C0C0C0',
    requirement: 10,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_hour_master',
    name: 'Hour Master',
    description: 'Complete 60 minutes total cardio',
    category: 'cardio',
    tier: 'silver',
    icon: 'schedule',
    color: '#C0C0C0',
    requirement: 60,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'cardio_week_warrior',
    name: 'Week Warrior',
    description: 'Work out 7 days in a row',
    category: 'cardio',
    tier: 'silver',
    icon: 'calendar-today',
    color: '#C0C0C0',
    requirement: 7,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
  {
    id: 'cardio_perfectionist',
    name: 'Perfectionist',
    description: 'Complete a workout with 100% completion rate',
    category: 'cardio',
    tier: 'silver',
    icon: 'verified',
    color: '#4ECDC4',
    requirement: 100,
    requirementType: 'percentage',
    requirementUnit: '%',
  },
  {
    id: 'cardio_calorie_crusher',
    name: 'Calorie Crusher',
    description: 'Burn 500 estimated calories',
    category: 'cardio',
    tier: 'silver',
    icon: 'whatshot',
    color: '#FF5722',
    requirement: 500,
    requirementType: 'count',
    requirementUnit: 'calories',
  },
  
  // ADVANCED TIER (Gold)
  {
    id: 'cardio_champion',
    name: 'Cardio Champion',
    description: 'Complete 25 workouts',
    category: 'cardio',
    tier: 'gold',
    icon: 'emoji-events',
    color: '#FFD700',
    requirement: 25,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_3_hour_club',
    name: '3 Hour Club',
    description: 'Complete 180 minutes total cardio',
    category: 'cardio',
    tier: 'gold',
    icon: 'access-time',
    color: '#FFD700',
    requirement: 180,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'cardio_consistency_king',
    name: 'Consistency King',
    description: 'Work out 14 days in a row',
    category: 'cardio',
    tier: 'gold',
    icon: 'trending-up',
    color: '#FFD700',
    requirement: 14,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
  {
    id: 'cardio_speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 HIIT workouts',
    category: 'cardio',
    tier: 'gold',
    icon: 'flash-on',
    color: '#FFC107',
    requirement: 5,
    requirementType: 'count',
    requirementUnit: 'HIIT workouts',
  },
  {
    id: 'cardio_endurance_beast',
    name: 'Endurance Beast',
    description: 'Complete a 30+ minute workout',
    category: 'cardio',
    tier: 'gold',
    icon: 'directions-run',
    color: '#FF9800',
    requirement: 30,
    requirementType: 'time',
    requirementUnit: 'minutes (single)',
  },
  
  // ELITE TIER (Platinum)
  {
    id: 'cardio_legend',
    name: 'Cardio Legend',
    description: 'Complete 50 workouts',
    category: 'cardio',
    tier: 'platinum',
    icon: 'workspace-premium',
    color: '#E5E4E2',
    requirement: 50,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_marathon',
    name: 'Marathon Runner',
    description: 'Complete 5 hours (300 minutes) total cardio',
    category: 'cardio',
    tier: 'platinum',
    icon: 'flag',
    color: '#E5E4E2',
    requirement: 300,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'cardio_30_day_challenge',
    name: '30-Day Challenge',
    description: 'Work out 30 days in a row',
    category: 'cardio',
    tier: 'platinum',
    icon: 'star',
    color: '#E5E4E2',
    requirement: 30,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
  {
    id: 'cardio_calorie_inferno',
    name: 'Calorie Inferno',
    description: 'Burn 2000 estimated calories',
    category: 'cardio',
    tier: 'platinum',
    icon: 'local-fire-department',
    color: '#FF4500',
    requirement: 2000,
    requirementType: 'count',
    requirementUnit: 'calories',
  },
  
  // ULTIMATE TIER (Diamond)
  {
    id: 'cardio_immortal',
    name: 'Cardio Immortal',
    description: 'Complete 100 workouts',
    category: 'cardio',
    tier: 'diamond',
    icon: 'military-tech',
    color: '#B9F2FF',
    requirement: 100,
    requirementType: 'count',
    requirementUnit: 'workouts',
  },
  {
    id: 'cardio_ultra_marathon',
    name: 'Ultra Marathon',
    description: 'Complete 10 hours (600 minutes) total cardio',
    category: 'cardio',
    tier: 'diamond',
    icon: 'sports-score',
    color: '#B9F2FF',
    requirement: 600,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'cardio_unstoppable',
    name: 'Unstoppable',
    description: 'Work out 60 days in a row',
    category: 'cardio',
    tier: 'diamond',
    icon: 'auto-awesome',
    color: '#B9F2FF',
    requirement: 60,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
];

// ============================================================================
// POSE ESTIMATION BADGES - ENHANCED
// ============================================================================

export const POSE_ESTIMATION_BADGES: Badge[] = [
  {
    id: 'pose_novice',
    name: 'Pose Novice',
    description: 'Complete your first drill',
    category: 'poseEstimation',
    tier: 'bronze',
    icon: 'star',
    color: '#CD7F32',
    requirement: 1,
    requirementType: 'count',
    requirementUnit: 'drills',
  },
  {
    id: 'pose_warrior',
    name: 'Pose Warrior',
    description: 'Complete all 8 drills',
    category: 'poseEstimation',
    tier: 'gold',
    icon: 'emoji-events',
    color: '#FFD700',
    requirement: 8,
    requirementType: 'count',
    requirementUnit: 'drills',
  },
  {
    id: 'pose_perfectionist',
    name: 'Perfectionist',
    description: 'Score 90+ on any drill',
    category: 'poseEstimation',
    tier: 'silver',
    icon: 'verified',
    color: '#4ECDC4',
    requirement: 90,
    requirementType: 'score',
    requirementUnit: 'score',
  },
  {
    id: 'pose_master',
    name: 'Pose Master',
    description: 'Score 90+ on all drills',
    category: 'poseEstimation',
    tier: 'platinum',
    icon: 'workspace-premium',
    color: '#E5E4E2',
    requirement: 90,
    requirementType: 'score',
    requirementUnit: 'avg score',
  },
  {
    id: 'pose_marathon',
    name: 'Practice Marathon',
    description: 'Practice for 1 hour total',
    category: 'poseEstimation',
    tier: 'gold',
    icon: 'timer',
    color: '#FFD700',
    requirement: 60,
    requirementType: 'time',
    requirementUnit: 'minutes',
  },
  {
    id: 'pose_consistent',
    name: 'Consistent Practitioner',
    description: 'Practice 7 days in a row',
    category: 'poseEstimation',
    tier: 'silver',
    icon: 'calendar-today',
    color: '#C0C0C0',
    requirement: 7,
    requirementType: 'streak',
    requirementUnit: 'days',
  },
];

// ============================================================================
// AR BADGES - ENHANCED
// ============================================================================

export const AR_BADGES: Badge[] = [
  {
    id: 'ar_explorer',
    name: 'AR Explorer',
    description: 'Complete your first AR module',
    category: 'ar',
    tier: 'bronze',
    icon: 'explore',
    color: '#CD7F32',
    requirement: 1,
    requirementType: 'count',
    requirementUnit: 'modules',
  },
  {
    id: 'ar_master',
    name: 'AR Master',
    description: 'Complete all AR modules',
    category: 'ar',
    tier: 'platinum',
    icon: 'workspace-premium',
    color: '#E5E4E2',
    requirement: 5,
    requirementType: 'count',
    requirementUnit: 'modules',
  },
];

export const ALL_BADGES: Badge[] = [
  ...CARDIO_BADGES,
  ...POSE_ESTIMATION_BADGES,
  ...AR_BADGES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(badge => badge.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(badge => badge.category === category);
}

export function getBadgesByTier(tier: BadgeTier): Badge[] {
  return ALL_BADGES.filter(badge => badge.tier === tier);
}

export function getNextBadge(category: BadgeCategory, earnedBadges: string[]): Badge | null {
  const categoryBadges = getBadgesByCategory(category);
  const earnedSet = new Set(earnedBadges);
  
  // Find next unearned badge
  return categoryBadges.find(badge => !earnedSet.has(badge.id)) || null;
}

export function getBadgeProgress(badge: Badge, currentValue: number): number {
  return Math.min(100, (currentValue / badge.requirement) * 100);
}

export function getTierColor(tier: BadgeTier): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };
  return colors[tier];
}

export function getTierGradient(tier: BadgeTier): string[] {
  const gradients = {
    bronze: ['#CD7F32', '#965A1E'],
    silver: ['#C0C0C0', '#808080'],
    gold: ['#FFD700', '#FFA500'],
    platinum: ['#E5E4E2', '#B0B0B0'],
    diamond: ['#B9F2FF', '#00CED1'],
  };
  return gradients[tier];
}