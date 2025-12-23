/**
 * Badge Definitions
 * Defines all badges for Pose Estimation, Cardio, and AR categories
 */

export type BadgeCategory = 'poseEstimation' | 'cardio' | 'ar';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  color: string;
}

export const POSE_ESTIMATION_BADGES: Badge[] = [
  {
    id: 'pose_novice',
    name: 'Novice',
    description: 'Complete your first drill',
    category: 'poseEstimation',
    icon: 'star',
    color: '#FFD700',
  },
  {
    id: 'pose_warrior',
    name: 'Warrior',
    description: 'Complete all 8 drills',
    category: 'poseEstimation',
    icon: 'emoji-events',
    color: '#FF6B6B',
  },
  {
    id: 'pose_perfectionist',
    name: 'Perfectionist',
    description: 'Score 90+ on any drill',
    category: 'poseEstimation',
    icon: 'verified',
    color: '#4ECDC4',
  },
  {
    id: 'pose_master',
    name: 'Master',
    description: 'Score 90+ on all drills',
    category: 'poseEstimation',
    icon: 'workspace-premium',
    color: '#95E1D3',
  },
  {
    id: 'pose_marathon',
    name: 'Marathon',
    description: 'Practice for 1 hour total',
    category: 'poseEstimation',
    icon: 'timer',
    color: '#F38181',
  },
  {
    id: 'pose_consistent',
    name: 'Consistent',
    description: 'Practice 7 days in a row',
    category: 'poseEstimation',
    icon: 'calendar-today',
    color: '#AA96DA',
  },
  {
    id: 'stance_expert',
    name: 'Stance Expert',
    description: 'Score 95+ on stance 10 times',
    category: 'poseEstimation',
    icon: 'directions-walk',
    color: '#34C759',
  },
  {
    id: 'popup_expert',
    name: 'Pop-Up Expert',
    description: 'Score 95+ on pop-up 10 times',
    category: 'poseEstimation',
    icon: 'arrow-upward',
    color: '#007AFF',
  },
  {
    id: 'paddling_expert',
    name: 'Paddling Expert',
    description: 'Score 95+ on paddling 10 times',
    category: 'poseEstimation',
    icon: 'rowing',
    color: '#5AC8FA',
  },
  {
    id: 'bottom_turn_expert',
    name: 'Bottom Turn Expert',
    description: 'Score 95+ on bottom turn 10 times',
    category: 'poseEstimation',
    icon: 'rotate-right',
    color: '#FF9500',
  },
  {
    id: 'pumping_expert',
    name: 'Pumping Expert',
    description: 'Score 95+ on pumping 10 times',
    category: 'poseEstimation',
    icon: 'trending-up',
    color: '#FF2D55',
  },
  {
    id: 'tube_expert',
    name: 'Tube Expert',
    description: 'Score 95+ on tube stance 10 times',
    category: 'poseEstimation',
    icon: 'waves',
    color: '#AF52DE',
  },
  {
    id: 'falling_expert',
    name: 'Falling Expert',
    description: 'Score 95+ on falling 10 times',
    category: 'poseEstimation',
    icon: 'falling',
    color: '#FF3B30',
  },
  {
    id: 'cutback_expert',
    name: 'Cutback Expert',
    description: 'Score 95+ on cutback 10 times',
    category: 'poseEstimation',
    icon: 'swap-horiz',
    color: '#FFCC00',
  },
];

export const CARDIO_BADGES: Badge[] = [
  {
    id: 'cardio_starter',
    name: 'Starter',
    description: 'Complete your first workout',
    category: 'cardio',
    icon: 'fitness-center',
    color: '#FF6B6B',
  },
  {
    id: 'cardio_burner',
    name: 'Burner',
    description: 'Burn 500 calories',
    category: 'cardio',
    icon: 'local-fire-department',
    color: '#FF9500',
  },
  {
    id: 'cardio_warrior',
    name: 'Warrior',
    description: 'Complete 10 workouts',
    category: 'cardio',
    icon: 'emoji-events',
    color: '#FF2D55',
  },
  {
    id: 'cardio_marathon',
    name: 'Marathon',
    description: '5 hours total cardio time',
    category: 'cardio',
    icon: 'timer',
    color: '#34C759',
  },
];

export const AR_BADGES: Badge[] = [
  {
    id: 'ar_explorer',
    name: 'Explorer',
    description: 'Complete your first AR module',
    category: 'ar',
    icon: 'explore',
    color: '#5AC8FA',
  },
  {
    id: 'ar_master',
    name: 'Master',
    description: 'Complete all AR modules',
    category: 'ar',
    icon: 'workspace-premium',
    color: '#AF52DE',
  },
];

export const ALL_BADGES: Badge[] = [
  ...POSE_ESTIMATION_BADGES,
  ...CARDIO_BADGES,
  ...AR_BADGES,
];

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(badge => badge.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(badge => badge.category === category);
}

