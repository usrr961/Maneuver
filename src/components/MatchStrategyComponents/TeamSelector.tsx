import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDownIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeamSelectorProps {
  index: number;
  label: string;
  labelColor: string;
  value: string;
  availableTeams: string[];
  onValueChange: (value: string) => void;
}

export const TeamSelector = ({ 
  label, 
  value, 
  availableTeams,
  onValueChange 
}: TeamSelectorProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="flex-1 justify-between h-10"
          >
            <span className="truncate">
              {value ? `Team ${value}` : "Select team"}
            </span>
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] pb-8">
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              <SheetClose asChild>
                <Button 
                  variant={!value ? "default" : "outline"}
                  className="w-full justify-start h-12 px-4"
                  onClick={() => onValueChange("none")}
                >
                  No team
                </Button>
              </SheetClose>
              {availableTeams.map((teamNum) => (
                <SheetClose key={teamNum} asChild>
                  <Button 
                    variant={value === teamNum ? "default" : "outline"}
                    className="w-full justify-start h-12 px-4"
                    onClick={() => onValueChange(teamNum)}
                  >
                    Team {teamNum}
                  </Button>
                </SheetClose>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version - keep existing Select
  return (
    <Select 
      value={value || "none"} 
      onValueChange={onValueChange}
    >
      <SelectTrigger className="flex-1">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No team</SelectItem>
        {availableTeams.map((teamNum) => (
          <SelectItem key={teamNum} value={teamNum}>
            Team {teamNum}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
