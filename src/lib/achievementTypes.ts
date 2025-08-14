// Achievement System Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirements: AchievementRequirement;
  stakesReward: number;
  hidden?: boolean; // Hidden until unlocked
}

export interface ScouterAchievement {
  scouterName: string;
  achievementId: string;
  unlockedAt: number;
  progress?: number; // For tracking progress toward achievement
}

export type AchievementCategory = 
  | 'accuracy' 
  | 'volume' 
  | 'streaks' 
  | 'special' 
  | 'social' 
  | 'time'
  | 'improvement';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export interface AchievementRequirement {
  type: 'exact' | 'minimum' | 'percentage' | 'streak' | 'special' | 'custom';
  value: number;
  property?: keyof Scouter | 'custom';
  customCheck?: (scouter: Scouter) => boolean;
}

// Import scouter type
import type { Scouter } from './dexieDB';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Volume Achievements
  {
    id: 'first_prediction',
    name: 'Scout Rookie',
    description: 'Make your first prediction',
    icon: '🎯',
    category: 'volume',
    tier: 'bronze',
    requirements: { type: 'minimum', value: 1, property: 'totalPredictions' },
    stakesReward: 5
  },
  {
    id: 'predictions_10',
    name: 'Getting Started',
    description: 'Make 10 predictions',
    icon: '📊',
    category: 'volume',
    tier: 'bronze',
    requirements: { type: 'minimum', value: 10, property: 'totalPredictions' },
    stakesReward: 10
  },
  {
    id: 'predictions_50',
    name: 'Active Scout',
    description: 'Make 50 predictions',
    icon: '📈',
    category: 'volume',
    tier: 'silver',
    requirements: { type: 'minimum', value: 50, property: 'totalPredictions' },
    stakesReward: 25
  },
  {
    id: 'predictions_100',
    name: 'Dedicated Scout',
    description: 'Make 100 predictions',
    icon: '💪',
    category: 'volume',
    tier: 'gold',
    requirements: { type: 'minimum', value: 100, property: 'totalPredictions' },
    stakesReward: 50
  },
  {
    id: 'predictions_250',
    name: 'Scout Veteran',
    description: 'Make 250 predictions',
    icon: '🏆',
    category: 'volume',
    tier: 'platinum',
    requirements: { type: 'minimum', value: 250, property: 'totalPredictions' },
    stakesReward: 100
  },
  {
    id: 'predictions_400',
    name: 'Scout Legend',
    description: 'Make 400 predictions',
    icon: '👑',
    category: 'volume',
    tier: 'legendary',
    requirements: { type: 'minimum', value: 400, property: 'totalPredictions' },
    stakesReward: 200
  },

  // Accuracy Achievements
  {
    id: 'accuracy_70',
    name: 'Sharp Eye',
    description: 'Achieve 70% accuracy with at least 10 predictions',
    icon: '🎯',
    category: 'accuracy',
    tier: 'bronze',
    requirements: { 
      type: 'custom', 
      value: 70,
      customCheck: (scouter) => scouter.totalPredictions >= 10 && (scouter.correctPredictions / scouter.totalPredictions * 100) >= 70
    },
    stakesReward: 20
  },
  {
    id: 'accuracy_80',
    name: 'Scout Sharpshooter',
    description: 'Achieve 80% accuracy with at least 20 predictions',
    icon: '🏹',
    category: 'accuracy',
    tier: 'silver',
    requirements: { 
      type: 'custom', 
      value: 80,
      customCheck: (scouter) => scouter.totalPredictions >= 20 && (scouter.correctPredictions / scouter.totalPredictions * 100) >= 80
    },
    stakesReward: 40
  },
  {
    id: 'accuracy_90',
    name: 'Oracle',
    description: 'Achieve 90% accuracy with at least 30 predictions',
    icon: '🔮',
    category: 'accuracy',
    tier: 'gold',
    requirements: { 
      type: 'custom', 
      value: 90,
      customCheck: (scouter) => scouter.totalPredictions >= 30 && (scouter.correctPredictions / scouter.totalPredictions * 100) >= 90
    },
    stakesReward: 75
  },
  {
    id: 'accuracy_95',
    name: 'Prophet',
    description: 'Achieve 95% accuracy with at least 50 predictions',
    icon: '✨',
    category: 'accuracy',
    tier: 'platinum',
    requirements: { 
      type: 'custom', 
      value: 95,
      customCheck: (scouter) => scouter.totalPredictions >= 50 && (scouter.correctPredictions / scouter.totalPredictions * 100) >= 95
    },
    stakesReward: 150
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Get 3 predictions correct in a row',
    icon: '🔥',
    category: 'streaks',
    tier: 'bronze',
    requirements: { type: 'minimum', value: 3, property: 'longestStreak' },
    stakesReward: 15
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Get 5 predictions correct in a row',
    icon: '🔥🔥',
    category: 'streaks',
    tier: 'silver',
    requirements: { type: 'minimum', value: 5, property: 'longestStreak' },
    stakesReward: 30
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Get 10 predictions correct in a row',
    icon: '🔥🔥🔥',
    category: 'streaks',
    tier: 'gold',
    requirements: { type: 'minimum', value: 10, property: 'longestStreak' },
    stakesReward: 60
  },
  {
    id: 'streak_20',
    name: 'Legendary Streak',
    description: 'Get 20 predictions correct in a row',
    icon: '⚡',
    category: 'streaks',
    tier: 'platinum',
    requirements: { type: 'minimum', value: 20, property: 'longestStreak' },
    stakesReward: 120
  },
  {
    id: 'streak_50',
    name: 'Godlike',
    description: 'Get 50 predictions correct in a row',
    icon: '👑⚡',
    category: 'streaks',
    tier: 'legendary',
    requirements: { type: 'minimum', value: 50, property: 'longestStreak' },
    stakesReward: 300
  },

  // Stakes from Predictions Achievements
  {
    id: 'stakes_100',
    name: 'Stake Builder',
    description: 'Earn 100 stakes from predictions',
    icon: '💰',
    category: 'volume',
    tier: 'bronze',
    requirements: { type: 'minimum', value: 100, property: 'stakesFromPredictions' },
    stakesReward: 20
  },
  {
    id: 'stakes_300',
    name: 'Stake Master',
    description: 'Earn 300 stakes from predictions',
    icon: '💎',
    category: 'volume',
    tier: 'silver',
    requirements: { type: 'minimum', value: 300, property: 'stakesFromPredictions' },
    stakesReward: 50
  },
  {
    id: 'stakes_600',
    name: 'Stake Tycoon',
    description: 'Earn 600 stakes from predictions',
    icon: '💍',
    category: 'volume',
    tier: 'gold',
    requirements: { type: 'minimum', value: 600, property: 'stakesFromPredictions' },
    stakesReward: 100
  },
  {
    id: 'stakes_1000',
    name: 'Stake Emperor',
    description: 'Earn 1000 stakes from predictions',
    icon: '👑💎',
    category: 'volume',
    tier: 'platinum',
    requirements: { type: 'minimum', value: 1000, property: 'stakesFromPredictions' },
    stakesReward: 200
  },

  // Special Achievements
  {
    id: 'perfect_10',
    name: 'Perfect Vision',
    description: 'Get your first 10 predictions all correct',
    icon: '💯',
    category: 'special',
    tier: 'gold',
    requirements: { 
      type: 'custom', 
      value: 10,
      customCheck: (scouter) => scouter.totalPredictions >= 10 && scouter.correctPredictions >= 10 && scouter.longestStreak >= 10
    },
    stakesReward: 100,
    hidden: true
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Have a streak of 5+ after having accuracy below 50%',
    icon: '🎭',
    category: 'special',
    tier: 'silver',
    requirements: { 
      type: 'custom', 
      value: 5,
      customCheck: (scouter) => scouter.longestStreak >= 5 && scouter.totalPredictions >= 20
    },
    stakesReward: 75,
    hidden: true
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Be among the first 5 scouts to join',
    icon: '🐦',
    category: 'special',
    tier: 'bronze',
    requirements: { type: 'special', value: 5 },
    stakesReward: 25,
    hidden: true
  },

  // Time-based achievements
  {
    id: 'scout_veteran_time',
    name: 'Time Served',
    description: 'Scout for 30 days',
    icon: '⏰',
    category: 'time',
    tier: 'silver',
    requirements: { 
      type: 'custom', 
      value: 30,
      customCheck: (scouter) => {
        const daysDiff = (Date.now() - scouter.createdAt) / (1000 * 60 * 60 * 24);
        return daysDiff >= 30;
      }
    },
    stakesReward: 50
  }
];

