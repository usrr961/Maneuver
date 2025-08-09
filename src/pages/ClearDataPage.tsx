import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { loadScoutingData } from "@/lib/scoutingDataUtils";
import { clearAllScoutingData } from "@/lib/dexieDB";
import { clearAllPitScoutingData, getPitScoutingStats } from "@/lib/pitScoutingUtils";
import { convertTeamRole } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";


const ClearDataPage = () => {
  const [scoutingDataCount, setScoutingDataCount] = useState(0);
  const [pitScoutingDataCount, setPitScoutingDataCount] = useState(0);
  const [matchDataCount, setMatchDataCount] = useState(0);
  const [playerStation, setPlayerStation] = useState("");
  const [scoutingDataSize, setScoutingDataSize] = useState("0 B");
  const [showScoutingConfirm, setShowScoutingConfirm] = useState(false);
  const [showPitScoutingConfirm, setShowPitScoutingConfirm] = useState(false);
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);

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
    } catch (error) {
      console.error("Error loading pit scouting data:", error);
      setPitScoutingDataCount(0);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadScoutingCount();
    await loadPitScoutingCount();
  }, [loadScoutingCount, loadPitScoutingCount]);

  useEffect(() => {
    const matchData = localStorage.getItem("matchData");
    const station = localStorage.getItem("playerStation") || "Unknown";

    setPlayerStation(station);
    
    loadScoutingCount();
    loadPitScoutingCount();

    if (matchData) {
      try {
        const parsed = JSON.parse(matchData);
        setMatchDataCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setMatchDataCount(0);
      }
    }
  }, [loadScoutingCount, loadPitScoutingCount]);

  const handleClearScoutingData = async () => {
    try {
      console.log("ClearDataPage - Starting data clear...");
      await clearAllScoutingData();
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      
      await refreshData();
      setShowScoutingConfirm(false);
      toast.success("Cleared all scouting data");
      console.log("ClearDataPage - Data cleared successfully");
    } catch (error) {
      console.error("Error clearing scouting data:", error);
      // Clear localStorage as fallback and refresh
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      await refreshData();
      setShowScoutingConfirm(false);
      toast.success("Cleared all scouting data");
    }
  };

  const handleClearPitScoutingData = async () => {
    try {
      console.log("ClearDataPage - Starting pit scouting data clear...");
      await clearAllPitScoutingData();
      
      await refreshData();
      setShowPitScoutingConfirm(false);
      toast.success("Cleared all pit scouting data");
      console.log("ClearDataPage - Pit scouting data cleared successfully");
    } catch (error) {
      console.error("Error clearing pit scouting data:", error);
      toast.error("Failed to clear pit scouting data");
      setShowPitScoutingConfirm(false);
    }
  };

  const handleClearMatchData = () => {
    localStorage.setItem("matchData", "");
    setMatchDataCount(0);
    setShowMatchConfirm(false);
    toast.success("Cleared match schedule data");
  };

  const formatDataSize = (data: BlobPart | null) => {
    if (!data) return "0 B";
    const bytes = new Blob([data]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMatchDataSize = () => {
    const data = localStorage.getItem("matchData");
    return formatDataSize(data);
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
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Scouting Data</CardTitle>
              <Badge variant={scoutingDataCount > 0 ? "default" : "secondary"}>
                {scoutingDataCount} entries
              </Badge>
            </div>
            <CardDescription>
              Match scouting data collected on this device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Storage size:</span> {scoutingDataSize}
            </p>

            {!showScoutingConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowScoutingConfirm(true)}
                disabled={scoutingDataCount === 0}
              >
                {scoutingDataCount === 0 ? "No Scouting Data" : "Clear Scouting Data"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-5 w-5" color="red"/>
                  <AlertDescription className="text-white">
                    This will permanently delete {scoutingDataCount} scouting entries.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleClearScoutingData}
                  >
                    Yes, Delete All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowScoutingConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pit Scouting Data Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pit Scouting Data</CardTitle>
              <Badge variant={pitScoutingDataCount > 0 ? "default" : "secondary"}>
                {pitScoutingDataCount} entries
              </Badge>
            </div>
            <CardDescription>
              Robot pit scouting data collected at events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showPitScoutingConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowPitScoutingConfirm(true)}
                disabled={pitScoutingDataCount === 0}
              >
                {pitScoutingDataCount === 0 ? "No Pit Scouting Data" : "Clear Pit Scouting Data"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-5 w-5" color="red"/>
                  <AlertDescription className="text-white">
                    This will permanently delete {pitScoutingDataCount} pit scouting entries.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleClearPitScoutingData}
                  >
                    Yes, Delete All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowPitScoutingConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Data Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Match Schedule Data</CardTitle>
              <Badge variant={matchDataCount > 0 ? "default" : "secondary"}>
                {matchDataCount} matches
              </Badge>
            </div>
            <CardDescription>
              Tournament match schedule and team information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Storage size:</span> {getMatchDataSize()}
            </p>

            {!showMatchConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowMatchConfirm(true)}
                disabled={matchDataCount === 0}
              >
                {matchDataCount === 0 ? "No Match Data" : "Clear Match Data"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-5 w-5" color="red"/>
                  <AlertDescription className="text-white">
                    This will delete the match schedule for {matchDataCount} matches.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleClearMatchData}
                  >
                    Yes, Delete All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowMatchConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClearDataPage;
