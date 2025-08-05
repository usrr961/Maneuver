import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamStatsButton } from "@/components/ui/team-stats-button";
import type { TeamStats, PickList } from "@/lib/pickListTypes";

interface TeamCardProps {
  team: TeamStats;
  pickLists: PickList[];
  onAddTeamToList: (team: TeamStats, listId: number) => void;
}

export const TeamCard = ({ team, pickLists, onAddTeamToList }: TeamCardProps) => {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">Team {team.teamNumber}</div>
          <div className="text-xs text-muted-foreground">
            Auto: {team.avgAutoCoralTotal}C, {team.avgAutoAlgaeTotal}A | Teleop: {team.avgTeleopCoralTotal}C, {team.avgTeleopAlgaeTotal}A
          </div>
          <div className="text-xs text-muted-foreground">
            {team.climbRate}% climb • {team.matchesPlayed} matches
          </div>
        </div>
        
        <div className="flex gap-1">
          <TeamStatsButton 
            teamNumber={team.teamNumber}
            teamStats={team}
            className="h-auto"
          />
          
          <Select onValueChange={(listId) => onAddTeamToList(team, Number(listId))}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Add" />
            </SelectTrigger>
            <SelectContent>
              {pickLists.map(list => (
                <SelectItem key={list.id} value={list.id.toString()}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
