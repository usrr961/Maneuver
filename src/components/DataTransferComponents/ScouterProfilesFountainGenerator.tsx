import { gameDB } from "@/lib/dexieDB";
import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface ScouterProfilesFountainGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const ScouterProfilesFountainGenerator = ({ onBack, onSwitchToScanner }: ScouterProfilesFountainGeneratorProps) => {
  const loadScouterProfilesData = async () => {
    try {
      
      // Get all scouters and predictions from the database
      const scoutersData = await gameDB.scouters.toArray();
      const predictionsData = await gameDB.predictions.toArray();
      
      
      if (scoutersData.length === 0 && predictionsData.length === 0) {
        return null;
      }
      
      // Combine both datasets
      const combinedData = {
        scouters: scoutersData,
        predictions: predictionsData,
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };
      
      console.log("Scouter profiles data prepared for fountain codes:", {
        scoutersCount: scoutersData.length,
        predictionsCount: predictionsData.length,
        totalDataSize: JSON.stringify(combinedData).length
      });
      
      return combinedData;
    } catch (error) {
      console.error("Error loading scouter profiles data:", error);
      return null;
    }
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="scouter"
      loadData={loadScouterProfilesData}
      title="Generate Scouter Profiles Fountain Codes"
      description="Create multiple QR codes for reliable scouter profiles transfer"
      noDataMessage="No scouter profiles data found. Create scouter profiles and make predictions first."
    />
  );
};

export default ScouterProfilesFountainGenerator;
