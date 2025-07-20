/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  loadScoutingData, 
  saveScoutingData, 
  mergeScoutingData, 
  addIdsToScoutingData
} from "@/lib/scoutingDataUtils";
import UniversalFountainScanner from "./UniversalFountainScanner";

interface FountainCodeScannerProps {
  onBack: () => void;
  onSwitchToGenerator: () => void;
}

const FountainCodeScanner = ({ onBack, onSwitchToGenerator }: FountainCodeScannerProps) => {
  const saveScoutingDataFromFountain = (data: unknown) => {
    console.log('Saving scouting data from fountain:', data);
    
    // Load existing data
    const existingScoutingData = loadScoutingData();
    
    // Convert new data to ID structure
    let newDataArrays: unknown[][] = [];
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      newDataArrays = (data as any).data;
    }
    const newDataWithIds = addIdsToScoutingData(newDataArrays);
    
    // Merge data with deduplication (smart merge by default)
    const mergeResult = mergeScoutingData(
      existingScoutingData.entries,
      newDataWithIds,
      'smart-merge'
    );
    
    // Save merged data
    saveScoutingData({ entries: mergeResult.merged });
    
    // Show merge info
    const { stats } = mergeResult;
    if (stats.duplicates > 0) {
      console.log(`Merged: ${stats.new} new + ${stats.existing} existing (${stats.duplicates} duplicates skipped)`);
    }
  };

  const validateScoutingData = (data: unknown): boolean => {
    // Validate that it's scouting data in the expected format
    if (!data || typeof data !== 'object') return false;
    
    const dataObj = data as any;
    if (!dataObj.data || !Array.isArray(dataObj.data)) return false;
    
    // Check if it has reasonable scouting data structure
    if (dataObj.data.length === 0) return false;
    
    // Basic validation - should have arrays with reasonable length
    const firstEntry = dataObj.data[0];
    if (!Array.isArray(firstEntry) || firstEntry.length < 5) return false;
    
    return true;
  };

  const getScoutingDataSummary = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '0 entries';
    
    const dataObj = data as any;
    if (!dataObj.data || !Array.isArray(dataObj.data)) return '0 entries';
    
    return `${dataObj.data.length} entries`;
  };

  return (
    <UniversalFountainScanner
      onBack={onBack}
      onSwitchToGenerator={onSwitchToGenerator}
      dataType="scouting"
      expectedPacketType="scouting_fountain_packet"
      saveData={saveScoutingDataFromFountain}
      validateData={validateScoutingData}
      getDataSummary={getScoutingDataSummary}
      title="Scan Fountain Codes"
      description="Point your camera at the QR codes to receive scouting data"
      completionMessage="Scouting data has been successfully reconstructed and merged"
    />
  );
};

export default FountainCodeScanner;
