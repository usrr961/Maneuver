import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import GameStartSelectTeam from "@/components/GameStartComponents/GameStartSelectTeam";

/**
 * Renders a component representing the Game Start Page.
 *
 * To be used before the game starts, collecting information such as match number, scouter initials, and the team that is being scouted.
 *
 * @return {JSX.Element} The component representing the Game Start Page.
 */
const GameStartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const states = location.state;

  // Initialize the state with the passed in state from the previous page, or null if no state was passed in
  const [alliance, setAlliance] = useState(states?.inputs?.alliance || "");
  const [matchNumber, setMatchNumber] = useState(
    states?.inputs?.matchNumber || ""
  );
  const [selectTeam, setSelectTeam] = useState(states?.inputs?.selectTeam || "");

  // Get current scouter from localStorage
  const getCurrentScouter = () => {
    return (
      localStorage.getItem("currentScouter") ||
      localStorage.getItem("scouterInitials") ||
      ""
    );
  };

  const validateInputs = () => {
    const currentScouter = getCurrentScouter();
    const inputs = {
      matchNumber,
      alliance,
      selectTeam,
      scouterInitials: currentScouter,
    };
    const hasNull = Object.values(inputs).some((val) => !val || val === "");

    if (!currentScouter) {
      toast.error("Please select a scouter from the sidebar first");
      return false;
    }

    if (hasNull) {
      toast.error("Fill In All Fields To Proceed");
      return false;
    }
    return true;
  };

  const handleStartScouting = () => {
    if (!validateInputs()) return;

    const currentScouter = getCurrentScouter();

    // Save inputs to localStorage (similar to ProceedBackButton logic)
    localStorage.setItem("matchNumber", matchNumber);
    localStorage.setItem("selectTeam", selectTeam);
    localStorage.setItem("alliance", alliance);

    // Clear state stacks (from ProceedBackButton logic)
    localStorage.setItem("autoStateStack", JSON.stringify([]));
    localStorage.setItem("teleopStateStack", JSON.stringify([]));

    // Navigate to auto-start with inputs
    navigate("/auto-start", {
      state: {
        inputs: {
          matchNumber,
          alliance,
          scouterInitials: currentScouter,
          selectTeam,
        },
      },
    });
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const currentScouter = getCurrentScouter();

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-[var(--header-height)] pb-6">
      <div className="flex flex-col items-center gap-6 max-w-2xl w-full h-full min-h-0 pb-4">
        
        {/* Scouter Status */}
        {!currentScouter && (
          <Card className="w-full border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">⚠️</Badge>
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  Please select a scouter from the sidebar before starting
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Match Information</CardTitle>
            {currentScouter && (
              <p className="text-sm text-muted-foreground">
                Scouting as:{" "}
                <span className="font-medium">{currentScouter}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Match Number */}
            <div className="space-y-2">
              <Label htmlFor="match-number">Match Number</Label>
              <Input
                id="match-number"
                type="number"
                placeholder="Enter match number"
                value={matchNumber}
                onChange={(e) => setMatchNumber(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Alliance Selection with Buttons */}
            <div className="space-y-2">
              <Label>Alliance</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={alliance === "red" ? "default" : "outline"}
                  onClick={() => setAlliance("red")}
                  className={`h-12 text-lg font-semibold ${
                    alliance === "red" 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  }`}
                >
                  <Badge 
                    variant={alliance === "red" ? "secondary" : "destructive"} 
                    className="w-3 h-3 p-0 mr-2"
                  />
                  Red Alliance
                </Button>
                <Button
                  variant={alliance === "blue" ? "default" : "outline"}
                  onClick={() => setAlliance("blue")}
                  className={`h-12 text-lg font-semibold ${
                    alliance === "blue" 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  }`}
                >
                  <Badge 
                    variant={alliance === "blue" ? "secondary" : "default"} 
                    className={`w-3 h-3 p-0 mr-2 ${alliance === "blue" ? "bg-white" : "bg-blue-600"}`}
                  />
                  Blue Alliance
                </Button>
              </div>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
              <Label>Team Selection</Label>
              <GameStartSelectTeam
                defaultSelectTeam={selectTeam}
                setSelectTeam={setSelectTeam}
                selectedMatch={matchNumber}
                selectedAlliance={alliance}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex-1 h-12 text-lg"
          >
            Back
          </Button>
          <Button
            onClick={handleStartScouting}
            className="flex-2 h-12 text-lg font-semibold"
            disabled={!matchNumber || !alliance || !selectTeam || !currentScouter}
          >
            Start Scouting
          </Button>
        </div>

        {/* Status Indicator */}
        {matchNumber && alliance && selectTeam && currentScouter && (
          <Card className="w-full border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">Ready</Badge>
                <span className="text-sm text-green-700 dark:text-green-300">
                  Match {matchNumber} •{" "}
                  {alliance.charAt(0).toUpperCase() + alliance.slice(1)} Alliance
                  • Team {selectTeam} • {currentScouter}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom spacing for mobile */}
        <div className="h-6" />
      </div>
    </div>
  );
};

export default GameStartPage;
