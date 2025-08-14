import { gameDB } from "@/lib/dexieDB";
import { loadScoutingData } from "@/lib/scoutingDataUtils";
import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface CombinedDataFountainGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const CombinedDataFountainGenerator = ({ onBack, onSwitchToScanner }: CombinedDataFountainGeneratorProps) => {
  const loadCombinedData = async () => {
    try {
      
      // Load scouting data
      const scoutingDataWithIds = await loadScoutingData();
      
      // Load scouter profiles data
      const scoutersData = await gameDB.scouters.toArray();
      const predictionsData = await gameDB.predictions.toArray();
      
      
      // Check if we have any meaningful data
      const hasScoutingData = scoutingDataWithIds.entries.length > 0;
      const hasScouterData = scoutersData.length > 0 || predictionsData.length > 0;
      
      if (!hasScoutingData && !hasScouterData) {
        return null;
      }
      
      // Combine all data into a single structure
      const combinedData = {
        type: "combined_export",
        scoutingData: {
          entries: scoutingDataWithIds.entries
        },
        scouterProfiles: {
          scouters: scoutersData,
          predictions: predictionsData
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          scoutingEntriesCount: scoutingDataWithIds.entries.length,
          scoutersCount: scoutersData.length,
          predictionsCount: predictionsData.length
        }
      };
      
      return combinedData;
    } catch (error) {
      console.error("Error loading combined data:", error);
      return null;
    }
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="combined"
      loadData={loadCombinedData}
      title="Generate Combined Data Fountain Codes"
      description="Create multiple QR codes containing both scouting data and scouter profiles for complete data transfer"
      noDataMessage="No scouting data or scouter profiles found. Create some data first before exporting."
    />
  );
};

export default CombinedDataFountainGenerator;
