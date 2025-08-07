import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInformationProps {
  teamNumber: string;
  setTeamNumber: (value: string) => void;
  eventName: string;
  setEventName: (value: string) => void;
  scouterInitials: string;
  setScouterInitials: (value: string) => void;
}

export const BasicInformation = ({
  teamNumber,
  setTeamNumber,
  eventName,
  setEventName,
  scouterInitials,
  setScouterInitials,
}: BasicInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teamNumber">Team Number *</Label>
            <Input
              id="teamNumber"
              type="number"
              placeholder="e.g., 1234"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name *</Label>
            <Input
              id="eventName"
              placeholder="e.g., Regional Championship"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scouterInitials">Scouter Initials *</Label>
            <Input
              id="scouterInitials"
              placeholder="e.g., JS"
              value={scouterInitials}
              onChange={(e) => setScouterInitials(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
