/**
 * IndexedDB utilities for scouting data storage
 * Replaces localStorage with more robust, scalable storage
 */

import type { ScoutingDataWithId } from './scoutingDataUtils';

const DB_NAME = 'ScoutingAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'scoutingData';

// IndexedDB database instance
let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
export const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for common queries
        store.createIndex('teamNumber', 'teamNumber', { unique: false });
        store.createIndex('matchNumber', 'matchNumber', { unique: false });
        store.createIndex('alliance', 'alliance', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('scouterInitials', 'scouterInitials', { unique: false });
      }
    };
  });
};

// Enhanced scouting entry for IndexedDB with metadata
export interface ScoutingEntryDB {
  id: string;
  // Extracted fields for easier querying
  teamNumber?: string;
  matchNumber?: string;
  alliance?: string;
  scouterInitials?: string;
  // Keep original data structure (now objects instead of arrays)
  data: Record<string, unknown>;
  timestamp: number;
}

// Convert ScoutingDataWithId to ScoutingEntryDB
const enhanceEntry = (entry: ScoutingDataWithId): ScoutingEntryDB => {
  // Helper function to safely convert to string, handling undefined/null/empty values
  const safeStringify = (value: unknown): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const str = String(value).trim();
    return str === '' ? undefined : str;
  };

  // Extract metadata from data object properties
  const data = entry.data;
  
  // Handle different data structures that might come from transfers
  let actualData = data;
  
  // If data has nested structure, try to find the actual scouting data
  if (data && typeof data === 'object') {
    // Check if data is wrapped in another data property
    if ('data' in data && typeof data.data === 'object') {
      actualData = data.data as Record<string, unknown>;
    }
  }
  
  console.log('Enhancing entry - data structure:', {
    entryId: entry.id,
    actualDataKeys: actualData ? Object.keys(actualData).slice(0, 5) : [],
    extractedMetadata: {
      matchNumber: safeStringify(actualData?.matchNumber),
      selectTeam: safeStringify(actualData?.selectTeam),
      alliance: safeStringify(actualData?.alliance),
      scouterInitials: safeStringify(actualData?.scouterInitials),
    }
  });
  
  const matchNumber = safeStringify(actualData?.matchNumber);
  const alliance = safeStringify(actualData?.alliance);
  const scouterInitials = safeStringify(actualData?.scouterInitials);
  const teamNumber = safeStringify(actualData?.selectTeam); // Team number is stored in selectTeam field

  return {
    id: entry.id,
    teamNumber,
    matchNumber,
    alliance,
    scouterInitials,
    data: actualData || data, // Use the actual data, fallback to original
    timestamp: entry.timestamp || Date.now()
  };
};

// Save single scouting entry
export const saveScoutingEntry = async (entry: ScoutingDataWithId): Promise<void> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const enhancedEntry = enhanceEntry(entry);
  
  return new Promise((resolve, reject) => {
    const request = store.put(enhancedEntry);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Save multiple scouting entries
export const saveScoutingEntries = async (entries: ScoutingDataWithId[]): Promise<void> => {
  console.log(`Saving ${entries.length} entries to IndexedDB`);
  
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    let completed = 0;
    const total = entries.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    entries.forEach((entry) => {
      const enhancedEntry = enhanceEntry(entry);
      
      const request = store.put(enhancedEntry);
      
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  });
};

// Load all scouting entries
export const loadAllScoutingEntries = async (): Promise<ScoutingEntryDB[]> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Load scouting entries by team
export const loadScoutingEntriesByTeam = async (teamNumber: string): Promise<ScoutingEntryDB[]> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('teamNumber');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(teamNumber);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Load scouting entries by match
export const loadScoutingEntriesByMatch = async (matchNumber: string): Promise<ScoutingEntryDB[]> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('matchNumber');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(matchNumber);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Delete scouting entry by ID
export const deleteScoutingEntry = async (id: string): Promise<void> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Clear all scouting data
export const clearAllScoutingData = async (): Promise<void> => {
  const db = await initializeDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get database statistics
export const getDBStats = async (): Promise<{
  totalEntries: number;
  teams: string[];
  matches: string[];
  scouters: string[];
  oldestEntry?: number;
  newestEntry?: number;
}> => {
  const entries = await loadAllScoutingEntries();
  
  const teams = new Set<string>();
  const matches = new Set<string>();
  const scouters = new Set<string>();
  let oldestEntry: number | undefined;
  let newestEntry: number | undefined;
  
  entries.forEach(entry => {
    if (entry.teamNumber) teams.add(entry.teamNumber);
    if (entry.matchNumber) matches.add(entry.matchNumber);
    if (entry.scouterInitials) scouters.add(entry.scouterInitials);
    
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
    oldestEntry,
    newestEntry
  };
};

// Migration function to move data from localStorage to IndexedDB
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
    
    // Import the legacy utilities to parse the data
    const { migrateToIdStructure, hasIdStructure } = await import('./scoutingDataUtils');
    
    const parsed = JSON.parse(existingDataStr);
    let dataToMigrate: { entries: ScoutingDataWithId[] };
    
    if (hasIdStructure(parsed)) {
      dataToMigrate = parsed;
    } else {
      dataToMigrate = migrateToIdStructure(parsed);
    }
    
    // Save to IndexedDB
    await saveScoutingEntries(dataToMigrate.entries);
    
    // Create backup of localStorage data before removing
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

// Export data for backup/sharing
export const exportScoutingData = async (): Promise<{
  entries: ScoutingEntryDB[];
  exportedAt: number;
  version: string;
}> => {
  const entries = await loadAllScoutingEntries();
  
  return {
    entries,
    exportedAt: Date.now(),
    version: '1.0'
  };
};

// Import data from backup/sharing
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
      await saveScoutingEntries(importData.entries);
      
      return {
        success: true,
        importedCount: importData.entries.length
      };
    } else {
      // Append mode - check for duplicates
      const existingEntries = await loadAllScoutingEntries();
      const existingIds = new Set(existingEntries.map(entry => entry.id));
      
      const newEntries = importData.entries.filter(entry => !existingIds.has(entry.id));
      await saveScoutingEntries(newEntries);
      
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
