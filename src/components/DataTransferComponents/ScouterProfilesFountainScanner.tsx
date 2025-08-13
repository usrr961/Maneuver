import { gameDB, type Scouter, type MatchPrediction } from "@/lib/dexieDB";
import UniversalFountainScanner from "./UniversalFountainScanner";
import { toast } from "sonner";

interface ScouterProfilesFountainScannerProps {
  onBack: () => void;
  onSwitchToGenerator: () => void;
}

interface ScouterProfilesData {
  scouters: Scouter[];
  predictions: MatchPrediction[];
  exportedAt: string;
  version: string;
}

const ScouterProfilesFountainScanner = ({ onBack, onSwitchToGenerator }: ScouterProfilesFountainScannerProps) => {
  const saveScouterProfilesData = async (data: unknown) => {
    console.log('Saving scouter profiles data from fountain:', data);
    
    try {
      // Validate the received data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid scouter profiles data format');
      }
      
      const profilesData = data as ScouterProfilesData;
      
      if (!profilesData.scouters || !Array.isArray(profilesData.scouters)) {
        throw new Error('No scouters array found in data');
      }
      
      if (!profilesData.predictions || !Array.isArray(profilesData.predictions)) {
        throw new Error('No predictions array found in data');
      }
      
      const scoutersToImport: Scouter[] = profilesData.scouters;
      const predictionsToImport: MatchPrediction[] = profilesData.predictions;
      
      console.log(`Importing ${scoutersToImport.length} scouters and ${predictionsToImport.length} predictions`);
      
      // Get existing data to merge intelligently
      const existingScouters = await gameDB.scouters.toArray();
      const existingPredictions = await gameDB.predictions.toArray();
      
      let scoutersAdded = 0;
      let scoutersUpdated = 0;
      let predictionsAdded = 0;
      let predictionsSkipped = 0;
      
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
            scoutersUpdated++;
          }
        } else {
          // Add new scouter
          await gameDB.scouters.add(scouter);
          scoutersAdded++;
        }
      }
      
      // Process predictions - avoid duplicates based on unique constraint
      for (const prediction of predictionsToImport) {
        const exists = existingPredictions.some(p => p.id === prediction.id);
        
        if (!exists) {
          try {
            await gameDB.predictions.add(prediction);
            predictionsAdded++;
          } catch {
            // Probably a duplicate ID constraint, skip it
            console.warn(`Skipping duplicate prediction: ${prediction.id}`);
            predictionsSkipped++;
          }
        } else {
          predictionsSkipped++;
        }
      }
      
      // Update localStorage scouter list to include any new scouters
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
      
      console.log('Scouter profiles import complete:', {
        scoutersAdded,
        scoutersUpdated,
        predictionsAdded,
        predictionsSkipped
      });
      
      // Show summary to user
      const message = `Import complete! Added ${scoutersAdded} new scouters, updated ${scoutersUpdated} existing scouters, and imported ${predictionsAdded} predictions.`;
      toast.success(message);
      
    } catch (error) {
      console.error('Error importing scouter profiles data:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const validateScouterProfilesData = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    const profilesData = data as ScouterProfilesData;
    
    // Check for required structure
    if (!profilesData.scouters || !Array.isArray(profilesData.scouters)) return false;
    if (!profilesData.predictions || !Array.isArray(profilesData.predictions)) return false;
    
    // Validate at least one scouter has required fields
    if (profilesData.scouters.length > 0) {
      const firstScouter = profilesData.scouters[0];
      const requiredFields = ['name', 'stakes', 'totalPredictions', 'correctPredictions'];
      if (!requiredFields.every(field => field in firstScouter)) return false;
    }
    
    return true;
  };

  const getScouterProfilesDataSummary = (data: unknown): string => {
    if (!data || typeof data !== 'object') return '0 profiles';
    
    const profilesData = data as ScouterProfilesData;
    
    const scoutersCount = profilesData.scouters?.length || 0;
    const predictionsCount = profilesData.predictions?.length || 0;
    
    return `${scoutersCount} scouters, ${predictionsCount} predictions`;
  };

  return (
    <UniversalFountainScanner
      onBack={onBack}
      onSwitchToGenerator={onSwitchToGenerator}
      dataType="scouter"
      expectedPacketType="scouter_fountain_packet"
      saveData={saveScouterProfilesData}
      validateData={validateScouterProfilesData}
      getDataSummary={getScouterProfilesDataSummary}
      title="Scan Scouter Profiles Fountain Codes"
      description="Point your camera at the QR codes to receive scouter profiles data"
      completionMessage="Scouter profiles data has been successfully reconstructed and imported"
    />
  );
};

export default ScouterProfilesFountainScanner;
