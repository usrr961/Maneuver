import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SortOption } from "@/lib/pickListTypes";

interface SortSelectorProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

const sortOptions = [
  { value: "number" as const, label: "Team Number" },
  { value: "totalCoral" as const, label: "Total Coral (All)" },
  { value: "totalAlgae" as const, label: "Total Algae (All)" },
  { value: "autoCorals" as const, label: "Auto Corals" },
  { value: "teleopCorals" as const, label: "Teleop Corals" },
  { value: "coralL1" as const, label: "Level 1 Coral (All)" },
  { value: "coralL2" as const, label: "Level 2 Coral (All)" },
  { value: "coralL3" as const, label: "Level 3 Coral (All)" },
  { value: "coralL4" as const, label: "Level 4 Coral (All)" },
  { value: "climb" as const, label: "Climb Rate" },
  { value: "matches" as const, label: "Matches Played" }
];

export const SortSelector = ({ sortBy, onSortChange }: SortSelectorProps) => {
  const isMobile = useIsMobile();
  const currentOption = sortOptions.find(option => option.value === sortBy);
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {currentOption?.label || "Sort by..."}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Sort Teams By</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 py-4 px-4 overflow-y-scroll">
            {sortOptions.map((option) => (
              <SheetClose key={option.value} asChild>
                <Button
                  variant={sortBy === option.value ? "default" : "ghost"}
                  className="w-full justify-start h-12 px-4"
                  onClick={() => onSortChange(option.value)}
                >
                  {option.label}
                </Button>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Select value={sortBy} onValueChange={onSortChange} aria-label="Sort by">
      <SelectTrigger>
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
