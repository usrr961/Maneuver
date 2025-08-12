import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamStatsButton } from "@/components/ui/team-stats-button";
import { Check } from "lucide-react";
import type { TeamStats, PickList } from "@/lib/pickListTypes";

interface TeamCardProps {
  team: TeamStats;
  pickLists: PickList[];
  onAddTeamToList: (team: TeamStats, listId: number) => void;
}

export const TeamCard = ({ team, pickLists, onAddTeamToList }: TeamCardProps) => {
  // Check if a team is in a specific list
  const isTeamInList = (listId: number) => {
    const list = pickLists.find(l => l.id === listId);
    return list?.teams.some(t => t.text === `Team ${team.teamNumber}`) || false;
  };

  // Get all lists that contain this team
  const getTeamLists = () => {
    return pickLists.filter(list => 
      list.teams.some(t => t.text === `Team ${team.teamNumber}`)
    );
  };

  const handleAddToList = (listId: string) => {
    onAddTeamToList(team, Number(listId));
  };
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
          {getTeamLists().length > 0 && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              In lists: {getTeamLists().map(list => list.name).join(", ")}
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          <TeamStatsButton 
            teamNumber={team.teamNumber}
            teamStats={team}
            className="h-auto"
          />
          
          <Select onValueChange={handleAddToList} value="">
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Add" />
            </SelectTrigger>
            <SelectContent>
              {pickLists.map(list => (
                <SelectItem key={list.id} value={list.id.toString()}>
                  <div className="flex items-center gap-2">
                    {isTeamInList(list.id) && <Check className="h-4 w-4" />}
                    <span>{list.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