// Helper functions for achievement checking
export const checkAchievement = (achievement: Achievement, scouter: Scouter): boolean => {
  const { requirements } = achievement;
  
  switch (requirements.type) {
    case 'minimum':
      if (requirements.property && requirements.property in scouter) {
        return (scouter[requirements.property as keyof Scouter] as number) >= requirements.value;
      }
      return false;
      
    case 'exact':
      if (requirements.property && requirements.property in scouter) {
        return (scouter[requirements.property as keyof Scouter] as number) === requirements.value;
      }
      return false;
      
    case 'percentage':
      if (requirements.property && requirements.property in scouter) {
        const value = scouter[requirements.property as keyof Scouter] as number;
        const total = scouter.totalPredictions;
        return total > 0 && (value / total * 100) >= requirements.value;
      }
      return false;
      
    case 'custom':
      return requirements.customCheck ? requirements.customCheck(scouter) : false;
      
    case 'special':
      // Special achievements need custom logic in the achievement system
      return false;
      
    default:
      return false;
  }
};

export const getAchievementProgress = (achievement: Achievement, scouter: Scouter): number => {
  const { requirements } = achievement;
  
  switch (requirements.type) {
    case 'minimum':
    case 'exact':
      if (requirements.property && requirements.property in scouter) {
        const current = scouter[requirements.property as keyof Scouter] as number;
        return Math.min(100, (current / requirements.value) * 100);
      }
      return 0;
      
    case 'percentage':
      if (requirements.property && requirements.property in scouter) {
        const value = scouter[requirements.property as keyof Scouter] as number;
        const total = scouter.totalPredictions;
        if (total === 0) return 0;
        const currentPercentage = (value / total) * 100;
        return Math.min(100, (currentPercentage / requirements.value) * 100);
      }
      return 0;
      
    case 'custom':
      // Custom achievements can define their own progress calculation
      if (checkAchievement(achievement, scouter)) return 100;
      // For custom achievements, we'll need specific progress logic
      return 0;
      
    default:
      return 0;
  }
};

// Achievement tier styling
export const ACHIEVEMENT_TIERS = {
  bronze: {
    color: '#CD7F32',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    borderColor: 'border-amber-300 dark:border-amber-700',
    textColor: 'text-amber-800 dark:text-amber-200'
  },
  silver: {
    color: '#C0C0C0',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    textColor: 'text-gray-800 dark:text-gray-200'
  },
  gold: {
    color: '#FFD700',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    textColor: 'text-yellow-800 dark:text-yellow-200'
  },
  platinum: {
    color: '#E5E4E2',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    borderColor: 'border-blue-300 dark:border-blue-700',
    textColor: 'text-blue-800 dark:text-blue-200'
  },
  legendary: {
    color: '#9932CC',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    borderColor: 'border-purple-300 dark:border-purple-700',
    textColor: 'text-purple-800 dark:text-purple-200'
  }
} as const;

// Get achievements grouped by category
export const getAchievementsByCategory = (): { [key: string]: Achievement[] } => {
  const categories: { [key: string]: Achievement[] } = {};
  
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (!categories[achievement.category]) {
      categories[achievement.category] = [];
    }
    categories[achievement.category].push(achievement);
  }

  return categories;
};
