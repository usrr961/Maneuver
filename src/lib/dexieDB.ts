import Dexie, { type Table } from 'dexie';
import type { ScoutingDataWithId } from './scoutingDataUtils';
import type { PitScoutingEntry } from './pitScoutingTypes';

// Scouter gamification types
export interface Scouter {
  name: string; // Primary key - matches the name from nav-user sidebar
  stakes: number;
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number; // Current consecutive correct predictions
  longestStreak: number; // Best streak ever achieved
  createdAt: number;
  lastUpdated: number;
}

export interface MatchPrediction {
  id: string;
  scouterName: string;
  eventName: string;
  matchNumber: string;
  predictedWinner: 'red' | 'blue';
  actualWinner?: 'red' | 'blue' | 'tie';
  isCorrect?: boolean;
  pointsAwarded?: number;
  timestamp: number;
  verified: boolean;
}

export interface ScoutingEntryDB {
  id: string;
  teamNumber?: string;
  matchNumber?: string;
  alliance?: string;
  scouterInitials?: string;
  eventName?: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export class SimpleScoutingAppDB extends Dexie {
  scoutingData!: Table<ScoutingEntryDB>;

  constructor() {
    super('SimpleScoutingDB');
    
    this.version(1).stores({
      scoutingData: 'id, teamNumber, matchNumber, alliance, scouterInitials, eventName, timestamp'
    });
  }
}

export class PitScoutingDB extends Dexie {
  pitScoutingData!: Table<PitScoutingEntry>;

  constructor() {
    super('PitScoutingDB');
    
    this.version(1).stores({
      pitScoutingData: 'id, teamNumber, eventName, scouterInitials, timestamp, [teamNumber+eventName]'
    });
  }
}

// Scouter gamification database
export class ScouterGameDB extends Dexie {
  scouters!: Table<Scouter>;
  predictions!: Table<MatchPrediction>;

  constructor() {
    super('ScouterGameDB');
    
    this.version(1).stores({
      scouters: 'name, stakes, totalPredictions, correctPredictions, lastUpdated',
      predictions: 'id, scouterName, eventName, matchNumber, predictedWinner, timestamp, verified, [scouterName+eventName+matchNumber]'
    });

    // Version 2: Add streak tracking
    this.version(2).stores({
      scouters: 'name, stakes, totalPredictions, correctPredictions, currentStreak, longestStreak, lastUpdated',
      predictions: 'id, scouterName, eventName, matchNumber, predictedWinner, timestamp, verified, [scouterName+eventName+matchNumber]'
    }).upgrade(tx => {
      // Add default values for new streak fields
      return tx.table('scouters').toCollection().modify(scouter => {
        scouter.currentStreak = 0;
        scouter.longestStreak = 0;
      });
    });

    // Version 3: Rename points to stakes
    this.version(3).stores({
      scouters: 'name, stakes, totalPredictions, correctPredictions, currentStreak, longestStreak, lastUpdated',
      predictions: 'id, scouterName, eventName, matchNumber, predictedWinner, timestamp, verified, [scouterName+eventName+matchNumber]'
    }).upgrade(tx => {
      // Migrate points to stakes
      return tx.table('scouters').toCollection().modify(scouter => {
        if (scouter.points !== undefined) {
          scouter.stakes = scouter.points;
          delete scouter.points;
        }
        if (scouter.stakes === undefined) {
          scouter.stakes = 0;
        }
      });
    });
  }
}

export const db = new SimpleScoutingAppDB();
export const pitDB = new PitScoutingDB();
export const gameDB = new ScouterGameDB();

const safeStringify = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const str = String(value).trim();
  return str === '' ? undefined : str;
};

const enhanceEntry = (entry: ScoutingDataWithId): ScoutingEntryDB => {
  const data = entry.data;
  let actualData = data;
  
  if (data && typeof data === 'object') {
    if ('data' in data && typeof data.data === 'object') {
      actualData = data.data as Record<string, unknown>;
    }
  }
  
  const matchNumber = safeStringify(actualData?.matchNumber);
  const alliance = safeStringify(actualData?.alliance);
  const scouterInitials = safeStringify(actualData?.scouterInitials);
  const teamNumber = safeStringify(actualData?.selectTeam);
  const eventName = safeStringify(actualData?.eventName);

  return {
    id: entry.id,
    teamNumber,
    matchNumber,
    alliance,
    scouterInitials,
    eventName,
    data: actualData || data,
    timestamp: entry.timestamp || Date.now()
  };
};

