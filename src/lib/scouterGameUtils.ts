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
