import { loadScoutingData, extractLegacyData } from "@/lib/scoutingDataUtils";
import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface FountainCodeGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const FountainCodeGenerator = ({ onBack, onSwitchToScanner }: FountainCodeGeneratorProps) => {
  const loadScoutingDataForFountain = () => {
    const scoutingDataWithIds = loadScoutingData();
    
    if (scoutingDataWithIds.entries.length > 0) {
      // Convert to legacy format for fountain codes (scanner expects { data: [...] })
      const legacyDataArrays = extractLegacyData(scoutingDataWithIds.entries);
      const formattedData = { data: legacyDataArrays };
      
      console.log("Loaded scouting data for fountain codes:", {
        totalEntries: scoutingDataWithIds.entries.length,
        sampleEntry: legacyDataArrays[0]?.slice(0, 5), // Show first 5 fields
      });
      
      return formattedData;
    } else {
      console.log("No scouting data found");
      return null;
    }
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="scouting"
      loadData={loadScoutingDataForFountain}
      title="Generate Fountain Codes"
      description="Generate Luby Transform fountain codes from your scouting data. QR codes will automatically cycle for easy scanning."
      noDataMessage="No scouting data found in storage"
    />
  );
};

export default FountainCodeGenerator;