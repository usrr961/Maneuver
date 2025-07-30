/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AlgaeSectionProps {
  onAlgaeAction: (action: any) => void;
  phase: "auto" | "teleop";
  showFlashing: boolean;
  currentAlgae: number;
}

const AlgaeSection = ({ onAlgaeAction, phase, showFlashing, currentAlgae }: AlgaeSectionProps) => {

  const handleAlgaeAction = (actionType: string, location: string) => {
    // For pickup actions, check if robot can hold more algae
    if (actionType === "pickup" && currentAlgae >= 1) {
      console.log("Cannot pickup algae - already holding algae:", currentAlgae);
      return;
    }
    
    // For scoring/action types, must have algae (miss is allowed without algae for tracking failed attempts)
    if ((actionType === "score" || actionType === "action") && currentAlgae <= 0 && location !== "miss") {
      console.log("Cannot score/remove algae - no algae held:", currentAlgae);
      return;
    }
    
    onAlgaeAction({
      type: actionType,
      location: location,
      pieceType: (actionType === "pickup" || actionType === "score" || actionType === "action") ? "algae" : undefined,
      phase
    });
  };

  // Different algae actions based on phase
  const getAlgaeActions = () => {
    const scoringActions = [
      { action: "net", label: "Net Shot", type: "score" },
      { action: "processor", label: "Processor", type: "score" },
      { action: "miss", label: "Miss", type: "score" },
      { action: "remove", label: "Remove", type: "action" },
    ];

    const pickupActions = phase === "auto" 
      ? [
          { action: "reef", label: "Reef", type: "pickup" },
          { action: "carpet", label: "Carpet", type: "pickup" },
          { action: "mark1", label: "Mark 1", type: "pickup" },
          { action: "mark2", label: "Mark 2", type: "pickup" },
          { action: "mark3", label: "Mark 3", type: "pickup" },
        ]
      : [
          { action: "reef", label: "Reef", type: "pickup" },
          { action: "carpet", label: "Carpet", type: "pickup" },
        ];

    return { scoring: scoringActions, pickup: pickupActions };
  };

  const algaeActions = getAlgaeActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Algae</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {currentAlgae}/1 Algae Held
          </Badge>
          {currentAlgae === 0 && (
            <Badge variant="outline" className="text-amber-600">
              Pick up algae first
            </Badge>
          )}
          {currentAlgae >= 1 && (
            <Badge variant="outline" className="text-green-600">
              Ready to score
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Algae Pickup */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Algae Pickup</p>
          <div className="grid grid-cols-2 gap-2">
            {algaeActions.pickup.map((action) => (
              <Button
                key={action.action}
                onClick={() => handleAlgaeAction(action.type, action.action)}
                variant="outline"
                className="h-10 text-sm"
                disabled={currentAlgae >= 1}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Algae Scoring */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Algae Scoring</p>
          <div className="grid grid-cols-2 gap-2">
            {algaeActions.scoring.map((action) => (
              <Button
                key={action.action}
                onClick={() => handleAlgaeAction(action.type, action.action)}
                variant={action.action === "miss" ? "destructive" : "outline"}
                disabled={(action.type === "score" || action.type === "action") && currentAlgae <= 0}
                className={`h-10 text-sm ${
                  phase === "auto" && showFlashing ? 'animate-pulse' : ''
                } ${(action.type === "score" || action.type === "action") && currentAlgae <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgaeSection;