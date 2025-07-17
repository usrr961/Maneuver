/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type Key } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReefScoringSection from "@/components/ScoringComponents/ReefScoringSection";
import AlgaeSection from "@/components/ScoringComponents/AlgaeSection";

interface ScoringPageProps {
  phase: "auto" | "teleop";
}

/**
 * Unified scoring page for both autonomous and teleoperated phases.
 * Handles scoring actions, piece tracking, and navigation between phases.
 */
const ScoringPage = ({ phase }: ScoringPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const states = location.state;

  // Get saved state from localStorage
  const getSavedState = () => {
    const stateKey = `${phase}StateStack`;
    const saved = localStorage.getItem(stateKey);
    return saved ? JSON.parse(saved) : [];
  };

  // Initialize scoring state
  const [scoringActions, setScoringActions] = useState(getSavedState());
  const [currentCoral, setCurrentCoral] = useState(0); // 0 or 1 coral
  const [currentAlgae, setCurrentAlgae] = useState(0); // 0 or 1 algae
  const [showFlashing, setShowFlashing] = useState(false);
  
  // Toggle states for true/false actions
  const [passedStartLine, setPassedStartLine] = useState(false);
  const [playedDefense, setPlayedDefense] = useState(false);

  // Auto phase timing for button flashing (15 seconds)
  useEffect(() => {
    if (phase === "auto") {
      const timer = setTimeout(() => {
        setShowFlashing(true);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateKey = `${phase}StateStack`;
    localStorage.setItem(stateKey, JSON.stringify(scoringActions));
  }, [scoringActions, phase]);

  // Initialize piece counts from saved data
  useEffect(() => {
    // Calculate current pieces from saved actions
    let coralCount = 0;
    let algaeCount = 0;
    
    scoringActions.forEach((action: { type: string; pieceType: string; }) => {
      if (action.type === "pickup") {
        if (action.pieceType === "coral") {
          coralCount = Math.min(1, coralCount + 1);
        } else if (action.pieceType === "algae") {
          algaeCount = Math.min(1, algaeCount + 1);
        }
      } else if (action.type === "score" || action.type === "action") {
        // ALL scoring actions consume pieces (including miss)
        if (action.pieceType === "coral") {
          coralCount = Math.max(0, coralCount - 1);
        } else if (action.pieceType === "algae") {
          algaeCount = Math.max(0, algaeCount - 1);
        }
      }
    });
    
    setCurrentCoral(coralCount);
    setCurrentAlgae(algaeCount);
  }, [scoringActions]);

  // Initialize toggle states from saved data
  useEffect(() => {
    const savedPassedStartLine = scoringActions.some((action: { type: string; }) => action.type === "passed_start_line");
    const savedPlayedDefense = scoringActions.some((action: { type: string; }) => action.type === "defense");
    setPassedStartLine(savedPassedStartLine);
    setPlayedDefense(savedPlayedDefense);
  }, [scoringActions]);

  const addScoringAction = (action: any) => {
    const newAction = { ...action, timestamp: Date.now() };
    
    // Auto-toggle passed starting line when scoring in auto phase
    if (action.type === "score" && phase === "auto" && !passedStartLine) {
      setPassedStartLine(true);
      // Add both actions at once to avoid race condition
      setScoringActions((prev: any) => [...prev, newAction, {
        type: "passed_start_line",
        value: true,
        phase,
        timestamp: Date.now()
      }]);
    } else {
      setScoringActions((prev: any) => [...prev, newAction]);
    }
  };

  const undoLastAction = () => {
    if (scoringActions.length === 0) {
      toast.error("No actions to undo");
      return;
    }

    const lastAction = scoringActions[scoringActions.length - 1];
    setScoringActions((prev: string | any[]) => prev.slice(0, -1));

    // Don't manually update piece counts - let the useEffect handle it
    // Handle toggle state reversals
    if (lastAction.type === "passed_start_line") {
      setPassedStartLine(false);
    } else if (lastAction.type === "defense") {
      setPlayedDefense(false);
    }

    toast.success("Action undone");
  };

  const handleBack = () => {
    const backRoute = phase === "auto" ? "/auto-start" : "/auto-scoring";
    navigate(backRoute, {
      state: {
        inputs: {
          ...states?.inputs,
          [`${phase}Actions`]: scoringActions,
          [`${phase}PassedStartLine`]: passedStartLine,
          [`${phase}PlayedDefense`]: playedDefense,
        },
      },
    });
  };

  const handleProceed = () => {
    const nextRoute = phase === "auto" ? "/teleop-scoring" : "/endgame";
    navigate(nextRoute, {
      state: {
        inputs: {
          ...states?.inputs,
          [`${phase}Actions`]: scoringActions,
          [`${phase}PassedStartLine`]: passedStartLine,
          [`${phase}PlayedDefense`]: playedDefense,
        },
      },
    });
  };

  // Handle toggle actions
  const handleToggleAction = (actionType: string) => {
    if (actionType === "passed_start_line") {
      const newValue = !passedStartLine;
      setPassedStartLine(newValue);
      
      if (newValue) {
        // Add action
        addScoringAction({
          type: actionType,
          value: true,
          phase
        });
      } else {
        // Remove action
        setScoringActions((prev: any[]) => prev.filter((action: { type: string; }) => action.type !== actionType));
      }
    } else if (actionType === "defense") {
      const newValue = !playedDefense;
      setPlayedDefense(newValue);
      
      if (newValue) {
        // Add action
        addScoringAction({
          type: actionType,
          value: true,
          phase
        });
      } else {
        // Remove action
        setScoringActions((prev: any[]) => prev.filter((action: { type: string; }) => action.type !== actionType));
      }
    }
  };

  const phaseTitle = phase === "auto" ? "Autonomous" : "Teleoperated";
  const actionCount = scoringActions.length;

  return (
    <div className="h-fit w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col-reverse lg:flex-row items-start gap-0 lg:gap-6 max-w-7xl w-full h-full min-h-0">
        
        {/* Main Scoring Section */}
        <div className="w-full lg:flex-1 space-y-4 min-h-0 overflow-y-auto">
          
          {/* Reef Scoring Section with Coral Pickup */}
          <ReefScoringSection 
            onScoringAction={addScoringAction}
            currentCoral={currentCoral}
            phase={phase}
            showFlashing={showFlashing}
          />

          {/* Algae Section */}
          <AlgaeSection 
            onAlgaeAction={addScoringAction}
            phase={phase}
            showFlashing={showFlashing}
            currentAlgae={currentAlgae}
          />

          {/* Action Buttons */}
          <div className="flex lg:hidden gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleProceed}
              className={`flex-2 h-12 text-lg font-semibold ${
                phase === "auto" && showFlashing ? "animate-pulse bg-green-600 hover:bg-green-700" : ""
              }`}
            >
              {phase === "auto" ? "Continue to Teleop" : "Continue to Endgame"}
            </Button>
          </div>
        </div>



        {/* Info and Controls Sidebar */}
        <div className="flex flex-col gap-4 w-full lg:w-80 pb-4 lg:pb-0 min-h-0">
          
          {/* Match Info Card */}
          {states?.inputs && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {phaseTitle}
                  {phase === "auto" && showFlashing && (
                    <Badge variant="destructive" className="animate-pulse">
                      Ending Soon!
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match:</span>
                  <span className="font-medium">{states.inputs.matchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{states.inputs.selectTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actions:</span>
                  <Badge variant="outline">{actionCount}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Actions */}
          <Card className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">Recent Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scoringActions.slice(-8).reverse().map((action: { type: string; pieceType: any; location: any; level: string; timestamp: string | number | Date; }, index: Key | null | undefined) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {action.type === "passed_start_line" ? "Passed Start Line" :
                       action.type === "defense" ? "Played Defense" :
                       `${action.type} ${action.pieceType || ''} - ${action.location}${action.level ? ` (${action.level.toUpperCase()})` : ''}`}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(action.timestamp).toLocaleTimeString([], { 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </Badge>
                  </div>
                ))}
                {scoringActions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No actions recorded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Toggle Actions Card - Only show if there are actions to toggle */}
          {(phase === "auto" || phase === "teleop") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Robot Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {phase === "auto" && (
                  <Button
                    variant={passedStartLine ? "default" : "outline"}
                    onClick={() => handleToggleAction("passed_start_line")}
                    className={`w-full h-10 ${passedStartLine ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  >
                    {passedStartLine ? "✓ Passed Starting Line" : "Passed Starting Line"}
                  </Button>
                )}
                {phase === "teleop" && (
                  <Button
                    variant={playedDefense ? "default" : "outline"}
                    onClick={() => handleToggleAction("defense")}
                    className={`w-full h-10 ${playedDefense ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                  >
                    {playedDefense ? "✓ Played Defense" : "Played Defense"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Undo Button */}
          <Button
            variant="outline"
            onClick={undoLastAction}
            disabled={scoringActions.length === 0}
            className="w-full"
          >
            Undo Last Action
          </Button>

          {/* Action Buttons */}
          <div className="hidden lg:flex gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 text-lg"
            >
              Back
            </Button>
            <Button
              onClick={handleProceed}
              className={`flex-2 h-12 text-lg font-semibold ${
                phase === "auto" && showFlashing ? "animate-pulse bg-green-600 hover:bg-green-700" : ""
              }`}
            >
              {phase === "auto" ? "Continue to Teleop" : "Continue to Endgame"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Auto Scoring Page Component
export const AutoScoringPage = () => <ScoringPage phase="auto" />;

// Teleop Scoring Page Component
export const TeleopScoringPage = () => <ScoringPage phase="teleop" />;

export default ScoringPage;