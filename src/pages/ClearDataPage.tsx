import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const ClearDataPage = () => {
  const [scoutingDataCount, setScoutingDataCount] = useState(0);
  const [matchDataCount, setMatchDataCount] = useState(0);
  const [playerStation, setPlayerStation] = useState("");
  const [showScoutingConfirm, setShowScoutingConfirm] = useState(false);
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);

  useEffect(() => {
    // Load data counts and info
    const scoutingData = localStorage.getItem("scoutingData");
    const matchData = localStorage.getItem("matchData");
    const station = localStorage.getItem("playerStation") || "Unknown";

    setPlayerStation(station);

    // Count scouting entries
    if (scoutingData) {
      try {
        const parsed = JSON.parse(scoutingData);
        setScoutingDataCount(parsed.data ? parsed.data.length : 0);
      } catch {
        setScoutingDataCount(0);
      }
    }

    // Count match entries
    if (matchData) {
      try {
        const parsed = JSON.parse(matchData);
        setMatchDataCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setMatchDataCount(0);
      }
    }
  }, []);

  const handleClearScoutingData = () => {
    localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
    setScoutingDataCount(0);
    setShowScoutingConfirm(false);
    toast.success("Cleared all scouting data");
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

  const getScoutingDataSize = () => {
    const data = localStorage.getItem("scoutingData");
    return formatDataSize(data);
  };

  const getMatchDataSize = () => {
    const data = localStorage.getItem("matchData");
    return formatDataSize(data);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-[var(--header-height)] pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full overflow-y-auto">

        <p className="text-center text-muted-foreground">
          Permanently delete stored data from this device. This action cannot be undone.
        </p>

        {/* Device Info Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="font-medium">Player Station:</span> {playerStation}</p>
            <p className="text-sm"><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>

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
              <span className="font-medium">Storage size:</span> {getScoutingDataSize()}
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
                <Alert variant="destructive">
                  <AlertTitle>⚠️ Confirm Deletion</AlertTitle>
                  <AlertDescription>
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
                <Alert variant="destructive">
                  <AlertTitle>⚠️ Confirm Deletion</AlertTitle>
                  <AlertDescription>
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

        {/* Warning Footer */}
        <Alert>
          <AlertTitle>💡 Backup Recommendation</AlertTitle>
          <AlertDescription>
            Consider downloading your data before clearing it. Use the JSON Transfer page to export your data.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ClearDataPage;
