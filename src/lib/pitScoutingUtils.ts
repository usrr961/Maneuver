import type { PitScoutingEntry, PitScoutingData } from './pitScoutingTypes';
import { 
  savePitScoutingEntry as dbSavePitScoutingEntry, 
  loadPitScoutingByTeamAndEvent, 
  loadAllPitScoutingEntries, 
  loadPitScoutingByTeam,
  loadPitScoutingByEvent,
  deletePitScoutingEntry as dbDeletePitScoutingEntry, 
  clearAllPitScoutingData as dbClearAllPitScoutingData,
  getPitScoutingStats as dbGetPitScoutingStats 
} from './dexieDB';

// Generate unique ID for pit scouting entries
export const generatePitScoutingId = (entry: Omit<PitScoutingEntry, 'id' | 'timestamp'>): string => {
  const baseString = `${entry.teamNumber}-${entry.eventName}-${entry.scouterInitials}`;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `pit-${baseString}-${timestamp}-${random}`;
};

// Save pit scouting entry
export const savePitScoutingEntry = async (entry: Omit<PitScoutingEntry, 'id' | 'timestamp'>): Promise<PitScoutingEntry> => {
  try {
    // Check if an entry for this team and event already exists
    const existing = await loadPitScoutingByTeamAndEvent(entry.teamNumber, entry.eventName);
    
    const completeEntry: PitScoutingEntry = {
      ...entry,
      id: existing?.id || generatePitScoutingId(entry),
      timestamp: Date.now()
    };

    await dbSavePitScoutingEntry(completeEntry);
    return completeEntry;
  } catch (error) {
    console.error('Error saving pit scouting entry:', error);
    throw error;
  }
};

