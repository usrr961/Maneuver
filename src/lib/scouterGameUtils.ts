import type { Scouter } from './dexieDB';
import { 
  getOrCreateScouter,
  getScouter, 
  getAllScouters,
  updateScouterPoints,
  updateScouterStats,
  updateScouterWithPredictionResult,
  createMatchPrediction,
  getPredictionForMatch,
  getAllPredictionsForScouter,
  getAllPredictionsForMatch,
  markPredictionAsVerified,
  deleteScouter,
  clearGameData
} from './dexieDB';
import { checkForNewAchievements } from './achievementUtils';
import type { Achievement } from './achievementTypes';

// Stake values for different activities
export const STAKE_VALUES = {
  CORRECT_PREDICTION: 10,
  INCORRECT_PREDICTION: 0,
  PARTICIPATION_BONUS: 1,
  STREAK_BONUS_BASE: 2, // Base streak bonus (2 stakes for 2+ in a row)
} as const;

// Calculate streak bonus stakes based on streak length
export const calculateStreakBonus = (streakLength: number): number => {
  if (streakLength < 2) return 0;
  return STAKE_VALUES.STREAK_BONUS_BASE * (streakLength - 1);
};

// Get or create a scouter by name (linked to sidebar selection)
export const getOrCreateScouterByName = async (name: string): Promise<Scouter> => {
  return await getOrCreateScouter(name);
};

// Calculate scouter accuracy percentage
export const calculateAccuracy = (scouter: Scouter): number => {
  if (scouter.totalPredictions === 0) return 0;
  return Math.round((scouter.correctPredictions / scouter.totalPredictions) * 100);
};

// Get leaderboard
export const getLeaderboard = async (): Promise<Scouter[]> => {
  return await getAllScouters();
};

// Wrapper function to update scouter stats with achievement checking
export const updateScouterStatsWithAchievements = async (
  name: string, 
  newStakes: number, 
  correctPredictions: number, 
  totalPredictions: number,
  currentStreak?: number,
  longestStreak?: number
): Promise<{ newAchievements: Achievement[] }> => {
  // Update the stats first
  await updateScouterStats(name, newStakes, correctPredictions, totalPredictions, currentStreak, longestStreak);
  
  // Check for new achievements
  const newAchievements = await checkForNewAchievements(name);
  
  return { newAchievements };
};

// Wrapper function to update scouter with prediction result and achievement checking
export const updateScouterWithPredictionAndAchievements = async (
  name: string,
  isCorrect: boolean,
  basePoints: number,
  eventName: string,
  matchNumber: string
): Promise<{ newAchievements: Achievement[] }> => {
  // Update with prediction result first
  await updateScouterWithPredictionResult(name, isCorrect, basePoints, eventName, matchNumber);
  
  // Check for new achievements
  const newAchievements = await checkForNewAchievements(name);
  
  return { newAchievements };
};

export {
  getScouter,
  getAllScouters,
  updateScouterPoints,
  updateScouterStats,
  updateScouterWithPredictionResult,
  createMatchPrediction,
  getPredictionForMatch,
  getAllPredictionsForScouter,
  getAllPredictionsForMatch,
  markPredictionAsVerified,
  deleteScouter,
  clearGameData
};
