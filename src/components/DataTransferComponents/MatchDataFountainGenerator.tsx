import UniversalFountainGenerator from "./UniversalFountainGenerator";

interface MatchDataFountainGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const MatchDataFountainGenerator = ({ onBack, onSwitchToScanner }: MatchDataFountainGeneratorProps) => {
  const loadMatchData = () => {
    // Load from localStorage with multiple possible keys
    const localStorageKeys = ['matchData', 'tbaMatchData', 'scoutingApp_matchData'];
    let matchData = null;
    
    for (const key of localStorageKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          matchData = JSON.parse(stored);
          break;
        } catch (e) {
          console.warn(`Failed to parse ${key}:`, e);
        }
      }
    }
    
    if (!matchData) {
      matchData = { message: "No match data found in localStorage" };
    }
    
    return matchData;
  };

  return (
    <UniversalFountainGenerator
      onBack={onBack}
      onSwitchToScanner={onSwitchToScanner}
      dataType="match"
      loadData={loadMatchData}
      title="Generate Match Data Fountain Codes"
      description="Create multiple QR codes for reliable match data transfer"
      noDataMessage="No match data found in localStorage"
    />
  );
};

export default MatchDataFountainGenerator;