export const saveScoutingEntry = async (entry: ScoutingDataWithId): Promise<void> => {
  const enhancedEntry = enhanceEntry(entry);
  await db.scoutingData.put(enhancedEntry);
};

export const saveScoutingEntries = async (entries: ScoutingDataWithId[]): Promise<void> => {
  console.log(`Saving ${entries.length} entries to Dexie DB`);
  
  const enhancedEntries = entries.map(enhanceEntry);
  await db.scoutingData.bulkPut(enhancedEntries);
};

export const loadAllScoutingEntries = async (): Promise<ScoutingEntryDB[]> => {
  return await db.scoutingData.toArray();
};

export const loadScoutingEntriesByTeam = async (teamNumber: string): Promise<ScoutingEntryDB[]> => {
  return await db.scoutingData.where('teamNumber').equals(teamNumber).toArray();
};

export const loadScoutingEntriesByMatch = async (matchNumber: string): Promise<ScoutingEntryDB[]> => {
  return await db.scoutingData.where('matchNumber').equals(matchNumber).toArray();
};

export const loadScoutingEntriesByEvent = async (eventName: string): Promise<ScoutingEntryDB[]> => {
  return await db.scoutingData.where('eventName').equals(eventName).toArray();
};

export const loadScoutingEntriesByTeamAndEvent = async (
  teamNumber: string, 
  eventName: string
): Promise<ScoutingEntryDB[]> => {
  return await db.scoutingData
    .where('[teamNumber+eventName]')
    .equals([teamNumber, eventName])
    .toArray();
};

export const deleteScoutingEntry = async (id: string): Promise<void> => {
  await db.scoutingData.delete(id);
};

export const deleteScoutingEntries = async (ids: string[]): Promise<void> => {
  await db.scoutingData.bulkDelete(ids);
};

export const clearAllScoutingData = async (): Promise<void> => {
  await db.scoutingData.clear();
};

export const getDBStats = async (): Promise<{
  totalEntries: number;
  teams: string[];
  matches: string[];
  scouters: string[];
  events: string[];
  oldestEntry?: number;
  newestEntry?: number;
}> => {
  const entries = await db.scoutingData.toArray();
  
  const teams = new Set<string>();
  const matches = new Set<string>();
  const scouters = new Set<string>();
  const events = new Set<string>();
  let oldestEntry: number | undefined;
  let newestEntry: number | undefined;
  
  entries.forEach(entry => {
    if (entry.teamNumber) teams.add(entry.teamNumber);
    if (entry.matchNumber) matches.add(entry.matchNumber);
    if (entry.scouterInitials) scouters.add(entry.scouterInitials);
    if (entry.eventName) events.add(entry.eventName);
    
    if (!oldestEntry || entry.timestamp < oldestEntry) {
      oldestEntry = entry.timestamp;
    }
    if (!newestEntry || entry.timestamp > newestEntry) {
      newestEntry = entry.timestamp;
    }
  });
  
  return {
    totalEntries: entries.length,
    teams: Array.from(teams).sort((a, b) => Number(a) - Number(b)),
    matches: Array.from(matches).sort((a, b) => Number(a) - Number(b)),
    scouters: Array.from(scouters).sort(),
    events: Array.from(events).sort(),
    oldestEntry,
    newestEntry
  };
};

