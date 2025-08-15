import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";
import { getAllStoredEventTeams } from "../lib/tbaUtils";
import { 
  sortTeams, 
  filterTeams, 
  isTeamInList, 
  createPickListItem, 
  calculateTeamStats, 
  createDefaultTeamStats 
} from "../lib/pickListUtils";
import type { TeamStats, PickList, PickListItem, SortOption } from "../lib/pickListTypes";
import { PickListHeader } from "../components/PickListComponents/PickListHeader";
import { AvailableTeamsPanel } from "../components/PickListComponents/AvailableTeamsPanel";
import { CreatePickList } from "../components/PickListComponents/CreatePickList";
import { PickListCard } from "../components/PickListComponents/PickListCard";

const PickListPage = () => {
  const [availableTeams, setAvailableTeams] = useState<TeamStats[]>([]);
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("number");
  const [activeTab, setActiveTab] = useState("teams");

  useEffect(() => {
    const savedLists = localStorage.getItem("pickLists");
    if (savedLists) {
      try {
        setPickLists(JSON.parse(savedLists));
      } catch (error) {
        console.error("Error loading pick lists:", error);
        setPickLists([{
          id: 1,
          name: "Primary Pick List",
          description: "Main alliance selection priority",
          teams: []
        }]);
      }
    } else {
      setPickLists([{
        id: 1,
        name: "Primary Pick List", 
        description: "Main alliance selection priority",
        teams: []
      }]);
    }
  }, []);

  useEffect(() => {
    if (pickLists.length > 0) {
      localStorage.setItem("pickLists", JSON.stringify(pickLists));
    }
  }, [pickLists]);

  // Load team data from scouting results
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const scoutingData = await loadLegacyScoutingData();
        
        if (scoutingData.length > 0) {
          // Get unique teams and calculate stats using selectTeam field
          const teamNumbers = [...new Set(scoutingData.map((entry: Record<string, unknown>) => entry.selectTeam?.toString()).filter(Boolean))];
          
          const teamsWithStats = teamNumbers.map(teamNumber => {
            if (!teamNumber) return null;
            const teamEntries = scoutingData.filter((entry: Record<string, unknown>) => entry.selectTeam?.toString() === teamNumber);
            
            if (teamEntries.length === 0) return null;
            
            return calculateTeamStats(teamNumber, teamEntries);
          }).filter(Boolean) as TeamStats[];
          
          // Add teams from stored event teams that might not have scouting data
          const storedEventTeams = getAllStoredEventTeams();
          const allStoredTeams = new Set<string>();
          
          // Collect all team numbers from all stored events
          Object.values(storedEventTeams).forEach(teamNumbers => {
            teamNumbers.forEach(teamNumber => allStoredTeams.add(teamNumber.toString()));
          });
          
          // Add teams that don't have scouting data but are in stored events
          allStoredTeams.forEach(teamNumber => {
            if (!teamsWithStats.find(t => t.teamNumber === teamNumber)) {
              teamsWithStats.push(createDefaultTeamStats(teamNumber));
            }
          });
          
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
    if (list && isTeamInList(team, list)) {
      toast.error(`Team ${team.teamNumber} is already in ${list.name}`);
      return;
    }

    const newItem = createPickListItem(team);

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
  const updateListTeams = (listId: number, newTeams: PickListItem[]) => {
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
  const filteredAndSortedTeams = sortTeams(
    filterTeams(availableTeams, searchFilter),
    sortBy
  );

  return (
    <div className="min-h-screen w-full flex flex-col px-4 pt-4">
      <h1 className="text-2xl font-bold px-4">Pick Lists</h1>
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto flex-1 pb-6">
        
        {/* Header */}
        <PickListHeader onExport={exportPickLists} onImport={importPickLists} />

        {/* Mobile Layout (below xl) - Tabs */}
        <div className="xl:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" enableSwipe={true}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teams">Available Teams</TabsTrigger>
              <TabsTrigger value="lists">Pick Lists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="mt-6">
              <AvailableTeamsPanel
                teams={filteredAndSortedTeams}
                pickLists={pickLists}
                searchFilter={searchFilter}
                sortBy={sortBy}
                onSearchChange={setSearchFilter}
                onSortChange={setSortBy}
                onAddTeamToList={addTeamToList}
              />
            </TabsContent>
            
            <TabsContent value="lists" className="mt-6 space-y-6">
              {/* Create New List */}
              <CreatePickList
                newListName={newListName}
                newListDescription={newListDescription}
                onNameChange={setNewListName}
                onDescriptionChange={setNewListDescription}
                onCreateList={createNewList}
              />

              {/* Pick Lists */}
              {pickLists.map(list => (
                <PickListCard
                  key={list.id}
                  pickList={list}
                  availableTeams={availableTeams}
                  canDelete={pickLists.length > 1}
                  onDeleteList={deleteList}
                  onUpdateTeams={updateListTeams}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout (xl and above) - Side by Side */}
        <div className="hidden xl:block">
          <div className="grid grid-cols-3 gap-6">
            
            {/* Available Teams Panel */}
            <AvailableTeamsPanel
              teams={filteredAndSortedTeams}
              pickLists={pickLists}
              searchFilter={searchFilter}
              sortBy={sortBy}
              onSearchChange={setSearchFilter}
              onSortChange={setSortBy}
              onAddTeamToList={addTeamToList}
            />

            {/* Pick Lists Panel */}
            <div className="col-span-2 space-y-6">
              
              {/* Create New List */}
              <CreatePickList
                newListName={newListName}
                newListDescription={newListDescription}
                onNameChange={setNewListName}
                onDescriptionChange={setNewListDescription}
                onCreateList={createNewList}
              />

              {/* Pick Lists */}
              {pickLists.map(list => (
                <PickListCard
                  key={list.id}
                  pickList={list}
                  availableTeams={availableTeams}
                  canDelete={pickLists.length > 1}
                  onDeleteList={deleteList}
                  onUpdateTeams={updateListTeams}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickListPage;