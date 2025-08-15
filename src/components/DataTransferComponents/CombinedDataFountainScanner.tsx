import { gameDB, type Scouter, type MatchPrediction } from "@/lib/dexieDB";
import { loadScoutingData, saveScoutingData, mergeScoutingData, type ScoutingDataWithId } from "@/lib/scoutingDataUtils";
import UniversalFountainScanner from "./UniversalFountainScanner";
import ScouterAddConfirmDialog from "./ScouterAddConfirmDialog";
import { toast } from "sonner";
import { useState } from "react";

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
  const [showScouterAddDialog, setShowScouterAddDialog] = useState(false);
  const [pendingScouterNames, setPendingScouterNames] = useState<string[]>([]);
  const [pendingImportData, setPendingImportData] = useState<{
    scoutingData: ScoutingDataWithId[];
    scoutersToImport: Scouter[];
    predictionsToImport: MatchPrediction[];
  } | null>(null);
  const saveCombinedData = async (data: unknown) => {
    
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
      }
      
      // Process scouter profiles data if present
      if (combinedData.scouterProfiles.scouters || combinedData.scouterProfiles.predictions) {
        const scoutersToImport = combinedData.scouterProfiles.scouters || [];
        const predictionsToImport = combinedData.scouterProfiles.predictions || [];
        
        // Check which scouters would be new to the selectable list
        const existingScoutersList = localStorage.getItem("scoutersList");
        let scoutersListArray: string[] = [];
        
        if (existingScoutersList) {
          try {
            scoutersListArray = JSON.parse(existingScoutersList);
          } catch {
            scoutersListArray = [];
          }
        }
        
        const newScouterNames = scoutersToImport
          .map(s => s.name)
          .filter(name => !scoutersListArray.includes(name));
        
        // If there are new scouters, ask the user if they want to add them to selectable list
        if (newScouterNames.length > 0) {
          setPendingScouterNames(newScouterNames);
          setPendingImportData({ 
            scoutingData: combinedData.scoutingData.entries,
            scoutersToImport, 
            predictionsToImport 
          });
          setShowScouterAddDialog(true);
          return; // Wait for user decision
        }
        
        // If no new scouters, proceed with import without updating selectable list
        const scouterImportResult = await performScouterImport(scoutersToImport, predictionsToImport, false);
        scouterResults.scoutersAdded = scouterImportResult.scoutersAdded;
        scouterResults.scoutersUpdated = scouterImportResult.scoutersUpdated;
        scouterResults.predictionsAdded = scouterImportResult.predictionsAdded;
        scouterResults.predictionsSkipped = scouterImportResult.predictionsSkipped;
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
      
    } catch (error) {
      console.error('Error importing combined data:', error);
      toast.error(`Combined import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const performScouterImport = async (scoutersToImport: Scouter[], predictionsToImport: MatchPrediction[], addToSelectableList: boolean) => {
    const results = { scoutersAdded: 0, scoutersUpdated: 0, predictionsAdded: 0, predictionsSkipped: 0 };
    
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
          results.scoutersUpdated++;
        }
      } else {
        // Add new scouter
        await gameDB.scouters.add(scouter);
        results.scoutersAdded++;
      }
    }
    
    // Process predictions - avoid duplicates based on unique constraint
    for (const prediction of predictionsToImport) {
      const exists = existingPredictions.some(p => p.id === prediction.id);
      
      if (!exists) {
        try {
          await gameDB.predictions.add(prediction);
          results.predictionsAdded++;
        } catch {
          // Probably a duplicate ID constraint, skip it
          console.warn(`Skipping duplicate prediction: ${prediction.id}`);
          results.predictionsSkipped++;
        }
      } else {
        results.predictionsSkipped++;
      }
    }
    
    // Only update localStorage scouter list if user chose to add to selectable list
    if (addToSelectableList && scoutersToImport.length > 0) {
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
    
    return results;
  };

  const performCombinedImport = async (scoutingData: ScoutingDataWithId[], scoutersToImport: Scouter[], predictionsToImport: MatchPrediction[], addToSelectableList: boolean) => {
    let scoutingResults = { added: 0, existing: 0, duplicates: 0 };
    
    // Process scouting data if present
    if (scoutingData && scoutingData.length > 0) {
      // Load existing scouting data
      const existingScoutingData = await loadScoutingData();
      
      // Merge scouting data with deduplication
      const mergeResult = mergeScoutingData(
        existingScoutingData.entries,
        scoutingData,
        'smart-merge'
      );
      
      // Save merged scouting data
      await saveScoutingData({ entries: mergeResult.merged });
      scoutingResults = {
        added: mergeResult.stats.new,
        existing: mergeResult.stats.existing,
        duplicates: mergeResult.stats.duplicates
      };
    }
    
    // Process scouter profiles data
    const scouterResults = await performScouterImport(scoutersToImport, predictionsToImport, addToSelectableList);
    
    // Show comprehensive summary to user
    const scoutingMessage = scoutingResults.added > 0 || scoutingResults.existing > 0 
      ? `Scouting: ${scoutingResults.added} new entries added, ${scoutingResults.existing} existing entries found${scoutingResults.duplicates > 0 ? `, ${scoutingResults.duplicates} duplicates skipped` : ''}. `
      : '';
      
    const scouterMessage = scouterResults.scoutersAdded > 0 || scouterResults.scoutersUpdated > 0 || scouterResults.predictionsAdded > 0
      ? `Profiles: ${scouterResults.scoutersAdded} new scouters, ${scouterResults.scoutersUpdated} updated scouters, ${scouterResults.predictionsAdded} predictions imported.`
      : '';
    
    const addedToSelectableMessage = addToSelectableList ? " Scouters added to selectable list." : "";
    const fullMessage = `Combined import complete! ${scoutingMessage}${scouterMessage}${addedToSelectableMessage}`;
    toast.success(fullMessage);
    
    // Notify other components that scouter data has been updated
    window.dispatchEvent(new CustomEvent('scouterDataUpdated'));
  };

  const handleAddScoutersToSelectable = async () => {
    if (pendingImportData) {
      await performCombinedImport(
        pendingImportData.scoutingData, 
        pendingImportData.scoutersToImport, 
        pendingImportData.predictionsToImport, 
        true
      );
      setShowScouterAddDialog(false);
      setPendingImportData(null);
      setPendingScouterNames([]);
    }
  };

  const handleImportWithoutAdding = async () => {
    if (pendingImportData) {
      await performCombinedImport(
        pendingImportData.scoutingData, 
        pendingImportData.scoutersToImport, 
        pendingImportData.predictionsToImport, 
        false
      );
      setShowScouterAddDialog(false);
      setPendingImportData(null);
      setPendingScouterNames([]);
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
    <>
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
      
      <ScouterAddConfirmDialog
        open={showScouterAddDialog}
        onOpenChange={setShowScouterAddDialog}
        pendingScouterNames={pendingScouterNames}
        onAddToSelectable={handleAddScoutersToSelectable}
        onImportOnly={handleImportWithoutAdding}
      />
    </>
  );
};

export default CombinedDataFountainScanner;
