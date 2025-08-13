import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { loadScoutingData } from "@/lib/scoutingDataUtils";
import { clearAllScoutingData, clearGameData, gameDB, pitDB } from "@/lib/dexieDB";
import { clearAllPitScoutingData, getPitScoutingStats } from "@/lib/pitScoutingUtils";
import { convertTeamRole } from "@/lib/utils";
import { DataClearCard } from "@/components/DataTransferComponents/DataClearCard";


const ClearDataPage = () => {
  const [scoutingDataCount, setScoutingDataCount] = useState(0);
  const [pitScoutingDataCount, setPitScoutingDataCount] = useState(0);
  const [matchDataCount, setMatchDataCount] = useState(0);
  const [scouterGameDataCount, setScouterGameDataCount] = useState(0);
  const [playerStation, setPlayerStation] = useState("");
  const [scoutingDataSize, setScoutingDataSize] = useState("0 B");
  const [pitScoutingDataSize, setPitScoutingDataSize] = useState("0 B");
  const [matchDataSize, setMatchDataSize] = useState("0 B");
  const [scouterGameDataSize, setScouterGameDataSize] = useState("0 B");

  const loadScoutingCount = useCallback(async () => {
    try {
      console.log("ClearDataPage - Loading scouting data count...");
      const scoutingData = await loadScoutingData();
      console.log("ClearDataPage - Loaded scouting data:", scoutingData.entries.length, "entries");
      setScoutingDataCount(scoutingData.entries.length);
      
      const dataString = JSON.stringify(scoutingData.entries);
      const size = formatDataSize(dataString);
      console.log("ClearDataPage - Data size:", size);
      setScoutingDataSize(size);
    } catch (error) {
      console.error("Error loading scouting data:", error);
      setScoutingDataCount(0);
      setScoutingDataSize("0 B");
    }
  }, []);

  const loadPitScoutingCount = useCallback(async () => {
    try {
      const pitStats = await getPitScoutingStats();
      setPitScoutingDataCount(pitStats.totalEntries);
      
      // Calculate pit scouting data size from IndexedDB
      const pitData = await pitDB.pitScoutingData.toArray();
      const pitSize = formatDataSize(JSON.stringify(pitData));
      setPitScoutingDataSize(pitSize);
    } catch (error) {
      console.error("Error loading pit scouting data:", error);
      setPitScoutingDataCount(0);
      setPitScoutingDataSize("0 B");
    }
  }, []);

  const loadScouterGameCount = useCallback(async () => {
    try {
      console.log("ClearDataPage - Loading scouter game data count...");
      
      // Get counts directly from the database tables
      const scoutersCount = await gameDB.scouters.count();
      const predictionsCount = await gameDB.predictions.count();
      
      console.log("ClearDataPage - Scouters:", scoutersCount, "Predictions:", predictionsCount);
      
      // Count total entries: scouters + predictions
      const totalEntries = scoutersCount + predictionsCount;
      setScouterGameDataCount(totalEntries);
      
      // Calculate storage size by getting all data
      const scoutersData = await gameDB.scouters.toArray();
      const predictionsData = await gameDB.predictions.toArray();
      const combinedData = { scouters: scoutersData, predictions: predictionsData };
      const gameDataSize = formatDataSize(JSON.stringify(combinedData));
      setScouterGameDataSize(gameDataSize);
      
      console.log("ClearDataPage - Total scouter game entries:", totalEntries, "Size:", gameDataSize);
    } catch (error) {
      console.error("Error loading scouter game data:", error);
      setScouterGameDataCount(0);
      setScouterGameDataSize("0 B");
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadScoutingCount();
    await loadPitScoutingCount();
    await loadScouterGameCount();
  }, [loadScoutingCount, loadPitScoutingCount, loadScouterGameCount]);

  useEffect(() => {
    const matchData = localStorage.getItem("matchData");
    const station = localStorage.getItem("playerStation") || "Unknown";

    setPlayerStation(station);
    
    loadScoutingCount();
    loadPitScoutingCount();
    loadScouterGameCount();

    if (matchData) {
      try {
        const parsed = JSON.parse(matchData);
        const count = Array.isArray(parsed) ? parsed.length : 0;
        setMatchDataCount(count);
        setMatchDataSize(formatDataSize(matchData));
      } catch {
        setMatchDataCount(0);
        setMatchDataSize("0 B");
      }
    } else {
      setMatchDataCount(0);
      setMatchDataSize("0 B");
    }
  }, [loadScoutingCount, loadPitScoutingCount, loadScouterGameCount]);

  const handleClearScoutingData = async () => {
    try {
      console.log("ClearDataPage - Starting data clear...");
      await clearAllScoutingData();
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      
      await refreshData();
      toast.success("Cleared all scouting data");
      console.log("ClearDataPage - Data cleared successfully");
    } catch (error) {
      console.error("Error clearing scouting data:", error);
      // Clear localStorage as fallback and refresh
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      await refreshData();
      toast.success("Cleared all scouting data");
    }
  };

  const handleClearPitScoutingData = async () => {
    try {
      console.log("ClearDataPage - Starting pit scouting data clear...");
      await clearAllPitScoutingData();
      
      await refreshData();
      toast.success("Cleared all pit scouting data");
      console.log("ClearDataPage - Pit scouting data cleared successfully");
    } catch (error) {
      console.error("Error clearing pit scouting data:", error);
      toast.error("Failed to clear pit scouting data");
    }
  };

  const handleClearScouterGameData = async () => {
    try {
      console.log("ClearDataPage - Starting scouter game data clear...");
      await clearGameData();
      
      // Clear all scouter-related localStorage data
      localStorage.removeItem("scoutersList");
      localStorage.removeItem("currentScouter");
      localStorage.removeItem("scouterInitials");
      console.log("ClearDataPage - Cleared all scouter data from localStorage");
      
      await refreshData();
      toast.success("Cleared all scouter game data");
      console.log("ClearDataPage - Scouter game data cleared successfully");
      
      // Force page refresh to ensure nav-user component reloads
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Give toast time to show
    } catch (error) {
      console.error("Error clearing scouter game data:", error);
      toast.error("Failed to clear scouter game data");
    }
  };

  const handleClearMatchData = () => {
    localStorage.setItem("matchData", "");
    setMatchDataCount(0);
    setMatchDataSize("0 B");
    toast.success("Cleared match schedule data");
  };

  const formatDataSize = (data: BlobPart | null) => {
    if (!data) return "0 B";
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col items-start gap-4 max-w-md w-full">
        <h1 className="text-2xl font-bold">Clear Data</h1>
        <p className="text-muted-foreground">
          Permanently delete stored data from this device. This action cannot be undone.
        </p>

        {/* Device Info Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="font-medium">Player Station:</span> {convertTeamRole(playerStation)}</p>
            <p className="text-sm"><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Alert>
          <AlertTitle>💡 Backup Recommendation</AlertTitle>
          <AlertDescription>
            Consider downloading your data before clearing it. Use the JSON Transfer page to export your data.
          </AlertDescription>
        </Alert>

        {/* Scouting Data Card */}
        <DataClearCard
          title="Scouting Data"
          description="Match scouting data collected on this device"
          entryCount={scoutingDataCount}
          entryLabel="entries"
          storageSize={scoutingDataSize}
          onClear={handleClearScoutingData}
        />

        {/* Pit Scouting Data Card */}
        <DataClearCard
          title="Pit Scouting Data"
          description="Robot pit scouting data collected at events"
          entryCount={pitScoutingDataCount}
          entryLabel="entries"
          storageSize={pitScoutingDataSize}
          onClear={handleClearPitScoutingData}
        />

        {/* Scouter Profile Data Card */}
        <DataClearCard
          title="Scouter Profile Data"
          description="Scouter predictions, stakes, and leaderboard data"
          entryCount={scouterGameDataCount}
          entryLabel="entries"
          storageSize={scouterGameDataSize}
          onClear={handleClearScouterGameData}
          warningMessage={`This will permanently delete ${scouterGameDataCount} scouter game entries (scouters and predictions).`}
        />

        {/* Match Data Card */}
        <DataClearCard
          title="Match Schedule Data"
          description="Tournament match schedule and team information"
          entryCount={matchDataCount}
          entryLabel="matches"
          storageSize={matchDataSize}
          onClear={handleClearMatchData}
        />
      </div>
    </div>
  );
};

export default ClearDataPage;
