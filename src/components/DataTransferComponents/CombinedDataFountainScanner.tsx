import { gameDB, type Scouter, type MatchPrediction } from "@/lib/dexieDB";
import { loadScoutingData, saveScoutingData, mergeScoutingData, type ScoutingDataWithId } from "@/lib/scoutingDataUtils";
import UniversalFountainScanner from "./UniversalFountainScanner";
import { toast } from "sonner";

interface CombinedDataFountainScannerProps {
  onBack: () => void;
  onSwitchToGenerator: () => void;
}

interface CombinedDataStructure {
  type: string;
  scoutingData: {
    entries: ScoutingDataWithId[];
  };
  scouterProfiles: {
    scouters: Scouter[];
    predictions: MatchPrediction[];
  };
  metadata: {
    exportedAt: string;
    version: string;
    scoutingEntriesCount: number;
    scoutersCount: number;
    predictionsCount: number;
  };
}

const CombinedDataFountainScanner = ({ onBack, onSwitchToGenerator }: CombinedDataFountainScannerProps) => {
  const saveCombinedData = async (data: unknown) => {
    console.log('Saving combined data from fountain:', data);
    
    try {
      // Validate the received data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid combined data format');
      }
      
      const combinedData = data as CombinedDataStructure;
      
      if (combinedData.type !== 'combined_export') {
        throw new Error('Data is not a combined export format');
      }
      
      if (!combinedData.scoutingData || !combinedData.scouterProfiles || !combinedData.metadata) {
        throw new Error('Missing required data sections in combined export');
      }
      
      let scoutingResults = { added: 0, existing: 0, duplicates: 0 };
      const scouterResults = { scoutersAdded: 0, scoutersUpdated: 0, predictionsAdded: 0, predictionsSkipped: 0 };
      
      // Process scouting data if present
      if (combinedData.scoutingData.entries && combinedData.scoutingData.entries.length > 0) {
        console.log(`Importing ${combinedData.scoutingData.entries.length} scouting entries`);
        
        // Load existing scouting data
        const existingScoutingData = await loadScoutingData();
        
        // Merge scouting data with deduplication
        const mergeResult = mergeScoutingData(
          existingScoutingData.entries,
          combinedData.scoutingData.entries,
          'smart-merge'
        );
        
        // Save merged scouting data
        await saveScoutingData({ entries: mergeResult.merged });
        scoutingResults = {
          added: mergeResult.stats.new,
          existing: mergeResult.stats.existing,
          duplicates: mergeResult.stats.duplicates
        };
        
        console.log('Scouting data import results:', scoutingResults);
      }
      
      // Process scouter profiles data if present
      if (combinedData.scouterProfiles.scouters || combinedData.scouterProfiles.predictions) {
        const scoutersToImport = combinedData.scouterProfiles.scouters || [];
        const predictionsToImport = combinedData.scouterProfiles.predictions || [];
        
        console.log(`Importing ${scoutersToImport.length} scouters and ${predictionsToImport.length} predictions`);
        
        // Get existing data to merge intelligently
        const existingScouters = await gameDB.scouters.toArray();
        const existingPredictions = await gameDB.predictions.toArray();
        
        // Process scouters - merge or update based on name
        for (const scouter of scoutersToImport) {
          const existing = existingScouters.find(s => s.name === scouter.name);
          
          if (existing) {
            // Update existing scouter with higher values or newer timestamp
            const shouldUpdate = 
              scouter.lastUpdated > existing.lastUpdated ||
              scouter.stakes > existing.stakes ||
              scouter.totalPredictions > existing.totalPredictions;
              
            if (shouldUpdate) {
              await gameDB.scouters.update(scouter.name, {
                stakes: Math.max(scouter.stakes, existing.stakes),
                totalPredictions: Math.max(scouter.totalPredictions, existing.totalPredictions),
                correctPredictions: Math.max(scouter.correctPredictions, existing.correctPredictions),
                currentStreak: scouter.lastUpdated > existing.lastUpdated ? scouter.currentStreak : existing.currentStreak,
                longestStreak: Math.max(scouter.longestStreak, existing.longestStreak),
                lastUpdated: Math.max(scouter.lastUpdated, existing.lastUpdated)
              });
              scouterResults.scoutersUpdated++;
            }
          } else {
            // Add new scouter
            await gameDB.scouters.add(scouter);
            scouterResults.scoutersAdded++;
          }
        }
        
        // Process predictions - avoid duplicates based on unique constraint
        for (const prediction of predictionsToImport) {
          const exists = existingPredictions.some(p => p.id === prediction.id);
          
          if (!exists) {
            try {
              await gameDB.predictions.add(prediction);
              scouterResults.predictionsAdded++;
            } catch {
              // Probably a duplicate ID constraint, skip it
              console.warn(`Skipping duplicate prediction: ${prediction.id}`);
              scouterResults.predictionsSkipped++;
            }
          } else {
            scouterResults.predictionsSkipped++;
          }
        }
        
        // Update localStorage scouter list to include any new scouters
        if (scoutersToImport.length > 0) {
          const allScouterNames = scoutersToImport.map(s => s.name);
          const existingScoutersList = localStorage.getItem("scoutersList");
          let scoutersListArray: string[] = [];
          
          if (existingScoutersList) {
            try {
              scoutersListArray = JSON.parse(existingScoutersList);
            } catch {
              scoutersListArray = [];
            }
          }
          
          // Merge and deduplicate
          const mergedScouters = [...new Set([...scoutersListArray, ...allScouterNames])].sort();
          localStorage.setItem("scoutersList", JSON.stringify(mergedScouters));
        }
        
        console.log('Scouter profiles import results:', scouterResults);
      }
      
      // Show comprehensive summary to user
      const scoutingMessage = scoutingResults.added > 0 || scoutingResults.existing > 0 
        ? `Scouting: ${scoutingResults.added} new entries added, ${scoutingResults.existing} existing entries found${scoutingResults.duplicates > 0 ? `, ${scoutingResults.duplicates} duplicates skipped` : ''}. `
        : '';
        
      const scouterMessage = scouterResults.scoutersAdded > 0 || scouterResults.scoutersUpdated > 0 || scouterResults.predictionsAdded > 0
        ? `Profiles: ${scouterResults.scoutersAdded} new scouters, ${scouterResults.scoutersUpdated} updated scouters, ${scouterResults.predictionsAdded} predictions imported.`
        : '';
      
      const fullMessage = `Combined import complete! ${scoutingMessage}${scouterMessage}`;
      toast.success(fullMessage);
      
      console.log('Combined data import complete:', {
        scoutingResults,
        scouterResults
      });
      
    } catch (error) {
      console.error('Error importing combined data:', error);
      toast.error(`Combined import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const validateCombinedData = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    const combinedData = data as CombinedDataStructure;
    
    // Check for combined export type
    if (combinedData.type !== 'combined_export') return false;
    
    // Must have at least the basic structure
    if (!combinedData.scoutingData || !combinedData.scouterProfiles || !combinedData.metadata) return false;
    
    // Validate that we have some meaningful data
    const hasScoutingData = combinedData.scoutingData.entries && Array.isArray(combinedData.scoutingData.entries) && combinedData.scoutingData.entries.length > 0;
    const hasScouterData = (combinedData.scouterProfiles.scouters && combinedData.scouterProfiles.scouters.length > 0) || 
                          (combinedData.scouterProfiles.predictions && combinedData.scouterProfiles.predictions.length > 0);
    
    return hasScoutingData || hasScouterData;
  };

  const getCombinedDataSummary = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '0 items';
    
    const combinedData = data as CombinedDataStructure;
    
    if (!combinedData.metadata) return 'Invalid data';
    
    const scoutingCount = combinedData.metadata.scoutingEntriesCount || 0;
    const scoutersCount = combinedData.metadata.scoutersCount || 0;
    const predictionsCount = combinedData.metadata.predictionsCount || 0;
    
    const parts = [];
    if (scoutingCount > 0) parts.push(`${scoutingCount} scouting entries`);
    if (scoutersCount > 0) parts.push(`${scoutersCount} scouters`);
    if (predictionsCount > 0) parts.push(`${predictionsCount} predictions`);
    
    return parts.length > 0 ? parts.join(', ') : 'No data';
  };

  return (
    <UniversalFountainScanner
      onBack={onBack}
      onSwitchToGenerator={onSwitchToGenerator}
      dataType="combined"
      expectedPacketType="combined_fountain_packet"
      saveData={saveCombinedData}
      validateData={validateCombinedData}
      getDataSummary={getCombinedDataSummary}
      title="Scan Combined Data Fountain Codes"
      description="Point your camera at the QR codes to receive both scouting data and scouter profiles"
      completionMessage="Combined data has been successfully reconstructed and imported"
    />
  );
};

export default CombinedDataFountainScanner;
