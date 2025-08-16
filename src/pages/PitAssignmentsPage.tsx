import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/animate-ui/radix/tabs";
import { AlertCircle, Shuffle, ClipboardList, Users, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScouterManagement } from '@/hooks/useScouterManagement';
import { getAllStoredEventTeams } from '@/lib/tbaUtils';
import { ScouterManagementSection } from '@/components/PitAssignmentComponents/ScouterManagementSection.tsx';
import { TeamDisplaySection } from '@/components/PitAssignmentComponents/TeamDisplaySection';
import { AssignmentResults } from '@/components/PitAssignmentComponents/AssignmentResults';
import type { PitAssignment } from '@/lib/pitAssignmentTypes';

const PitAssignmentsPage: React.FC = () => {
  const { scoutersList } = useScouterManagement();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [eventTeams, setEventTeams] = useState<{ [eventKey: string]: number[] }>({});
  const [assignments, setAssignments] = useState<PitAssignment[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'sequential' | 'manual'>('sequential');
  const [activeTab, setActiveTab] = useState<string>('teams');
  const [selectedScouterForAssignment, setSelectedScouterForAssignment] = useState<string | null>(null);
  const [assignmentsConfirmed, setAssignmentsConfirmed] = useState<boolean>(false);

  // Load stored teams from all events
  useEffect(() => {
    const storedTeams = getAllStoredEventTeams();
    setEventTeams(storedTeams);
    
    // Auto-select the first event if available
    const eventKeys = Object.keys(storedTeams);
    if (eventKeys.length > 0 && !selectedEvent) {
      setSelectedEvent(eventKeys[0]);
    }
  }, [selectedEvent]);

  const currentTeams = selectedEvent ? eventTeams[selectedEvent] || [] : [];

  const handleAssignScouters = () => {
    if (scoutersList.length === 0) {
      return;
    }

    const newAssignments: PitAssignment[] = [];
    
    if (assignmentMode === 'sequential') {
      // Sort teams numerically first
      const sortedTeams = [...currentTeams].sort((a, b) => a - b);
      const totalTeams = sortedTeams.length;
      const totalScouters = scoutersList.length;
      
      // Calculate block size for each scouter
      const baseBlockSize = Math.floor(totalTeams / totalScouters);
      const remainder = totalTeams % totalScouters;
      
      let teamIndex = 0;
      
      // Assign blocks to each scouter
      scoutersList.forEach((scouterName, scouterIndex) => {
        // First 'remainder' scouters get one extra team
        const blockSize = scouterIndex < remainder ? baseBlockSize + 1 : baseBlockSize;
        
        for (let i = 0; i < blockSize && teamIndex < totalTeams; i++) {
          const teamNumber = sortedTeams[teamIndex];
          newAssignments.push({
            id: `${selectedEvent}-${teamNumber}`,
            eventKey: selectedEvent,
            teamNumber,
            scouterName,
            assignedAt: Date.now(),
            completed: false
          });
          teamIndex++;
        }
      });
      
      setAssignments(newAssignments);
      setAssignmentsConfirmed(true); // Sequential assignments are automatically confirmed
    } else if (assignmentMode === 'manual') {
      // For manual mode, start with empty assignments - users will click to assign
      setAssignments([]);
      setAssignmentsConfirmed(false);
    }
  };

  const handleManualAssignment = (teamNumber: number, scouterName: string) => {
    const assignmentId = `${selectedEvent}-${teamNumber}`;
    
    setAssignments(prev => {
      // Remove any existing assignment for this team
      const filtered = prev.filter(a => a.teamNumber !== teamNumber);
      
      // Add new assignment
      return [...filtered, {
        id: assignmentId,
        eventKey: selectedEvent,
        teamNumber,
        scouterName,
        assignedAt: Date.now(),
        completed: false
      }];
    });
  };

  const handleRemoveAssignment = (teamNumber: number) => {
    setAssignments(prev => prev.filter(a => a.teamNumber !== teamNumber));
  };

  const handleClearAssignments = () => {
    setAssignments([]);
    setAssignmentsConfirmed(false);
    setSelectedScouterForAssignment(null);
  };

  const handleConfirmAssignments = () => {
    setAssignmentsConfirmed(true);
    setSelectedScouterForAssignment(null);
  };

  const handleToggleCompleted = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, completed: !assignment.completed }
        : assignment
    ));
  };

  const hasValidData = currentTeams.length > 0 && scoutersList.length > 0;
  const hasAssignments = assignments.length > 0;

  return (
    <div className="min-h-screen container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="text-start">
        <h1 className="text-3xl font-bold">Pit Assignments</h1>
        <p className="text-muted-foreground">
          Manage scouters and assign teams for pit scouting
        </p>
      </div>

      {/* Scouter Management - Moved to top */}
      <ScouterManagementSection />

      {/* Event Selection and Assignment Controls - Side by side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Event Selection */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Event Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(eventTeams).length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No team data found. Please import team lists from the TBA Data page first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Event:</label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(eventTeams).map(eventKey => (
                        <SelectItem key={eventKey} value={eventKey}>
                          {eventKey} ({eventTeams[eventKey].length} teams)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEvent && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedEvent} with {currentTeams.length} teams
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Controls */}
        {hasValidData && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Assignment Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Assignment Mode:</label>
                  <div className="flex gap-2">
                    <Button
                      variant={assignmentMode === 'sequential' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAssignmentMode('sequential');
                        setSelectedScouterForAssignment(null); // Clear selection when switching modes
                        setAssignmentsConfirmed(false); // Reset confirmed state
                      }}
                    >
                      Block Assignment
                    </Button>
                    <Button
                      variant={assignmentMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAssignmentMode('manual');
                        setSelectedScouterForAssignment(null); // Clear selection when switching modes
                        setAssignmentsConfirmed(false); // Reset confirmed state
                      }}
                    >
                      Manual Assignment
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {assignmentMode === 'sequential' 
                      ? `Block Assignment: Teams are divided into consecutive blocks, with each scouter getting ~${Math.ceil(currentTeams.length / scoutersList.length)} teams in sequence`
                      : 'Manual Assignment: Click on team cards to assign them to specific scouters one by one'
                    }
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    disabled={hasAssignments || assignmentMode !== 'sequential'}
                    onClick={handleAssignScouters}
                    className="flex items-center gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    Generate Assignments
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabbed Interface for Team Display and Assignment Results */}
      {selectedEvent && currentTeams.length > 0 && (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          enableSwipe={true}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Cards
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams">
            <div className="min-h-[600px]">
              <TeamDisplaySection 
                eventKey={selectedEvent}
                teams={currentTeams}
                assignments={assignments}
                scoutersList={scoutersList}
                onToggleCompleted={handleToggleCompleted}
                assignmentMode={assignmentMode}
                onManualAssignment={handleManualAssignment}
                onRemoveAssignment={handleRemoveAssignment}
                selectedScouterForAssignment={selectedScouterForAssignment}
                onScouterSelectionChange={setSelectedScouterForAssignment}
                onConfirmAssignments={assignmentMode === 'manual' && !assignmentsConfirmed ? handleConfirmAssignments : undefined}
                onClearAllAssignments={handleClearAssignments}
                assignmentsConfirmed={assignmentsConfirmed}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="assignments">
            <div className="min-h-[600px] max-h-[600px] overflow-y-auto">
              <AssignmentResults
                assignments={assignments}
                onToggleCompleted={handleToggleCompleted}
                onClearAllAssignments={handleClearAssignments}
                assignmentMode={assignmentMode}
                scoutersList={scoutersList}
                onManualAssignment={handleManualAssignment}
                onRemoveAssignment={handleRemoveAssignment}
                selectedScouterForAssignment={selectedScouterForAssignment}
                onScouterSelectionChange={setSelectedScouterForAssignment}
                assignmentsConfirmed={assignmentsConfirmed}
                allTeams={currentTeams}
                onConfirmAssignments={assignmentMode === 'manual' && !assignmentsConfirmed ? handleConfirmAssignments : undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Status Messages */}
      {!hasValidData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {currentTeams.length === 0 && "Please select an event with teams."}
            {scoutersList.length === 0 && " Please add scouters to create assignments."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PitAssignmentsPage;
