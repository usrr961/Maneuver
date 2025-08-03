import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { transformToObjectFormat } from "@/lib/dataTransformation";
import { generateEntryId } from "@/lib/scoutingDataUtils";
import { saveScoutingEntry } from "@/lib/indexedDBUtils";
import type { ScoutingDataWithId } from "@/lib/scoutingDataUtils";

const EndgamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const states = location.state;

  // Endgame states
  const [shallowClimbAttempted, setShallowClimbAttempted] = useState(false);
  const [deepClimbAttempted, setDeepClimbAttempted] = useState(false);
  const [parkAttempted, setParkAttempted] = useState(false);
  const [climbFailed, setClimbFailed] = useState(false);
  const [brokeDown, setBrokeDown] = useState(false);
  const [comment, setComment] = useState("");

  // Get saved actions from localStorage
  const getActionsFromLocalStorage = (phase: string) => {
    const saved = localStorage.getItem(`${phase}StateStack`);
    return saved ? JSON.parse(saved) : [];
  };

  const handleSubmit = async () => {
    try {
      // Get all the collected data
      const autoActions = getActionsFromLocalStorage("auto");
      const teleopActions = getActionsFromLocalStorage("teleop");
      
      // Prepare the input data
      const scoutingInputs = {
        matchNumber: states?.inputs?.matchNumber || "",
        alliance: states?.inputs?.alliance || "",
        scouterInitials: states?.inputs?.scouterInitials || "",
        selectTeam: states?.inputs?.selectTeam || "",
        startPoses: states?.inputs?.startPoses || [false, false, false, false, false, false],
        autoActions: autoActions,
        teleopActions: teleopActions,
        autoPassedStartLine: states?.inputs?.autoPassedStartLine || false,
        teleopPlayedDefense: states?.inputs?.teleopPlayedDefense || false,
        shallowClimbAttempted,
        deepClimbAttempted,
        parkAttempted,
        climbFailed,
        brokeDown,
        comment
      };

      // Transform to object format for the new system
      const objectData = transformToObjectFormat(scoutingInputs);

      // Generate unique ID for this entry
      const uniqueId = generateEntryId(objectData);
      
      // Create entry with ID structure
      const entryWithId: ScoutingDataWithId = {
        id: uniqueId,
        data: objectData,
        timestamp: Date.now()
      };

      // Save to IndexedDB
      await saveScoutingEntry(entryWithId);

      // Clear the state stacks
      localStorage.removeItem("autoStateStack");
      localStorage.removeItem("teleopStateStack");

      // Increment match number for next scouting session
      const currentMatchNumber = localStorage.getItem("currentMatchNumber") || "1";
      const nextMatchNumber = (parseInt(currentMatchNumber) + 1).toString();
      localStorage.setItem("currentMatchNumber", nextMatchNumber);

      toast.success("Match data saved successfully!");
      navigate("/game-start");
      
    } catch (error) {
      console.error("Error saving match data:", error);
      toast.error("Error saving match data");
    }
  };

  const handleBack = () => {
    navigate("/teleop-scoring", {
      state: {
        inputs: {
          ...states?.inputs,
          endgameData: {
            shallowClimbAttempted,
            deepClimbAttempted,
            parkAttempted,
            climbFailed,
            brokeDown,
            comment
          }
        }
      }
    });
  };

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col items-center gap-6 max-w-2xl w-full h-full min-h-0 pb-4">
        {/* Match Info */}
        {states?.inputs && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Match Summary</CardTitle>
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
            </CardContent>
          </Card>
        )}

        {/* Climbing Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Climbing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={shallowClimbAttempted ? "default" : "outline"}
                onClick={() => {
                  setShallowClimbAttempted(!shallowClimbAttempted);
                  if (!shallowClimbAttempted) {
                    setDeepClimbAttempted(false);
                    setParkAttempted(false);
                  }
                }}
                className={`h-12 ${shallowClimbAttempted ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              >
                {shallowClimbAttempted ? "✓ " : ""}Shallow Climb Attempted
              </Button>
              
              <Button
                variant={deepClimbAttempted ? "default" : "outline"}
                onClick={() => {
                  setDeepClimbAttempted(!deepClimbAttempted);
                  if (!deepClimbAttempted) {
                    setShallowClimbAttempted(false);
                    setParkAttempted(false);
                  }
                }}
                className={`h-12 ${deepClimbAttempted ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                {deepClimbAttempted ? "✓ " : ""}Deep Climb Attempted
              </Button>
              
              <Button
                variant={parkAttempted ? "default" : "outline"}
                onClick={() => {
                  setParkAttempted(!parkAttempted);
                  if (!parkAttempted) {
                    setShallowClimbAttempted(false);
                    setDeepClimbAttempted(false);
                  }
                }}
                className={`h-12 ${parkAttempted ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}`}
              >
                {parkAttempted ? "✓ " : ""}Park Attempted
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={climbFailed ? "destructive" : "outline"}
                onClick={() => setClimbFailed(!climbFailed)}
                className="h-12"
              >
                {climbFailed ? "✓ " : ""}Climb Failed
              </Button>
              
              <Button
                variant={brokeDown ? "destructive" : "outline"}
                onClick={() => setBrokeDown(!brokeDown)}
                className="h-12"
              >
                {brokeDown ? "✓ " : ""}Broke Down
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="w-full flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="comment">Additional Notes</Label>
              <Textarea
                id="comment"
                placeholder="Enter any additional observations or notes about the match..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-12 text-lg"
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-2 h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            Submit Match Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EndgamePage;