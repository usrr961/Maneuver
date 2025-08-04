/**
 * Utilities for handling scouting data deduplication and unique ID generation
 */

// Generate a deterministic ID based on scouting entry data content
export const generateEntryId = (entryData: Record<string, unknown> | unknown[]): string => {
  // Create a deterministic hash from ALL the scouting data
  // This ensures the same data always generates the same ID across devices
  const dataString = JSON.stringify(entryData);
  
  // Generate multiple hash values to create a 16-character hex string
  let hash1 = 0;
  let hash2 = 0;
  
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash1 = hash1 & hash1; // Convert to 32-bit integer
    hash2 = ((hash2 << 3) + hash2) + char;
    hash2 = hash2 & hash2; // Convert to 32-bit integer
  }
  
  // Create 16-character hex string from both hashes
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0').substring(0, 8);
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0').substring(0, 8);
  
  return part1 + part2;
};

// Enhanced scouting data structure with ID
export interface ScoutingDataWithId {
  id: string;
  data: Record<string, unknown>; // Changed from unknown[] to object
  timestamp?: number; // When this entry was created/imported
}

// Convert legacy data arrays or objects to data with IDs
export const addIdsToScoutingData = (legacyData: (unknown[] | Record<string, unknown>)[]): ScoutingDataWithId[] => {
  return legacyData.map(entryData => {
    let cleanData: Record<string, unknown>;
    
    if (Array.isArray(entryData)) {
      // Legacy array format - this shouldn't happen with the new object format
      // but we'll handle it for backward compatibility
      console.warn('Legacy array format detected, this should not happen with object-based data');
      
      // Clean the data array by removing any embedded ID (if it exists at the beginning)
      let cleanArray = entryData;
      const firstElement = entryData[0];
      
      // Check if first element looks like an embedded ID (16-char hex string)
      if (typeof firstElement === 'string' && firstElement.length === 16 && /^[0-9a-f]+$/i.test(firstElement)) {
        cleanArray = entryData.slice(1);
      }
      
      // Convert array to object (this would need proper field mapping - not recommended)
      cleanData = { legacyArrayData: cleanArray };
    } else {
      // New object format - just use as-is
      cleanData = { ...entryData };
    }
    
    // Generate a unique ID for this entry
    const generatedId = generateEntryId(cleanData);
    return {
      id: generatedId,
      data: cleanData,
      timestamp: Date.now()
    };
  });
};

// Convert data with IDs back to legacy format (objects instead of arrays now)
export const extractLegacyData = (dataWithIds: ScoutingDataWithId[]): Record<string, unknown>[] => {
  return dataWithIds.map(entry => entry.data);
};

// Check if existing data has ID structure
export const hasIdStructure = (data: unknown): data is { entries: ScoutingDataWithId[] } => {
  if (typeof data !== 'object' || data === null || !('entries' in data)) {
    return false;
  }
  
  const candidate = data as Record<string, unknown>;
  if (!Array.isArray(candidate.entries) || candidate.entries.length === 0) {
    return false;
  }
  
  const firstEntry = candidate.entries[0];
  return (
    typeof firstEntry === 'object' &&
    firstEntry !== null &&
    'id' in firstEntry &&
    'data' in firstEntry
  );
};

// Migrate legacy data to new ID-based structure
export const migrateToIdStructure = (legacyData: unknown): { entries: ScoutingDataWithId[] } => {
  let dataEntries: (unknown[] | Record<string, unknown>)[] = [];
  
  // Handle different legacy formats
  if (Array.isArray(legacyData)) {
    // Check if it's an array of objects (new format) or array of arrays (old format)
    if (legacyData.length > 0) {
      if (typeof legacyData[0] === 'object' && legacyData[0] !== null && !Array.isArray(legacyData[0])) {
        // New object format
        dataEntries = legacyData as Record<string, unknown>[];
      } else if (Array.isArray(legacyData[0])) {
        // Old array format
        dataEntries = legacyData as unknown[][];
      }
    }
  } else if (typeof legacyData === 'object' && legacyData !== null && 'data' in legacyData) {
    // Wrapped in data object
    const wrapped = legacyData as { data: unknown[] };
    if (Array.isArray(wrapped.data) && wrapped.data.length > 0) {
      if (typeof wrapped.data[0] === 'object' && wrapped.data[0] !== null && !Array.isArray(wrapped.data[0])) {
        // New object format wrapped
        dataEntries = wrapped.data as Record<string, unknown>[];
      } else if (Array.isArray(wrapped.data[0])) {
        // Old array format wrapped
        dataEntries = wrapped.data as unknown[][];
      }
    }
  }
  
  return {
    entries: addIdsToScoutingData(dataEntries)
  };
};

// Deduplicate and merge scouting data
export const mergeScoutingData = (
  existingData: ScoutingDataWithId[],
  newData: ScoutingDataWithId[],
  mode: 'append' | 'overwrite' | 'smart-merge' = 'smart-merge'
): {
  merged: ScoutingDataWithId[];
  stats: {
    existing: number;
    new: number;
    duplicates: number;
    final: number;
  };
} => {
  if (mode === 'overwrite') {
    return {
      merged: newData,
      stats: {
        existing: existingData.length,
        new: newData.length,
        duplicates: 0,
        final: newData.length
      }
    };
  }
  
  if (mode === 'append') {
    // Simple append without deduplication
    return {
      merged: [...existingData, ...newData],
      stats: {
        existing: existingData.length,
        new: newData.length,
        duplicates: 0,
        final: existingData.length + newData.length
      }
    };
  }
  
  // Smart merge mode - deduplicate based on IDs
  const existingIds = new Set(existingData.map(entry => entry.id));
  const uniqueNewData = newData.filter(entry => !existingIds.has(entry.id));
  const duplicateCount = newData.length - uniqueNewData.length;
  
  const merged = [...existingData, ...uniqueNewData];
  
  return {
    merged,
    stats: {
      existing: existingData.length,
      new: uniqueNewData.length,
      duplicates: duplicateCount,
      final: merged.length
    }
  };
};

