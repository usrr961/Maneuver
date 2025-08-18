import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/animate-ui/radix/tabs";
import { AlertCircle, Users, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScouterManagement } from '@/hooks/useScouterManagement';
import { getAllStoredEventTeams } from '@/lib/tbaUtils';
import { getStoredNexusTeams, getStoredPitAddresses, getStoredPitData } from '@/lib/nexusUtils';
import { ScouterManagementSection } from '@/components/PitAssignmentComponents/ScouterManagementSection.tsx';
import { TeamDisplaySection } from '@/components/PitAssignmentComponents/TeamDisplaySection';
import { AssignmentResults } from '@/components/PitAssignmentComponents/AssignmentResults';
import EventInformationCard from '@/components/PitAssignmentComponents/EventInformationCard';
import AssignmentControlsCard from '@/components/PitAssignmentComponents/AssignmentControlsCard';
import { DataAttribution } from '@/components/DataAttribution';
import type { PitAssignment } from '@/lib/pitAssignmentTypes';
import type { NexusPitMap } from '@/lib/nexusUtils';

const PitAssignmentsPage: React.FC = () => {
  const { scoutersList } = useScouterManagement();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [eventTeams, setEventTeams] = useState<{ [eventKey: string]: number[] }>({});
  const [teamDataSource, setTeamDataSource] = useState<{ [eventKey: string]: 'nexus' | 'tba' }>({});
  const [pitAddresses, setPitAddresses] = useState<{ [teamNumber: string]: string } | null>(null);
  const [pitMapData, setPitMapData] = useState<NexusPitMap | null>(null);
  const [assignments, setAssignments] = useState<PitAssignment[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'sequential' | 'spatial' | 'manual'>('sequential');
  const [activeTab, setActiveTab] = useState<string>('teams');
  const [selectedScouterForAssignment, setSelectedScouterForAssignment] = useState<string | null>(null);
  const [assignmentsConfirmed, setAssignmentsConfirmed] = useState<boolean>(false);



  // Load stored teams from all events, prioritizing Nexus over TBA
  useEffect(() => {
    const tbaTeams = getAllStoredEventTeams();
    const combinedTeams: { [eventKey: string]: number[] } = {};
    const sourceTracking: { [eventKey: string]: 'nexus' | 'tba' } = {};
    
    // First, get all possible event keys from both TBA and Nexus sources
    const allEventKeys = new Set<string>();
    
    // Add TBA event keys
    Object.keys(tbaTeams).forEach(eventKey => allEventKeys.add(eventKey));
    
    // Add Nexus event keys by scanning localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexus_event_teams_')) {
        const eventKey = key.replace('nexus_event_teams_', '');
        allEventKeys.add(eventKey);
      }
    }
    
    // Now process each event key, prioritizing Nexus over TBA
    allEventKeys.forEach(eventKey => {
      const nexusTeams = getStoredNexusTeams(eventKey);
      const tbaTeamsForEvent = tbaTeams[eventKey];
      
      // Check for Nexus teams first (priority)
      if (nexusTeams && nexusTeams.length > 0) {
        // Convert from frc format to numbers (frc123 -> 123)
        const teamNumbers = nexusTeams
          .map(teamKey => teamKey.startsWith('frc') ? parseInt(teamKey.substring(3)) : parseInt(teamKey))
          .filter(num => !isNaN(num))
          .sort((a, b) => a - b);
        
        if (teamNumbers.length > 0) {
          combinedTeams[eventKey] = teamNumbers;
          sourceTracking[eventKey] = 'nexus';
          return; // Use Nexus data, skip TBA check
        }
      }
      
      // Fallback to TBA teams if no valid Nexus teams
      if (tbaTeamsForEvent && tbaTeamsForEvent.length > 0) {
        combinedTeams[eventKey] = tbaTeamsForEvent;
        sourceTracking[eventKey] = 'tba';
      }
    });
    
    setEventTeams(combinedTeams);
    setTeamDataSource(sourceTracking);
    setAvailableEvents(Array.from(allEventKeys));
    
    // Auto-select the first event, prioritizing Nexus events
    const eventKeys = Array.from(allEventKeys);
    const nexusEventKeys = eventKeys.filter(key => {
      const teams = getStoredNexusTeams(key);
      return teams && teams.length > 0;
    });
    
    if (nexusEventKeys.length > 0) {
      setSelectedEvent(nexusEventKeys[0]); // Prefer Nexus events
    } else if (eventKeys.length > 0) {
      setSelectedEvent(eventKeys[0]); // Fallback to any available event
    }
  }, []);

  // Load pit addresses and map data when event changes and uses Nexus data
  useEffect(() => {
    if (selectedEvent && teamDataSource[selectedEvent] === 'nexus') {
      const addresses = getStoredPitAddresses(selectedEvent);
      const pitData = getStoredPitData(selectedEvent);
      setPitAddresses(addresses);
      setPitMapData(pitData.map);
    } else {
      setPitAddresses(null);
      setPitMapData(null);
    }
  }, [selectedEvent, teamDataSource]);

  const currentTeams = selectedEvent ? eventTeams[selectedEvent] || [] : [];

  const handleAssignmentModeChange = (mode: 'sequential' | 'spatial' | 'manual') => {
    setAssignmentMode(mode);
    setSelectedScouterForAssignment(null); // Clear selection when switching modes
    setAssignmentsConfirmed(false); // Reset confirmed state
  };

  const handleAssignmentsGenerated = (newAssignments: PitAssignment[], confirmed: boolean) => {
    setAssignments(newAssignments);
    setAssignmentsConfirmed(confirmed);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pit Assignments</h1>
            <p className="text-muted-foreground">
              Manage scouters and assign teams for pit scouting
            </p>
          </div>
          {/* Data source attribution */}
          <div className="hidden md:block">
            <DataAttribution 
              sources={selectedEvent && teamDataSource[selectedEvent] ? [teamDataSource[selectedEvent]] : ['tba', 'nexus']} 
              variant="full" 
            />
          </div>
        </div>
        {/* Mobile attribution */}
        <div className="md:hidden mt-2">
          <DataAttribution 
            sources={selectedEvent && teamDataSource[selectedEvent] ? [teamDataSource[selectedEvent]] : ['tba', 'nexus']} 
            variant="compact" 
          />
        </div>
      </div>

      {/* Scouter Management - Moved to top */}
      <ScouterManagementSection />

      {/* Event Information and Assignment Controls - Side by side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Event Information */}
        <EventInformationCard
          eventTeams={eventTeams}
          availableEvents={availableEvents}
          selectedEvent={selectedEvent}
          teamDataSource={teamDataSource}
          currentTeams={currentTeams}
          pitAddresses={pitAddresses}
          onEventChange={setSelectedEvent}
        />

        {/* Assignment Controls */}
        {hasValidData && (
          <AssignmentControlsCard
            assignmentMode={assignmentMode}
            pitMapData={pitMapData}
            pitAddresses={pitAddresses}
            currentTeams={currentTeams}
            scoutersList={scoutersList}
            selectedEvent={selectedEvent}
            hasAssignments={hasAssignments}
            onAssignmentModeChange={handleAssignmentModeChange}
            onAssignmentsGenerated={handleAssignmentsGenerated}
          />
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
                pitAddresses={pitAddresses}
                pitMapData={pitMapData}
                teamDataSource={teamDataSource[selectedEvent]}
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
                pitAddresses={pitAddresses}
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
