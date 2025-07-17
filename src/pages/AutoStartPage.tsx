import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AutoStartMap from "@/components/AutoComponents/AutoStartMap";

/**
 * Renders a component representing the Auto Start page.
 *
 * To be used before the auto starts, collecting information such as if the robot showed up and where the robot started.
 *
 * @return {JSX.Element} The component representing the Auto Start page.
 */
const AutoStartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const states = location.state;

  // Initialize the state with the passed in state from the previous page, or null if no state was passed in
  const [startPos1, setStartPos1] = useState(
    states?.inputs?.startPoses?.[0] || null
  );
  const [startPos2, setStartPos2] = useState(
    states?.inputs?.startPoses?.[1] || null
  );
  const [startPos3, setStartPos3] = useState(
    states?.inputs?.startPoses?.[2] || null
  );
  const [startPos4, setStartPos4] = useState(
    states?.inputs?.startPoses?.[3] || null
  );
  const [startPos5, setStartPos5] = useState(
    states?.inputs?.startPoses?.[4] || null
  );
  const [startPos6, setStartPos6] = useState(
    states?.inputs?.startPoses?.[5] || null
  );

  const startPoses = [
    startPos1,
    startPos2,
    startPos3,
    startPos4,
    startPos5,
    startPos6,
  ];
  const setStartPoses = [
    setStartPos1,
    setStartPos2,
    setStartPos3,
    setStartPos4,
    setStartPos5,
    setStartPos6,
  ];

  const validateInputs = () => {
    const hasSelection = startPoses.some(pos => pos === true);
    if (!hasSelection) {
      toast.error("Please select a starting position on the field");
      return false;
    }
    return true;
  };

  const handleBack = () => {
    navigate("/game-start", {
      state: {
        inputs: {
          ...(states?.inputs || {}),
          startPoses: startPoses.every((pos) => pos === false)
            ? [null, null, null, null, null, null]
            : startPoses,
        },
      },
    });
  };

  const handleProceed = () => {
    if (!validateInputs()) return;

    navigate("/auto-scoring", {
      state: {
        inputs: {
          ...(states?.inputs || {}),
          startPoses: startPoses.every((pos) => pos === false)
            ? [null, null, null, null, null, null]
            : startPoses,
        },
      },
    });
  };

  // Get selected position for display
  const selectedPosition = startPoses.findIndex(pos => pos === true);
  const hasSelection = startPoses.some(pos => pos === true);

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col lg:flex-row items-start gap-6 max-w-7xl w-full h-full min-h-0">
        
        {/* Field Map Section */}
        <div className="w-full lg:flex-1 h-96 lg:h-full min-h-96">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle className="text-xl">Starting Position</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click where your robot starts on the field
              </p>
              {hasSelection && (
                <Badge className="w-fit bg-green-600">
                  Position {selectedPosition} Selected
                </Badge>
              )}
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)] p-4 pb-6">
              <div className="w-full h-full border rounded-lg overflow-hidden bg-green-50 dark:bg-green-950/20">
                <AutoStartMap 
                  startPoses={startPoses} 
                  setStartPoses={setStartPoses} 
                  alliance={states?.inputs?.alliance}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions and Controls */}
        <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-80 lg:h-full pb-4 lg:pb-0">
          
          {/* Match Info Card */}
          {states?.inputs && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match:</span>
                  <span className="font-medium">{states.inputs.matchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alliance:</span>
                  <Badge 
                    variant={states.inputs.alliance === "red" ? "destructive" : "default"}
                    className={states.inputs.alliance === "blue" ? "bg-blue-600" : ""}
                  >
                    {states.inputs.alliance?.charAt(0).toUpperCase() + states.inputs.alliance?.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{states.inputs.selectTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scouter:</span>
                  <span className="font-medium">{states.inputs.scouterInitials}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions Card - Hidden on mobile to save space */}
          <Card className="hidden lg:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Click on the starting zone where your robot begins</li>
                <li>• Only one position can be selected at a time</li>
                <li>• The selected position will be highlighted</li>
                <li>• You can change your selection by clicking a different zone</li>
              </ul>
            </CardContent>
          </Card>

          {/* Status Card */}
          {hasSelection ? (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Ready</Badge>
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Starting position {selectedPosition} selected
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex justify-center items-center">⚠️</Badge>
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Please select a starting position
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 w-full lg:mt-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-2 h-12 text-lg font-semibold"
              disabled={!hasSelection}
            >
              Continue to Auto
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutoStartPage;