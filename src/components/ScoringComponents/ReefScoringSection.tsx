import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReefScoringSectionProps {
  onScoringAction: (action: any) => void;
  currentCoral: number;
  phase: "auto" | "teleop";
  showFlashing: boolean;
}

const ReefScoringSection = ({ 
  onScoringAction, 
  currentCoral, 
  phase,
  showFlashing 
}: ReefScoringSectionProps) => {

  const handleReefScore = (level: string) => {
    // Must have coral to score on reef
    if (currentCoral <= 0) {
      console.log("Cannot score on reef - no coral held:", currentCoral);
      return;
    }
    
    onScoringAction({
      type: "score",
      location: "reef",
      level: level,
      pieceType: "coral",
      phase
    });
  };

  // Flipped order - L4 at top, Miss at bottom
  const reefLevels = [
    { level: "l4", label: "L4", position: "top" },
    { level: "l3", label: "L3", position: "mid-top" },
    { level: "l2", label: "L2", position: "mid-bottom" },
    { level: "l1", label: "L1", position: "bottom-high" },
    { level: "miss", label: "Drop/Miss", position: "bottom" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reef Scoring (Coral Only)</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {currentCoral} Coral Available
          </Badge>
          {currentCoral === 0 && (
            <Badge variant="outline" className="text-amber-600">
              Pick up coral first
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Reef Visual Interface */}
        <div 
          className="relative bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden h-64 border"
          style={{ 
            backgroundImage: `url(/src/assets/ReefSideView.png)`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay buttons for each level - flipped order with better visibility */}
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            {reefLevels.map((reef) => (
              <Button
                key={reef.level}
                onClick={() => handleReefScore(reef.level)}
                disabled={currentCoral <= 0}
                variant={reef.level === "miss" ? "destructive" : "default"}
                className={`
                  h-8 font-bold text-base shadow-lg
                  ${currentCoral <= 0 ? 'cursor-not-allowed opacity-40' : 'opacity-95 hover:opacity-100'}
                  ${phase === "auto" && showFlashing && reef.level !== "miss" ? 'animate-pulse' : ''}
                  ${reef.level === "miss" 
                    ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-800' 
                    : 'bg-white hover:bg-gray-100 text-black border-3 border-gray-800'
                  }
                `}
                style={{
                  textShadow: reef.level === "miss" ? '1px 1px 2px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                {reef.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReefScoringSection;