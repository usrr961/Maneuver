/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableList, SortableListItem, type Item } from "@/components/ui/sortable-list";
import { TeamStatsButton } from "@/components/ui/team-stats-button";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";
import LogoSearching from "../assets/searching.png";
import LogoConfused from "../assets/confused.png";

interface TeamStats {
  teamNumber: string;
  matchesPlayed: number;
  // Coral stats
  avgAutoCoralTotal: number;
  avgTeleopCoralTotal: number;
  avgTotalCoralTotal: number; // New combined metric
  avgAutoCoralL1: number;
  avgAutoCoralL2: number;
  avgAutoCoralL3: number;
  avgAutoCoralL4: number;
  avgTeleopCoralL1: number;
  avgTeleopCoralL2: number;
  avgTeleopCoralL3: number;
  avgTeleopCoralL4: number;
  avgTotalCoralL1: number; // New combined metrics
  avgTotalCoralL2: number;
  avgTotalCoralL3: number;
  avgTotalCoralL4: number;
  // Algae stats
  avgAutoAlgaeTotal: number;
  avgTeleopAlgaeTotal: number;
  avgTotalAlgaeTotal: number; // New combined metric
  avgAutoAlgaeNet: number;
  avgAutoAlgaeProcessor: number;
  avgTeleopAlgaeNet: number;
  avgTeleopAlgaeProcessor: number;
  // Other stats
  climbRate: number;
  breakdownRate: number;
  defenseRate: number;
  mobilityRate: number;
  // Starting positions
  startPositions: {
    position0: number;
    position1: number;
    position2: number;
    position3: number;
    position4: number;
  };
}

interface PickList {
  id: number;
  name: string;
  description: string;
  teams: Item[];
}

const PickListPage = () => {
  const [availableTeams, setAvailableTeams] = useState<TeamStats[]>([]);
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<"number" | "totalCoral" | "totalAlgae" | "autoCorals" | "teleopCorals" | "coralL1" | "coralL2" | "coralL3" | "coralL4" | "climb" | "matches">("number");

  // Load persistent pick lists from localStorage
  useEffect(() => {
    const savedLists = localStorage.getItem("pickLists");
    if (savedLists) {
      try {
        setPickLists(JSON.parse(savedLists));
      } catch (error) {
        console.error("Error loading pick lists:", error);
        // Initialize with default list if loading fails
        setPickLists([{
          id: 1,
          name: "Primary Pick List",
          description: "Main alliance selection priority",
          teams: []
        }]);
      }
    } else {
      // Initialize with default list
      setPickLists([{
        id: 1,
        name: "Primary Pick List", 
        description: "Main alliance selection priority",
        teams: []
      }]);
    }
  }, []);

  // Save pick lists to localStorage whenever they change
  useEffect(() => {
    if (pickLists.length > 0) {
      localStorage.setItem("pickLists", JSON.stringify(pickLists));
    }
  }, [pickLists]);

  // Load team data from scouting results
  useEffect(() => {
    const loadTeamData = () => {
      const matchDataStr = localStorage.getItem("matchData");
      
      try {
        const scoutingData = loadLegacyScoutingData();
        
        if (scoutingData.length > 0) {
          // Get unique teams and calculate stats (team number is now at index 4)
          const teamNumbers = [...new Set(scoutingData.map((entry: any[]) => entry[4]?.toString()).filter(Boolean))];
          
          const teamsWithStats = teamNumbers.map(teamNumber => {
            const teamEntries = scoutingData.filter((entry: any[]) => entry[4]?.toString() === teamNumber);
            
            if (teamEntries.length === 0) return null;
            
            const matchCount = teamEntries.length;
            
            // Calculate coral totals
            const autoCoralTotals = teamEntries.map((entry: any[]) => 
              (entry[10] || 0) + (entry[11] || 0) + (entry[12] || 0) + (entry[13] || 0)
            );
            const teleopCoralTotals = teamEntries.map((entry: any[]) => 
              (entry[29] || 0) + (entry[30] || 0) + (entry[31] || 0) + (entry[32] || 0)
            );
            
            // Calculate algae totals
            const autoAlgaeTotals = teamEntries.map((entry: any[]) => 
              (entry[20] || 0) + (entry[21] || 0)
            );
            const teleopAlgaeTotals = teamEntries.map((entry: any[]) => 
              (entry[36] || 0) + (entry[37] || 0)
            );
            
            // Calculate averages for each coral level
            const avgAutoCoralL1 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[10] || 0), 0) / matchCount;
            const avgAutoCoralL2 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[11] || 0), 0) / matchCount;
            const avgAutoCoralL3 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[12] || 0), 0) / matchCount;
            const avgAutoCoralL4 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[13] || 0), 0) / matchCount;
            
            const avgTeleopCoralL1 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[29] || 0), 0) / matchCount;
            const avgTeleopCoralL2 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[30] || 0), 0) / matchCount;
            const avgTeleopCoralL3 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[31] || 0), 0) / matchCount;
            const avgTeleopCoralL4 = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[32] || 0), 0) / matchCount;
            
            // Calculate averages for algae locations
            const avgAutoAlgaeNet = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[20] || 0), 0) / matchCount;
            const avgAutoAlgaeProcessor = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[21] || 0), 0) / matchCount;
            const avgTeleopAlgaeNet = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[36] || 0), 0) / matchCount;
            const avgTeleopAlgaeProcessor = teamEntries.reduce((sum: number, entry: any[]) => sum + (entry[37] || 0), 0) / matchCount;
            
            // Calculate combined totals
            const avgAutoCoralTotal: number = autoCoralTotals.reduce((a: number, b: number) => a + b, 0) / matchCount;
            const avgTeleopCoralTotal: number = teleopCoralTotals.reduce((a: number, b: number) => a + b, 0) / matchCount;
            const avgAutoAlgaeTotal: number = autoAlgaeTotals.reduce((a: number, b: number) => a + b, 0) / matchCount;
            const avgTeleopAlgaeTotal: number = teleopAlgaeTotals.reduce((a: number, b: number) => a + b, 0) / matchCount;

            // Calculate rates
            const climbAttempts = teamEntries.filter((entry: any[]) => entry[42] || entry[43]); // shallow or deep climb
            const climbSuccesses = teamEntries.filter((entry: any[]) => (entry[42] || entry[43]) && !entry[45]); // not failed
            const breakdowns = teamEntries.filter((entry: any[]) => entry[47]); // broke down
            const playedDefense = teamEntries.filter((entry: any[]) => entry[46]); // played defense
            const mobility = teamEntries.filter((entry: any[]) => entry[28]); // passed start line
            
            // Calculate starting positions using entry[5] for pos0, [6] for pos1, [7] for pos2, [8] for pos3, [10] for pos4
            let pos0 = 0, pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            teamEntries.forEach((entry: any[]) => {
              if (entry[5]) pos0++;
              if (entry[6]) pos1++;
              if (entry[7]) pos2++;
              if (entry[8]) pos3++;
              if (entry[10]) pos4++;
            });
            const startPositions = {
              position0: Math.round((pos0 / matchCount) * 100),
              position1: Math.round((pos1 / matchCount) * 100),
              position2: Math.round((pos2 / matchCount) * 100),
              position3: Math.round((pos3 / matchCount) * 100),
              position4: Math.round((pos4 / matchCount) * 100),
            };
            
            return {
              teamNumber,
              matchesPlayed: matchCount,
              avgAutoCoralTotal: Math.round(avgAutoCoralTotal * 10) / 10,
              avgTeleopCoralTotal: Math.round(avgTeleopCoralTotal * 10) / 10,
              avgTotalCoralTotal: Math.round((avgAutoCoralTotal + avgTeleopCoralTotal) * 10) / 10,
              avgAutoCoralL1: Math.round(avgAutoCoralL1 * 10) / 10,
              avgAutoCoralL2: Math.round(avgAutoCoralL2 * 10) / 10,
              avgAutoCoralL3: Math.round(avgAutoCoralL3 * 10) / 10,
              avgAutoCoralL4: Math.round(avgAutoCoralL4 * 10) / 10,
              avgTeleopCoralL1: Math.round(avgTeleopCoralL1 * 10) / 10,
              avgTeleopCoralL2: Math.round(avgTeleopCoralL2 * 10) / 10,
              avgTeleopCoralL3: Math.round(avgTeleopCoralL3 * 10) / 10,
              avgTeleopCoralL4: Math.round(avgTeleopCoralL4 * 10) / 10,
              avgTotalCoralL1: Math.round((avgAutoCoralL1 + avgTeleopCoralL1) * 10) / 10,
              avgTotalCoralL2: Math.round((avgAutoCoralL2 + avgTeleopCoralL2) * 10) / 10,
              avgTotalCoralL3: Math.round((avgAutoCoralL3 + avgTeleopCoralL3) * 10) / 10,
              avgTotalCoralL4: Math.round((avgAutoCoralL4 + avgTeleopCoralL4) * 10) / 10,
              avgAutoAlgaeTotal: Math.round(avgAutoAlgaeTotal * 10) / 10,
              avgTeleopAlgaeTotal: Math.round(avgTeleopAlgaeTotal * 10) / 10,
              avgTotalAlgaeTotal: Math.round((avgAutoAlgaeTotal + avgTeleopAlgaeTotal) * 10) / 10,
              avgAutoAlgaeNet: Math.round(avgAutoAlgaeNet * 10) / 10,
              avgAutoAlgaeProcessor: Math.round(avgAutoAlgaeProcessor * 10) / 10,
              avgTeleopAlgaeNet: Math.round(avgTeleopAlgaeNet * 10) / 10,
              avgTeleopAlgaeProcessor: Math.round(avgTeleopAlgaeProcessor * 10) / 10,
              climbRate: climbAttempts.length > 0 ? Math.round((climbSuccesses.length / climbAttempts.length) * 100) : 0,
              breakdownRate: Math.round((breakdowns.length / matchCount) * 100),
              defenseRate: Math.round((playedDefense.length / matchCount) * 100),
              mobilityRate: Math.round((mobility.length / matchCount) * 100),
              startPositions
            };
          }).filter(Boolean) as TeamStats[];
          
          // Add teams from match data that might not have scouting data
          if (matchDataStr) {
            try {
              const matchData = JSON.parse(matchDataStr);
              const allMatchTeams = new Set<string>();
              
              matchData.forEach((match: any) => {
                if (match.redAlliance) match.redAlliance.forEach((team: string) => allMatchTeams.add(team));
                if (match.blueAlliance) match.blueAlliance.forEach((team: string) => allMatchTeams.add(team));
              });
              
              // Add teams that don't have scouting data
              allMatchTeams.forEach(teamNumber => {
                if (!teamsWithStats.find(t => t.teamNumber === teamNumber)) {
                  teamsWithStats.push({
                    teamNumber,
                    matchesPlayed: 0,
                    avgAutoCoralTotal: 0,
                    avgTeleopCoralTotal: 0,
                    avgTotalCoralTotal: 0,
                    avgAutoCoralL1: 0,
                    avgAutoCoralL2: 0,
                    avgAutoCoralL3: 0,
                    avgAutoCoralL4: 0,
                    avgTeleopCoralL1: 0,
                    avgTeleopCoralL2: 0,
                    avgTeleopCoralL3: 0,
                    avgTeleopCoralL4: 0,
                    avgTotalCoralL1: 0,
                    avgTotalCoralL2: 0,
                    avgTotalCoralL3: 0,
                    avgTotalCoralL4: 0,
                    avgAutoAlgaeTotal: 0,
                    avgTeleopAlgaeTotal: 0,
                    avgTotalAlgaeTotal: 0,
                    avgAutoAlgaeNet: 0,
                    avgAutoAlgaeProcessor: 0,
                    avgTeleopAlgaeNet: 0,
                    avgTeleopAlgaeProcessor: 0,
                    climbRate: 0,
                    breakdownRate: 0,
                    defenseRate: 0,
                    mobilityRate: 0,
                    startPositions: {
                      position0: 0,
                      position1: 0,
                      position2: 0,
                      position3: 0,
                      position4: 0,
                    }
                  });
                }
              });
            } catch (error) {
              console.error("Error parsing match data:", error);
            }
          }
          
          teamsWithStats.sort((a, b) => Number(a.teamNumber) - Number(b.teamNumber));
          setAvailableTeams(teamsWithStats);
        }
      } catch (error) {
        console.error("Error loading team data:", error);
      }
    };

    loadTeamData();
  }, []);

  // Add team to a pick list
  const addTeamToList = (team: TeamStats, listId: number) => {
    // Check if team is already in this list
    const list = pickLists.find(l => l.id === listId);
    if (list?.teams.some(t => t.text === `Team ${team.teamNumber}`)) {
      toast.error(`Team ${team.teamNumber} is already in ${list.name}`);
      return;
    }

    const newItem: Item = {
      id: Date.now() + Math.random(),
      text: `Team ${team.teamNumber}`,
      checked: false,
      description: team.teamNumber // Store team number for lookup
    };

    setPickLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, teams: [...list.teams, newItem] }
        : list
    ));

    toast.success(`Team ${team.teamNumber} added to ${pickLists.find(l => l.id === listId)?.name}`);
  };

  // Create new pick list
  const createNewList = () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    const newList: PickList = {
      id: Date.now(),
      name: newListName.trim(),
      description: newListDescription.trim(),
      teams: []
    };

    setPickLists(prev => [...prev, newList]);
    setNewListName("");
    setNewListDescription("");
    toast.success("New pick list created");
  };

  // Delete pick list
  const deleteList = (listId: number) => {
    if (pickLists.length <= 1) {
      toast.error("You must have at least one pick list");
      return;
    }

    setPickLists(prev => prev.filter(list => list.id !== listId));
    toast.success("Pick list deleted");
  };

  // Update pick list teams order
  const updateListTeams = (listId: number, newTeams: Item[]) => {
    setPickLists(prev => prev.map(list => 
      list.id === listId ? { ...list, teams: newTeams } : list
    ));
  };

  // Export pick lists
  const exportPickLists = () => {
    const dataStr = JSON.stringify(pickLists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'pick-lists.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Pick lists exported");
  };

  // Import pick lists
  const importPickLists = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLists = JSON.parse(e.target?.result as string);
        setPickLists(importedLists);
        toast.success("Pick lists imported successfully");
      } catch (error) {
        toast.error("Error importing pick lists: " + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Filter and sort available teams
  const filteredAndSortedTeams = availableTeams
    .filter(team => 
      team.teamNumber.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      // For performance sorts, put teams with 0 matches at the bottom
      if (sortBy !== "number" && sortBy !== "matches") {
        if (a.matchesPlayed === 0 && b.matchesPlayed > 0) return 1;
        if (b.matchesPlayed === 0 && a.matchesPlayed > 0) return -1;
        // If both have 0 matches, sort by team number
        if (a.matchesPlayed === 0 && b.matchesPlayed === 0) {
          return Number(a.teamNumber) - Number(b.teamNumber);
        }
      }
      
      switch (sortBy) {
        case "totalCoral":
          return b.avgTotalCoralTotal - a.avgTotalCoralTotal;
        case "totalAlgae":
          return b.avgTotalAlgaeTotal - a.avgTotalAlgaeTotal;
        case "autoCorals":
          return b.avgAutoCoralTotal - a.avgAutoCoralTotal;
        case "teleopCorals":
          return b.avgTeleopCoralTotal - a.avgTeleopCoralTotal;
        case "coralL1":
          return b.avgTotalCoralL1 - a.avgTotalCoralL1;
        case "coralL2":
          return b.avgTotalCoralL2 - a.avgTotalCoralL2;
        case "coralL3":
          return b.avgTotalCoralL3 - a.avgTotalCoralL3;
        case "coralL4":
          return b.avgTotalCoralL4 - a.avgTotalCoralL4;
        case "climb":
          return b.climbRate - a.climbRate;
        case "matches":
          return b.matchesPlayed - a.matchesPlayed;
        default:
          return Number(a.teamNumber) - Number(b.teamNumber);
      }
    });


  return (
    <div className="min-h-screen w-full flex flex-col px-4 pt-4 pb-6">
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Create and manage alliance selection pick lists</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportPickLists} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importPickLists}
              style={{ display: 'none' }}
              id="import-input"
            />
            <Button 
              onClick={() => document.getElementById('import-input')?.click()} 
              variant="outline" 
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-y-6 xl:gap-6">
          
          {/* Available Teams Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Available Teams
                <Badge variant="secondary">{filteredAndSortedTeams.length} teams</Badge>
              </CardTitle>
              
              {/* Filters */}
              <div className="space-y-3">
                <Input
                  placeholder="Search teams..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Team Number</SelectItem>
                    <SelectItem value="totalCoral">Total Coral (All)</SelectItem>
                    <SelectItem value="totalAlgae">Total Algae (All)</SelectItem>
                    <SelectItem value="autoCorals">Auto Corals</SelectItem>
                    <SelectItem value="teleopCorals">Teleop Corals</SelectItem>
                    <SelectItem value="coralL1">Level 1 Coral (All)</SelectItem>
                    <SelectItem value="coralL2">Level 2 Coral (All)</SelectItem>
                    <SelectItem value="coralL3">Level 3 Coral (All)</SelectItem>
                    <SelectItem value="coralL4">Level 4 Coral (All)</SelectItem>
                    <SelectItem value="climb">Climb Rate</SelectItem>
                    <SelectItem value="matches">Matches Played</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2 max-h-10/12 overflow-y-auto">
              {filteredAndSortedTeams.map(team => (
                <Card key={team.teamNumber} className="p-3">
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
                      
                      <Select onValueChange={(listId) => addTeamToList(team, Number(listId))}>
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
              ))}

              {/* Placeholder for no teams */}
              {filteredAndSortedTeams.length === 0 && (
                <div className="flex flex-col text-center items-center justify-center py-8 text-muted-foreground">
                  {filteredAndSortedTeams.length === 0 ? <img src={LogoSearching} alt="No Data" className="mb-4 dark:invert" /> : null}
                  <p>No teams found. Try adjusting your search or filters.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pick Lists Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Create New List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Pick List
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="List name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)..."
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                  />
                </div>
                <Button onClick={createNewList} className="w-full">
                  Create List
                </Button>
              </CardContent>
            </Card>

            {/* Pick Lists */}
            {pickLists.map(list => (
              <Card key={list.id} className="mb-4 xl:mb-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {list.name}
                        <Badge variant="outline">{list.teams.length} teams</Badge>
                      </CardTitle>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                      )}
                    </div>
                    {pickLists.length > 1 && (
                      <Button 
                        onClick={() => deleteList(list.id)} 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {list.teams.length === 0 ? (
                    <div className="flex flex-col text-center items-center justify-center py-8 text-muted-foreground">
                      {list.teams.length === 0 ? <img src={LogoConfused} alt="No Teams" className="mb-4 dark:invert" /> : null}
                      <p>No teams in this list yet</p>
                      <p className="text-sm">Add teams from the available teams panel</p>
                    </div>
                  ) : (
                    <SortableList
                      items={list.teams}
                      setItems={(newTeams) => {
                        // Handle both function and direct array updates
                        if (typeof newTeams === 'function') {
                          updateListTeams(list.id, newTeams(list.teams));
                        } else {
                          updateListTeams(list.id, newTeams);
                        }
                      }}
                      onCompleteItem={(id) => {
                        // Toggle the checked state to show/hide delete button
                        const updatedTeams = list.teams.map(team => 
                          team.id === id ? { ...team, checked: !team.checked } : team
                        );
                        updateListTeams(list.id, updatedTeams);
                      }}
                      renderItem={(item, order, onCompleteItem, onRemoveItem) => {
                        // Extract team number from item.text (format: "Team 1234")
                        const teamNumber = item.text.replace('Team ', '');
                        const teamStats = availableTeams.find(t => t.teamNumber === teamNumber);
                        return (
                          <SortableListItem
                            key={item.id}
                            item={item}
                            order={order}
                            onCompleteItem={onCompleteItem} // Re-enable checkbox functionality
                            onRemoveItem={onRemoveItem}
                            handleDrag={() => {}}
                            renderExtra={() => (
                              <div className="flex flex-1 justify-end px-2 py-2">
                                <TeamStatsButton 
                                  teamNumber={teamNumber}
                                  teamStats={teamStats}
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/80 hover:text-white hover:bg-white/20 h-8"
                                />
                              </div>
                            )}
                          />
                        );
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickListPage;