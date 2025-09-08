import { loadPitScoutingData } from "@/lib/pitScoutingUtils";
import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface PitScoutingImagesFountainGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

interface PitScoutingImageEntry {
  teamNumber: string;
  eventName: string;
  scouterInitials: string;
  robotPhoto: string;
  timestamp: number;
}

const PitScoutingImagesFountainGenerator = ({ onBack, onSwitchToScanner }: PitScoutingImagesFountainGeneratorProps) => {
  const loadPitScoutingImagesForFountain = async () => {
    const pitScoutingData = await loadPitScoutingData();
    
    // Filter entries that have robot photos
    const entriesWithImages = pitScoutingData.entries.filter(entry => entry.robotPhoto);
    
    if (entriesWithImages.length > 0) {
      // Create simplified image-only entries
      const imageEntries: PitScoutingImageEntry[] = entriesWithImages.map(entry => ({
        teamNumber: entry.teamNumber,
        eventName: entry.eventName,
        scouterInitials: entry.scouterInitials,
        robotPhoto: entry.robotPhoto!,
        timestamp: entry.timestamp
      }));
      
      return {
        type: 'pit-images',
        entries: imageEntries,
        lastUpdated: pitScoutingData.lastUpdated
      };
    } else {
      console.log("No pit scouting images found");
      return null;
    }
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="pit-images"
      loadData={loadPitScoutingImagesForFountain}
      title="Generate Pit Images Codes"
      description="Generate fountain codes for robot photos only. Use this to transfer images after text data has been shared via QR codes."
      noDataMessage="No robot photos found in pit scouting data"
    />
  );
};

export default PitScoutingImagesFountainGenerator;