export const migrateFromLocalStorage = async (): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> => {
  try {
    const existingDataStr = localStorage.getItem('scoutingData');
    if (!existingDataStr) {
      return { success: true, migratedCount: 0 };
    }
    
    const { migrateToIdStructure, hasIdStructure } = await import('./scoutingDataUtils');
    
    const parsed = JSON.parse(existingDataStr);
    let dataToMigrate: { entries: ScoutingDataWithId[] };
    
    if (hasIdStructure(parsed)) {
      dataToMigrate = parsed;
    } else {
      dataToMigrate = migrateToIdStructure(parsed);
    }
    
    await saveScoutingEntries(dataToMigrate.entries);
    
    localStorage.setItem('scoutingData_backup', existingDataStr);
    localStorage.removeItem('scoutingData');
    
    return {
      success: true,
      migratedCount: dataToMigrate.entries.length
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      migratedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const migrateFromIndexedDB = async (): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> => {
  try {
    const { loadAllScoutingEntries: loadOldEntries } = await import('./indexedDBUtils');
    
    const oldEntries = await loadOldEntries();
    if (oldEntries.length === 0) {
      return { success: true, migratedCount: 0 };
    }
    
    const convertedEntries: ScoutingDataWithId[] = oldEntries.map(entry => ({
      id: entry.id,
      data: entry.data,
      timestamp: entry.timestamp
    }));
    
    await saveScoutingEntries(convertedEntries);
    
    return {
      success: true,
      migratedCount: convertedEntries.length
    };
  } catch (error) {
    console.error('IndexedDB migration failed:', error);
    return {
      success: false,
      migratedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const exportScoutingData = async (): Promise<{
  entries: ScoutingEntryDB[];
  exportedAt: number;
  version: string;
}> => {
  const entries = await loadAllScoutingEntries();
  
  return {
    entries,
    exportedAt: Date.now(),
    version: '2.0-dexie'
  };
};

export const importScoutingData = async (
  importData: { entries: ScoutingEntryDB[] },
  mode: 'append' | 'overwrite' = 'append'
): Promise<{
  success: boolean;
  importedCount: number;
  duplicatesSkipped?: number;
  error?: string;
}> => {
  try {
    if (mode === 'overwrite') {
      await clearAllScoutingData();
      await db.scoutingData.bulkPut(importData.entries);
      
      return {
        success: true,
        importedCount: importData.entries.length
      };
    } else {
      const existingIds = await db.scoutingData.orderBy('id').keys();
      const existingIdSet = new Set(existingIds);
      
      const newEntries = importData.entries.filter(entry => !existingIdSet.has(entry.id));
      await db.scoutingData.bulkPut(newEntries);
      
      return {
        success: true,
        importedCount: newEntries.length,
        duplicatesSkipped: importData.entries.length - newEntries.length
      };
    }
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      importedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const queryScoutingEntries = async (filters: {
  teamNumbers?: string[];
  matchNumbers?: string[];
  eventNames?: string[];
  alliances?: string[];
  scouterInitials?: string[];
  dateRange?: { start: number; end: number };
}): Promise<ScoutingEntryDB[]> => {
  let collection = db.scoutingData.toCollection();
  
  if (filters.dateRange) {
    collection = collection.filter(entry => 
      entry.timestamp >= filters.dateRange!.start && 
      entry.timestamp <= filters.dateRange!.end
    );
  }
  
  if (filters.teamNumbers && filters.teamNumbers.length > 0) {
    collection = collection.filter(entry => 
      Boolean(entry.teamNumber && filters.teamNumbers!.includes(entry.teamNumber))
    );
  }
  
  if (filters.matchNumbers && filters.matchNumbers.length > 0) {
    collection = collection.filter(entry => 
      Boolean(entry.matchNumber && filters.matchNumbers!.includes(entry.matchNumber))
    );
  }
  
  if (filters.eventNames && filters.eventNames.length > 0) {
    collection = collection.filter(entry => 
      Boolean(entry.eventName && filters.eventNames!.includes(entry.eventName))
    );
  }
  
  if (filters.alliances && filters.alliances.length > 0) {
    collection = collection.filter(entry => 
      Boolean(entry.alliance && filters.alliances!.includes(entry.alliance))
    );
  }
  
  if (filters.scouterInitials && filters.scouterInitials.length > 0) {
    collection = collection.filter(entry => 
      Boolean(entry.scouterInitials && filters.scouterInitials!.includes(entry.scouterInitials))
    );
  }
  
  return await collection.toArray();
};

export const getFilterOptions = async (): Promise<{
  teams: string[];
  matches: string[];
  events: string[];
  alliances: string[];
  scouters: string[];
}> => {
  const stats = await getDBStats();
  
  const entries = await db.scoutingData.toArray();
  const alliances = [...new Set(entries.map(e => e.alliance).filter(Boolean))].sort() as string[];
  
  return {
    teams: stats.teams,
    matches: stats.matches,
    events: stats.events,
    alliances,
    scouters: stats.scouters
  };
};

db.open().catch(error => {
  console.error('Failed to open Dexie database:', error);
});

pitDB.open().catch(error => {
  console.error('Failed to open Pit Scouting database:', error);
});

// Pit Scouting Database Functions
export const savePitScoutingEntry = async (entry: PitScoutingEntry): Promise<void> => {
  try {
    await pitDB.pitScoutingData.put(entry);
  } catch (error) {
    console.error('Error saving pit scouting entry to database:', error);
    throw error;
  }
};

export const loadAllPitScoutingEntries = async (): Promise<PitScoutingEntry[]> => {
  try {
    return await pitDB.pitScoutingData.toArray();
  } catch (error) {
    console.error('Error loading all pit scouting entries:', error);
    return [];
  }
};

export const loadPitScoutingByTeam = async (teamNumber: string): Promise<PitScoutingEntry[]> => {
  try {
    return await pitDB.pitScoutingData.where('teamNumber').equals(teamNumber).toArray();
  } catch (error) {
    console.error('Error loading pit scouting entries by team:', error);
    return [];
  }
};

export const loadPitScoutingByEvent = async (eventName: string): Promise<PitScoutingEntry[]> => {
  try {
    return await pitDB.pitScoutingData.where('eventName').equals(eventName).toArray();
  } catch (error) {
    console.error('Error loading pit scouting entries by event:', error);
    return [];
  }
};

export const loadPitScoutingByTeamAndEvent = async (
  teamNumber: string, 
  eventName: string
): Promise<PitScoutingEntry | undefined> => {
  try {
    const results = await pitDB.pitScoutingData
      .where('[teamNumber+eventName]')
      .equals([teamNumber, eventName])
      .toArray();
    
    // Return the most recent entry if multiple exist
    return results.sort((a, b) => b.timestamp - a.timestamp)[0];
  } catch (error) {
    console.error('Error loading pit scouting entry by team and event:', error);
    // Fallback to manual filtering if compound index fails
    try {
      const allEntries = await pitDB.pitScoutingData.toArray();
      const filtered = allEntries.filter(entry => 
        entry.teamNumber === teamNumber && entry.eventName === eventName
      );
      return filtered.sort((a, b) => b.timestamp - a.timestamp)[0];
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return undefined;
    }
  }
};

export const deletePitScoutingEntry = async (id: string): Promise<void> => {
  await pitDB.pitScoutingData.delete(id);
};

export const clearAllPitScoutingData = async (): Promise<void> => {
  await pitDB.pitScoutingData.clear();
};

export const getPitScoutingStats = async (): Promise<{
  totalEntries: number;
  teams: string[];
  events: string[];
  scouters: string[];
}> => {
  const entries = await pitDB.pitScoutingData.toArray();
  
  const teams = [...new Set(entries.map(e => e.teamNumber))].sort((a, b) => Number(a) - Number(b));
  const events = [...new Set(entries.map(e => e.eventName))].sort();
  const scouters = [...new Set(entries.map(e => e.scouterInitials))].sort();
  
  return {
    totalEntries: entries.length,
    teams,
    events,
    scouters
  };
};

// Scouter gamification functions
export const getOrCreateScouter = async (name: string): Promise<Scouter> => {
  const existingScouter = await gameDB.scouters.get(name);
  
  if (existingScouter) {
    // Update last updated time
    existingScouter.lastUpdated = Date.now();
    await gameDB.scouters.put(existingScouter);
    return existingScouter;
  }
  
  // Create new scouter
  const newScouter: Scouter = {
    name: name.trim(),
    stakes: 0,
    totalPredictions: 0,
    correctPredictions: 0,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: Date.now(),
    lastUpdated: Date.now()
  };
  
  await gameDB.scouters.put(newScouter);
  return newScouter;
};

export const getScouter = async (name: string): Promise<Scouter | undefined> => {
  return await gameDB.scouters.get(name);
};

export const getAllScouters = async (): Promise<Scouter[]> => {
  return await gameDB.scouters.orderBy('points').reverse().toArray();
};

export const updateScouterPoints = async (name: string, pointsToAdd: number): Promise<void> => {
  const scouter = await gameDB.scouters.get(name);
  if (scouter) {
    scouter.stakes += pointsToAdd;
    scouter.lastUpdated = Date.now();
    await gameDB.scouters.put(scouter);
  }
};

export const updateScouterStats = async (
  name: string, 
  newStakes: number, 
  correctPredictions: number, 
  totalPredictions: number,
  currentStreak?: number,
  longestStreak?: number
): Promise<void> => {
  const scouter = await gameDB.scouters.get(name);
  if (scouter) {
    scouter.stakes = newStakes;
    scouter.correctPredictions = correctPredictions;
    scouter.totalPredictions = totalPredictions;
    if (currentStreak !== undefined) scouter.currentStreak = currentStreak;
    if (longestStreak !== undefined) scouter.longestStreak = longestStreak;
    scouter.lastUpdated = Date.now();
    await gameDB.scouters.put(scouter);
  }
};

// New function to update scouter with prediction result and handle streaks
export const updateScouterWithPredictionResult = async (
  name: string,
  isCorrect: boolean,
  basePoints: number,
  eventName: string,
  matchNumber: string
): Promise<number> => {
  const scouter = await gameDB.scouters.get(name);
  if (!scouter) return 0;

  let pointsAwarded = 0;
  let newCurrentStreak = scouter.currentStreak;
  let newLongestStreak = scouter.longestStreak;

  // Check if this match is sequential to the last verified prediction
  const isSequential = await isMatchSequential(name, eventName, matchNumber);

  if (isCorrect) {
    // Award base points for correct prediction
    pointsAwarded += basePoints;
    
    // Only increment streak if the match is sequential OR this is the first prediction
    if (isSequential || scouter.totalPredictions === 0) {
      newCurrentStreak += 1;
    } else {
      // Reset streak if there's a gap in matches
      newCurrentStreak = 1; // Start new streak at 1
    }
    
    // Update longest streak if current streak is better
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }
    
    // Award streak bonus if streak is 2 or more
    if (newCurrentStreak >= 2) {
      const streakBonus = 2 * (newCurrentStreak - 1); // 2 extra points for streak 2, 4 for streak 3, etc.
      pointsAwarded += streakBonus;
    }
  } else {
    // Reset streak on incorrect prediction
    newCurrentStreak = 0;
  }

  // Update scouter stats
  await updateScouterStats(
    name,
    scouter.stakes + pointsAwarded,
    scouter.correctPredictions + (isCorrect ? 1 : 0),
    scouter.totalPredictions + 1,
    newCurrentStreak,
    newLongestStreak
  );

  return pointsAwarded;
};

// Helper function to check if current match is sequential to last verified prediction
const isMatchSequential = async (
  scouterName: string,
  eventName: string,
  currentMatchNumber: string
): Promise<boolean> => {
  // Get the most recent verified prediction for this scouter in this event
  const lastPrediction = await gameDB.predictions
    .where('scouterName')
    .equals(scouterName)
    .and(prediction => prediction.eventName === eventName && prediction.verified)
    .reverse()
    .sortBy('timestamp');

  if (!lastPrediction || lastPrediction.length === 0) {
    return true; // No previous predictions, so this is sequential (first prediction)
  }

  const lastMatchNumber = parseInt(lastPrediction[0].matchNumber);
  const currentMatch = parseInt(currentMatchNumber);
  
  // Check if current match is exactly one more than the last match
  // Allow for some flexibility (e.g., within 3 matches) to account for missed matches
  const gap = currentMatch - lastMatchNumber;
  
  return gap <= 3 && gap > 0; // Sequential if gap is 1, 2, or 3 matches
};

export const createMatchPrediction = async (
  scouterName: string,
  eventName: string,
  matchNumber: string,
  predictedWinner: 'red' | 'blue'
): Promise<MatchPrediction> => {
  // Check if prediction already exists for this match
  const existingPrediction = await gameDB.predictions
    .where('[scouterName+eventName+matchNumber]')
    .equals([scouterName, eventName, matchNumber])
    .first();

  if (existingPrediction) {
    // Update existing prediction
    existingPrediction.predictedWinner = predictedWinner;
    existingPrediction.timestamp = Date.now();
    await gameDB.predictions.put(existingPrediction);
    return existingPrediction;
  }

  // Create new prediction
  const prediction: MatchPrediction = {
    id: `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scouterName,
    eventName,
    matchNumber,
    predictedWinner,
    timestamp: Date.now(),
    verified: false
  };

  await gameDB.predictions.put(prediction);

  // Update scouter's total predictions count
  const scouter = await gameDB.scouters.get(scouterName);
  if (scouter) {
    scouter.totalPredictions += 1;
    scouter.lastUpdated = Date.now();
    await gameDB.scouters.put(scouter);
  }

  return prediction;
};

export const getPredictionForMatch = async (
  scouterName: string,
  eventName: string,
  matchNumber: string
): Promise<MatchPrediction | undefined> => {
  return await gameDB.predictions
    .where('[scouterName+eventName+matchNumber]')
    .equals([scouterName, eventName, matchNumber])
    .first();
};

export const getAllPredictionsForScouter = async (scouterName: string): Promise<MatchPrediction[]> => {
  return await gameDB.predictions
    .where('scouterName')
    .equals(scouterName)
    .reverse()
    .toArray();
};

export const getAllPredictionsForMatch = async (
  eventName: string,
  matchNumber: string
): Promise<MatchPrediction[]> => {
  return await gameDB.predictions
    .where('eventName')
    .equals(eventName)
    .and(prediction => prediction.matchNumber === matchNumber)
    .toArray();
};

export const markPredictionAsVerified = async (predictionId: string): Promise<void> => {
  await gameDB.predictions.update(predictionId, { verified: true });
};

export const deleteScouter = async (name: string): Promise<void> => {
  await gameDB.scouters.delete(name);
};

export const clearGameData = async (): Promise<void> => {
  await gameDB.scouters.clear();
  await gameDB.predictions.clear();
};
