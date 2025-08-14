import { gameDB } from './dexieDB';
import type { ScouterAchievement } from './dexieDB';
import { 
  ACHIEVEMENT_DEFINITIONS, 
  checkAchievement, 
  getAchievementProgress,
  type Achievement 
} from './achievementTypes';
import { updateScouterPoints } from './dexieDB';

export const checkForNewAchievements = async (scouterName: string): Promise<Achievement[]> => {
  const scouter = await gameDB.scouters.get(scouterName);
  if (!scouter) return [];

  const unlockedAchievements = await gameDB.scouterAchievements
    .where('scouterName')
    .equals(scouterName)
    .toArray();
  
  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(achievement.id)) continue;
    
    if (checkAchievement(achievement, scouter)) {
      
      if (achievement.requirements.type === 'special') {
        if (achievement.id === 'early_bird') {
          const totalScouters = await gameDB.scouters.count();
          if (totalScouters > 5) continue;
        }
      }
      
      const scouterAchievement: ScouterAchievement = {
        scouterName,
        achievementId: achievement.id,
        unlockedAt: Date.now(),
        progress: 100
      };
      
      await gameDB.scouterAchievements.add(scouterAchievement);
      
      if (achievement.stakesReward > 0) {
        await updateScouterPoints(scouterName, achievement.stakesReward);
      }
      
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    console.log('🏆 Total new achievements unlocked for', scouterName, ':', newlyUnlocked.map(a => a.name));
  }

  return newlyUnlocked;
};

export const backfillAchievementsForAllScouters = async (): Promise<void> => {
  
  const allScouters = await gameDB.scouters.toArray();
  
  for (const scouter of allScouters) {
    const newAchievements = await checkForNewAchievements(scouter.name);
    
    if (newAchievements.length > 0) {
      console.log('🏆 Backfilled', newAchievements.length, 'achievements for', scouter.name);
    }
  }
  
};

export const getScouterAchievements = async (scouterName: string): Promise<{
  unlocked: Array<Achievement & { unlockedAt: number }>;
  available: Array<Achievement & { progress: number }>;
  hidden: Array<Achievement & { progress: number }>;
}> => {
  const scouter = await gameDB.scouters.get(scouterName);
  if (!scouter) {
    return { unlocked: [], available: [], hidden: [] };
  }

  const unlockedAchievements = await gameDB.scouterAchievements
    .where('scouterName')
    .equals(scouterName)
    .toArray();
  
  const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
  const unlockedMap = new Map(unlockedAchievements.map(a => [a.achievementId, a]));

  const unlocked: Array<Achievement & { unlockedAt: number }> = [];
  const available: Array<Achievement & { progress: number }> = [];
  const hidden: Array<Achievement & { progress: number }> = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(achievement.id)) {
      const scouterAchievement = unlockedMap.get(achievement.id)!;
      unlocked.push({
        ...achievement,
        unlockedAt: scouterAchievement.unlockedAt
      });
    } else {
      const progress = getAchievementProgress(achievement, scouter);
      const achievementWithProgress = { ...achievement, progress };
      
      if (achievement.hidden && progress < 100) {
        hidden.push(achievementWithProgress);
      } else {
        available.push(achievementWithProgress);
      }
    }
  }

  unlocked.sort((a, b) => b.unlockedAt - a.unlockedAt);

  available.sort((a, b) => b.progress - a.progress);  return { unlocked, available, hidden };
};

export const getAchievementStats = async (scouterName: string): Promise<{
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  totalStakesFromAchievements: number;
  recentAchievements: Array<Achievement & { unlockedAt: number }>;
}> => {
  const { unlocked } = await getScouterAchievements(scouterName);
  const visibleAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => !a.hidden);
  
  const totalStakesFromAchievements = unlocked.reduce((sum, achievement) => {
    return sum + achievement.stakesReward;
  }, 0);

  const recentAchievements = unlocked
    .slice(0, 3) // Last 3 achievements
    .sort((a, b) => b.unlockedAt - a.unlockedAt);

  return {
    totalAchievements: visibleAchievements.length,
    unlockedCount: unlocked.filter(a => !ACHIEVEMENT_DEFINITIONS.find(def => def.id === a.id)?.hidden).length,
    completionPercentage: Math.round((unlocked.length / ACHIEVEMENT_DEFINITIONS.length) * 100),
    totalStakesFromAchievements,
    recentAchievements
  };
};

export const getAchievementLeaderboard = async (): Promise<Array<{
  scouterName: string;
  achievementCount: number;
  totalStakesFromAchievements: number;
  recentUnlock?: Achievement & { unlockedAt: number };
}>> => {
  const allScouters = await gameDB.scouters.toArray();
  const leaderboard = [];

  for (const scouter of allScouters) {
    const stats = await getAchievementStats(scouter.name);
    const { unlocked } = await getScouterAchievements(scouter.name);
    
    leaderboard.push({
      scouterName: scouter.name,
      achievementCount: stats.unlockedCount,
      totalStakesFromAchievements: stats.totalStakesFromAchievements,
      recentUnlock: unlocked[0] // Most recent achievement
    });
  }

  leaderboard.sort((a, b) => {
    if (a.achievementCount !== b.achievementCount) {
      return b.achievementCount - a.achievementCount;
    }
    return b.totalStakesFromAchievements - a.totalStakesFromAchievements;
  });

  return leaderboard;
};

export const checkAllScouterAchievements = async (): Promise<{
  [scouterName: string]: Achievement[];
}> => {
  const allScouters = await gameDB.scouters.toArray();
  const results: { [scouterName: string]: Achievement[] } = {};

  for (const scouter of allScouters) {
    const newAchievements = await checkForNewAchievements(scouter.name);
    if (newAchievements.length > 0) {
      results[scouter.name] = newAchievements;
    }
  }

  return results;
};

export const getNextAchievements = async (scouterName: string, limit = 3): Promise<Array<Achievement & { progress: number }>> => {
  const { available } = await getScouterAchievements(scouterName);
  
  const nextAchievements = available
    .filter(a => a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);

  if (nextAchievements.length < limit) {
    const zeroProgressAchievements = available
      .filter(a => a.progress === 0)
      .slice(0, limit - nextAchievements.length);
    
    nextAchievements.push(...zeroProgressAchievements);
  }

  return nextAchievements;
};
