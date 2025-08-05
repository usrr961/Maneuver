import { TeamSelector } from "@/components/MatchStrategyComponents/TeamSelector";
import { GenericSelector } from "@/components/ui/generic-selector";

interface TeamStatsHeaderProps {
  selectedTeam: string;
  compareTeam: string;
  selectedEvent: string;
  availableTeams: string[];
  availableEvents: string[];
  onSelectedTeamChange: (value: string) => void;
  onCompareTeamChange: (value: string) => void;
  onSelectedEventChange: (value: string) => void;
}

export const TeamStatsHeader = ({
  selectedTeam,
  compareTeam,
  selectedEvent,
  availableTeams,
  availableEvents,
  onSelectedTeamChange,
  onCompareTeamChange,
  onSelectedEventChange
}: TeamStatsHeaderProps) => {
  // Filter available teams for comparison (exclude selected team)
  const compareTeamOptions = availableTeams.filter(teamNum => teamNum !== selectedTeam);

  return (
    <div className="w-full pt-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium">Select Team:</label>
          <TeamSelector
            index={0}
            label="Select Team"
            labelColor=""
            value={selectedTeam}
            availableTeams={availableTeams}
            onValueChange={onSelectedTeamChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Compare to:</label>
          <TeamSelector
            index={1}
            label="Compare Team"
            labelColor=""
            value={compareTeam}
            availableTeams={compareTeamOptions}
            onValueChange={onCompareTeamChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Event:</label>
          <GenericSelector
            label="Select Event"
            value={selectedEvent}
            availableOptions={["all", ...availableEvents]}
            onValueChange={onSelectedEventChange}
            placeholder="All events"
            displayFormat={(val) => val}
          />
        </div>
      </div>
    </div>
  );
};
