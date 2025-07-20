/**
 * Utilities for handling scouting data deduplication and unique ID generation
 */

// Generate a deterministic ID based on scouting entry data content
export const generateEntryId = (entryData: unknown[]): string => {
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
  data: unknown[];
  timestamp?: number; // When this entry was created/imported
}

// Convert legacy data arrays to data with IDs
export const addIdsToScoutingData = (legacyData: unknown[][]): ScoutingDataWithId[] => {
  return legacyData.map(entryArray => {
    // Check if this array already has an ID as the first element (16-char hex string)
    const firstElement = entryArray[0];
    if (typeof firstElement === 'string' && firstElement.length === 16 && /^[0-9a-f]+$/i.test(firstElement)) {
      // Already has ID, use it and keep the full array as data
      return {
        id: firstElement,
        data: entryArray,
        timestamp: Date.now()
      };
    } else {
      // No ID, generate one and add it to the beginning
      const generatedId = generateEntryId(entryArray);
      const dataWithId = [generatedId, ...entryArray];
      return {
        id: generatedId,
        data: dataWithId,
        timestamp: Date.now()
      };
    }
  });
};

// Convert data with IDs back to legacy format
export const extractLegacyData = (dataWithIds: ScoutingDataWithId[]): unknown[][] => {
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
  let dataArrays: unknown[][] = [];
  
  // Handle different legacy formats
  if (Array.isArray(legacyData)) {
    // Direct array format - check if it's array of arrays
    if (legacyData.length > 0 && Array.isArray(legacyData[0])) {
      dataArrays = legacyData as unknown[][];
    }
  } else if (typeof legacyData === 'object' && legacyData !== null && 'data' in legacyData) {
    // Wrapped in data object
    const wrapped = legacyData as { data: unknown[] };
    if (Array.isArray(wrapped.data) && wrapped.data.length > 0 && Array.isArray(wrapped.data[0])) {
      dataArrays = wrapped.data as unknown[][];
    }
  }
  
  return {
    entries: addIdsToScoutingData(dataArrays)
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

// Load scouting data from localStorage with migration support
export const loadScoutingData = (): { entries: ScoutingDataWithId[] } => {
  const existingDataStr = localStorage.getItem("scoutingData");
  
  if (!existingDataStr) {
    return { entries: [] };
  }
  
  try {
    const parsed = JSON.parse(existingDataStr);
    
    if (hasIdStructure(parsed)) {
      // Already in new format
      return parsed;
    } else {
      // Legacy format - migrate and save
      const migrated = migrateToIdStructure(parsed);
      saveScoutingData(migrated);
      return migrated;
    }
  } catch (error) {
    console.error("Error parsing scouting data:", error);
    return { entries: [] };
  }
};

// Load legacy format data for backward compatibility with existing components
export const loadLegacyScoutingData = (): unknown[][] => {
  const data = loadScoutingData();
  return extractLegacyData(data.entries);
};

// Save scouting data to localStorage in legacy format (maintains backward compatibility)
export const saveScoutingData = (data: { entries: ScoutingDataWithId[] }): void => {
  // Convert back to legacy format: { data: array[][] }
  const legacyData = extractLegacyData(data.entries);
  const legacyFormat = { data: legacyData };
  localStorage.setItem("scoutingData", JSON.stringify(legacyFormat));
};

// Save scouting data in new object format (for internal use if needed)
export const saveScoutingDataNewFormat = (data: { entries: ScoutingDataWithId[] }): void => {
  localStorage.setItem("scoutingData", JSON.stringify(data));
};

// Get display summary for UI
export const getDataSummary = (data: { entries: ScoutingDataWithId[] }): {
  totalEntries: number;
  teams: string[];
  matches: string[];
  scouters: string[];
} => {
  const teams = new Set<string>();
  const matches = new Set<string>();
  const scouters = new Set<string>();
  
  data.entries.forEach(entry => {
    // Skip the ID at index 0, so actual data starts at index 1
    const matchNumber = entry.data[1]?.toString(); // was index 0, now index 1
    const scouterInitials = entry.data[3]?.toString(); // was index 2, now index 3
    const teamNumber = entry.data[4]?.toString();   // was index 3, now index 4
    
    if (matchNumber) matches.add(matchNumber);
    if (scouterInitials) scouters.add(scouterInitials);
    if (teamNumber) teams.add(teamNumber);
  });
  
  return {
    totalEntries: data.entries.length,
    teams: Array.from(teams).sort((a, b) => Number(a) - Number(b)),
    matches: Array.from(matches).sort((a, b) => Number(a) - Number(b)),
    scouters: Array.from(scouters).sort()
  };
};