// Load all pit scouting data
export const loadPitScoutingData = async (): Promise<PitScoutingData> => {
  try {
    const entries = await loadAllPitScoutingEntries();
    return { 
      entries, 
      lastUpdated: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  } catch (error) {
    console.error('Error loading pit scouting data:', error);
    return { entries: [], lastUpdated: 0 };
  }
};

// Load pit scouting entry by team and event
export const loadPitScoutingEntry = async (teamNumber: string, eventName: string): Promise<PitScoutingEntry | null> => {
  try {
    const result = await loadPitScoutingByTeamAndEvent(teamNumber, eventName);
    return result || null;
  } catch (error) {
    console.error('Error loading pit scouting entry:', error);
    return null;
  }
};

// Load pit scouting entries by team
export const loadPitScoutingEntriesByTeam = async (teamNumber: string): Promise<PitScoutingEntry[]> => {
  try {
    return await loadPitScoutingByTeam(teamNumber);
  } catch (error) {
    console.error('Error loading pit scouting entries by team:', error);
    return [];
  }
};

// Load pit scouting entries by event
export const loadPitScoutingEntriesByEvent = async (eventName: string): Promise<PitScoutingEntry[]> => {
  try {
    return await loadPitScoutingByEvent(eventName);
  } catch (error) {
    console.error('Error loading pit scouting entries by event:', error);
    return [];
  }
};

// Delete pit scouting entry
export const deletePitScoutingEntry = async (id: string): Promise<void> => {
  try {
    await dbDeletePitScoutingEntry(id);
  } catch (error) {
    console.error('Error deleting pit scouting entry:', error);
    throw error;
  }
};

// Clear all pit scouting data
export const clearAllPitScoutingData = async (): Promise<void> => {
  try {
    await dbClearAllPitScoutingData();
  } catch (error) {
    console.error('Error clearing pit scouting data:', error);
    throw error;
  }
};

// Get pit scouting statistics
export const getPitScoutingStats = async (): Promise<{
  totalEntries: number;
  teams: string[];
  events: string[];
  scouters: string[];
}> => {
  try {
    return await dbGetPitScoutingStats();
  } catch (error) {
    console.error('Error getting pit scouting stats:', error);
    return {
      totalEntries: 0,
      teams: [],
      events: [],
      scouters: []
    };
  }
};

// Export pit scouting data
export const exportPitScoutingData = async (): Promise<PitScoutingData> => {
  return await loadPitScoutingData();
};

// Import pit scouting data
export const importPitScoutingData = async (
  importData: PitScoutingData,
  mode: 'append' | 'overwrite' = 'append'
): Promise<{ imported: number; duplicatesSkipped: number }> => {
  try {
    if (mode === 'overwrite') {
      await clearAllPitScoutingData();
      // Save all imported entries
      await Promise.all(importData.entries.map(entry => dbSavePitScoutingEntry(entry)));
      return { imported: importData.entries.length, duplicatesSkipped: 0 };
    } else {
      const existingEntries = await loadAllPitScoutingEntries();
      const existingIds = new Set(existingEntries.map(e => e.id));
      const newEntries = importData.entries.filter(entry => !existingIds.has(entry.id));
      
      // Save only new entries
      await Promise.all(newEntries.map(entry => dbSavePitScoutingEntry(entry)));
      
      return { 
        imported: newEntries.length, 
        duplicatesSkipped: importData.entries.length - newEntries.length 
      };
    }
  } catch (error) {
    console.error('Error importing pit scouting data:', error);
    throw error;
  }
};

// Utility to convert pit scouting data to CSV
export const exportPitScoutingToCSV = async (): Promise<string> => {
  const data = await loadPitScoutingData();
  
  const headers = [
    'ID', 'Team Number', 'Event Name', 'Scouter', 'Timestamp',
    'Weight', 'Drivetrain', 'Programming Language',
    'Coral Ground Pickup', 'Algae Ground Pickup',
    'Auto Pos0 Coral L1', 'Auto Pos0 Coral L2', 'Auto Pos0 Coral L3', 'Auto Pos0 Coral L4', 'Auto Pos0 Algae Net', 'Auto Pos0 Algae Processor',
    'Auto Pos1 Coral L1', 'Auto Pos1 Coral L2', 'Auto Pos1 Coral L3', 'Auto Pos1 Coral L4', 'Auto Pos1 Algae Net', 'Auto Pos1 Algae Processor',
    'Auto Pos2 Coral L1', 'Auto Pos2 Coral L2', 'Auto Pos2 Coral L3', 'Auto Pos2 Coral L4', 'Auto Pos2 Algae Net', 'Auto Pos2 Algae Processor',
    'Auto Pos3 Coral L1', 'Auto Pos3 Coral L2', 'Auto Pos3 Coral L3', 'Auto Pos3 Coral L4', 'Auto Pos3 Algae Net', 'Auto Pos3 Algae Processor',
    'Auto Pos4 Coral L1', 'Auto Pos4 Coral L2', 'Auto Pos4 Coral L3', 'Auto Pos4 Coral L4', 'Auto Pos4 Algae Net', 'Auto Pos4 Algae Processor',
    'Teleop Coral L1', 'Teleop Coral L2', 'Teleop Coral L3', 'Teleop Coral L4', 'Teleop Total Algae', 'Teleop Algae Net Shots', 'Teleop Algae Processor',
    'Can Shallow Climb', 'Can Deep Climb', 'Can Park',
    'Notes'
  ];

  const rows = data.entries.map(entry => [
    entry.id,
    entry.teamNumber,
    entry.eventName,
    entry.scouterInitials,
    new Date(entry.timestamp).toISOString(),
    entry.weight || '',
    entry.drivetrain || '',
    entry.programmingLanguage || '',
    entry.groundPickupCapabilities?.coralGroundPickup ? 'Yes' : 'No',
    entry.groundPickupCapabilities?.algaeGroundPickup ? 'Yes' : 'No',
    // Auto Position 0
    entry.reportedAutoScoring?.position0?.coralL1 || 0,
    entry.reportedAutoScoring?.position0?.coralL2 || 0,
    entry.reportedAutoScoring?.position0?.coralL3 || 0,
    entry.reportedAutoScoring?.position0?.coralL4 || 0,
    entry.reportedAutoScoring?.position0?.algaeNet || 0,
    entry.reportedAutoScoring?.position0?.algaeProcessor || 0,
    // Auto Position 1
    entry.reportedAutoScoring?.position1?.coralL1 || 0,
    entry.reportedAutoScoring?.position1?.coralL2 || 0,
    entry.reportedAutoScoring?.position1?.coralL3 || 0,
    entry.reportedAutoScoring?.position1?.coralL4 || 0,
    entry.reportedAutoScoring?.position1?.algaeNet || 0,
    entry.reportedAutoScoring?.position1?.algaeProcessor || 0,
    // Auto Position 2
    entry.reportedAutoScoring?.position2?.coralL1 || 0,
    entry.reportedAutoScoring?.position2?.coralL2 || 0,
    entry.reportedAutoScoring?.position2?.coralL3 || 0,
    entry.reportedAutoScoring?.position2?.coralL4 || 0,
    entry.reportedAutoScoring?.position2?.algaeNet || 0,
    entry.reportedAutoScoring?.position2?.algaeProcessor || 0,
    // Auto Position 3
    entry.reportedAutoScoring?.position3?.coralL1 || 0,
    entry.reportedAutoScoring?.position3?.coralL2 || 0,
    entry.reportedAutoScoring?.position3?.coralL3 || 0,
    entry.reportedAutoScoring?.position3?.coralL4 || 0,
    entry.reportedAutoScoring?.position3?.algaeNet || 0,
    entry.reportedAutoScoring?.position3?.algaeProcessor || 0,
    // Auto Position 4
    entry.reportedAutoScoring?.position4?.coralL1 || 0,
    entry.reportedAutoScoring?.position4?.coralL2 || 0,
    entry.reportedAutoScoring?.position4?.coralL3 || 0,
    entry.reportedAutoScoring?.position4?.coralL4 || 0,
    entry.reportedAutoScoring?.position4?.algaeNet || 0,
    entry.reportedAutoScoring?.position4?.algaeProcessor || 0,
    // Teleop Scoring
    entry.reportedTeleopScoring?.coralL1 || 0,
    entry.reportedTeleopScoring?.coralL2 || 0,
    entry.reportedTeleopScoring?.coralL3 || 0,
    entry.reportedTeleopScoring?.coralL4 || 0,
    entry.reportedTeleopScoring?.totalAlgae || 0,
    entry.reportedTeleopScoring?.algaeNetShots ? 'Yes' : 'No',
    entry.reportedTeleopScoring?.algaeProcessor ? 'Yes' : 'No',
    // Endgame
    entry.reportedEndgame?.canShallowClimb ? 'Yes' : 'No',
    entry.reportedEndgame?.canDeepClimb ? 'Yes' : 'No',
    entry.reportedEndgame?.canPark ? 'Yes' : 'No',
    entry.notes || ''
  ]);

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};