// Load scouting data with Dexie support and localStorage fallback
export const loadScoutingData = async (): Promise<{ entries: ScoutingDataWithId[] }> => {
  try {
    // First, try to load from Dexie
    const { loadAllScoutingEntries, migrateFromLocalStorage, migrateFromIndexedDB } = await import('./dexieDB');
    
    const existingEntries = await loadAllScoutingEntries();
    if (existingEntries.length > 0) {
      // Convert ScoutingEntryDB back to ScoutingDataWithId format
      const convertedEntries: ScoutingDataWithId[] = existingEntries.map(entry => ({
        id: entry.id,
        data: entry.data,
        timestamp: entry.timestamp
      }));
      return { entries: convertedEntries };
    }
    
    // If no data in Dexie, try migrating from old IndexedDB first
    const indexedDBMigration = await migrateFromIndexedDB();
    if (indexedDBMigration.success && indexedDBMigration.migratedCount > 0) {
      console.log(`Migrated ${indexedDBMigration.migratedCount} entries from old IndexedDB to Dexie`);
      const entries = await loadAllScoutingEntries();
      const convertedEntries: ScoutingDataWithId[] = entries.map(entry => ({
        id: entry.id,
        data: entry.data,
        timestamp: entry.timestamp
      }));
      return { entries: convertedEntries };
    }
    
    // If no data in old IndexedDB, try migrating from localStorage
    const localStorageMigration = await migrateFromLocalStorage();
    if (localStorageMigration.success && localStorageMigration.migratedCount > 0) {
      console.log(`Migrated ${localStorageMigration.migratedCount} entries from localStorage to Dexie`);
      const entries = await loadAllScoutingEntries();
      const convertedEntries: ScoutingDataWithId[] = entries.map(entry => ({
        id: entry.id,
        data: entry.data,
        timestamp: entry.timestamp
      }));
      return { entries: convertedEntries };
    }
    
    return { entries: [] };
  } catch (error) {
    console.error('Error loading scouting data from Dexie, falling back to localStorage:', error);
    
    // Fallback to localStorage
    const existingDataStr = localStorage.getItem("scoutingData");
    
    if (!existingDataStr) {
      return { entries: [] };
    }
    
    try {
      const parsed = JSON.parse(existingDataStr);
      
      if (hasIdStructure(parsed)) {
        return parsed;
      } else {
        const migrated = migrateToIdStructure(parsed);
        saveScoutingData(migrated);
        return migrated;
      }
    } catch (parseError) {
      console.error("Error parsing scouting data:", parseError);
      return { entries: [] };
    }
  }
};

// Load legacy format data for backward compatibility with existing components
export const loadLegacyScoutingData = async (): Promise<Record<string, unknown>[]> => {
  const data = await loadScoutingData();
  return extractLegacyData(data.entries);
};

// Save scouting data using Dexie with localStorage fallback
export const saveScoutingData = async (data: { entries: ScoutingDataWithId[] }): Promise<void> => {
  try {
    // Try to save to Dexie first
    const { saveScoutingEntries } = await import('./dexieDB');
    await saveScoutingEntries(data.entries);
  } catch (error) {
    console.error('Error saving to Dexie, falling back to localStorage:', error);
    
    // Fallback to localStorage (legacy format)
    const legacyData = extractLegacyData(data.entries);
    const legacyFormat = { data: legacyData };
    localStorage.setItem("scoutingData", JSON.stringify(legacyFormat));
  }
};

// Save scouting data in new object format (for internal use if needed)
export const saveScoutingDataNewFormat = (data: { entries: ScoutingDataWithId[] }): void => {
  localStorage.setItem("scoutingData", JSON.stringify(data));
};

// Get display summary for UI (now async)
export const getDataSummary = async (data?: { entries: ScoutingDataWithId[] }): Promise<{
  totalEntries: number;
  teams: string[];
  matches: string[];
  scouters: string[];
}> => {
  let dataToUse = data;
  
  if (!dataToUse) {
    dataToUse = await loadScoutingData();
  }
  
  const teams = new Set<string>();
  const matches = new Set<string>();
  const scouters = new Set<string>();
  
  dataToUse.entries.forEach(entry => {
    // Skip the ID at index 0, so actual data starts at index 1
    const matchNumber = entry.data[1]?.toString(); // was index 0, now index 1
    const scouterInitials = entry.data[3]?.toString(); // was index 2, now index 3
    const teamNumber = entry.data[4]?.toString();   // was index 3, now index 4
    
    if (matchNumber) matches.add(matchNumber);
    if (scouterInitials) scouters.add(scouterInitials);
    if (teamNumber) teams.add(teamNumber);
  });
  
  return {
    totalEntries: dataToUse.entries.length,
    teams: Array.from(teams).sort((a, b) => Number(a) - Number(b)),
    matches: Array.from(matches).sort((a, b) => Number(a) - Number(b)),
    scouters: Array.from(scouters).sort()
  };
};
