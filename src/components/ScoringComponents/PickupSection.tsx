import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PickupSectionProps {
  onPickupAction: (action: any) => void;
  phase: "auto" | "teleop";
  currentCoral: number;
  currentAlgae: number;
}

const PickupSection = ({ onPickupAction, phase, currentCoral, currentAlgae }: PickupSectionProps) => {

  const handlePickup = (location: string) => {
    // Check if robot is already holding coral
    if (currentCoral >= 1) {
      return; // Can't pick up more than 1 coral
    }
    
    onPickupAction({
      type: "pickup",
      location,
      pieceType: "coral", // This was missing!
      phase
    });
  };

  // Different pickup locations based on phase
  const getPickupLocations = () => {
    if (phase === "auto") {
      return [
        { location: "preload", label: "Preload", disabled: false },
        { location: "station", label: "Station", disabled: false },
        { location: "mark1", label: "Mark 1", disabled: false },
        { location: "mark2", label: "Mark 2", disabled: false },
        { location: "mark3", label: "Mark 3", disabled: false },
      ];
    } else {
      return [
        { location: "station", label: "Station", disabled: false },
        { location: "carpet", label: "Carpet", disabled: false },
      ];
    }
  };

  const pickupLocations = getPickupLocations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Coral Pickup</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {currentCoral}/1 Coral Held
          </Badge>
          {currentCoral >= 1 && (
            <Badge variant="outline" className="text-amber-600">
              Score current coral first
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {pickupLocations.map((pickup) => (
            <Button
              key={pickup.location}
              onClick={() => handlePickup(pickup.location)}
              variant="outline"
              className="h-12 text-sm"
              disabled={pickup.disabled || currentCoral >= 1}
            >
              {pickup.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PickupSection;