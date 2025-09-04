import { loadPitScoutingData } from "@/lib/pitScoutingUtils";
import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface PitScoutingFountainGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const PitScoutingFountainGenerator = ({ onBack, onSwitchToScanner }: PitScoutingFountainGeneratorProps) => {
  const loadPitScoutingDataForFountain = async () => {
    const pitScoutingData = await loadPitScoutingData();
    
    if (pitScoutingData.entries.length > 0) {
      // Send the full data with entries
      return pitScoutingData;
    } else {
      console.log("No pit scouting data found");
      return null;
    }
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="pit-scouting"
      loadData={loadPitScoutingDataForFountain}
      title="Generate Pit Scouting Codes"
      description="Generate fountain codes from your pit scouting data. QR codes will automatically cycle for easy scanning."
      noDataMessage="No pit scouting data found in storage"
    />
  );
};

export default PitScoutingFountainGenerator;
