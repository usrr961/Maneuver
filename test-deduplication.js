// Test file to verify deduplication system
import { 
  generateEntryId, 
  addIdsToScoutingData, 
  mergeScoutingData, 
  ScoutingDataWithId 
} from '../src/lib/scoutingDataUtils';

// Sample scouting data entries
const entry1 = ["1", "red", "JD", "3314", true, false, false, false, false, false, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 2, 0, 0, 1, 0, 0, 0, true];
const entry2 = ["2", "blue", "AS", "1234", false, true, false, false, false, false, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 0, 0, 1, 0, 0, false];
const entry3 = ["1", "red", "JD", "3314", true, false, false, false, false, false, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 2, 0, 0, 1, 0, 0, 0, true]; // Duplicate of entry1

// Test ID generation
console.log("Testing ID generation:");
console.log("Entry 1 ID:", generateEntryId(entry1));
console.log("Entry 2 ID:", generateEntryId(entry2));
console.log("Entry 3 ID:", generateEntryId(entry3));
console.log("Entry 1 and 3 should have same ID:", generateEntryId(entry1) === generateEntryId(entry3));

// Test data with IDs
const dataSet1 = addIdsToScoutingData([entry1, entry2]);
const dataSet2 = addIdsToScoutingData([entry2, entry3]); // Contains duplicate of entry2 and same data as entry1

console.log("\nTesting merge with deduplication:");
const mergeResult = mergeScoutingData(dataSet1, dataSet2, 'smart-merge');
console.log("Original set 1:", dataSet1.length, "entries");
console.log("Original set 2:", dataSet2.length, "entries");
console.log("Merge result:", mergeResult.merged.length, "entries");
console.log("Stats:", mergeResult.stats);
console.log("Duplicates found:", mergeResult.stats.duplicates);
