/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs";
import { Progress } from "@/components/ui/progress";
import { ChevronDownIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AutoStartPositionMap from "@/components/TeamStatsComponents/AutoStartPositionMap";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";
import LogoNotFound from "../assets/Logo Not Found.png";

interface ScoutingEntry {
  matchNumber: string;
  alliance: string;
  scouterInitials: string;
  selectTeam: string;
  eventName: string;
  startPoses0: boolean;
  startPoses1: boolean;
  startPoses2: boolean;
  startPoses3: boolean;
  startPoses4: boolean;
  startPoses5: boolean;
  autoCoralPlaceL1Count: number;
  autoCoralPlaceL2Count: number;
  autoCoralPlaceL3Count: number;
  autoCoralPlaceL4Count: number;
  autoCoralPlaceDropMissCount: number;

  autoCoralPickPreloadCount: number;
  autoCoralPickStationCount: number;
  autoCoralPickMark1Count: number;
  autoCoralPickMark2Count: number;
  autoCoralPickMark3Count: number;

  autoAlgaePlaceNetShot: number;
  autoAlgaePlaceProcessor: number;
  autoAlgaePlaceDropMiss: number;
  autoAlgaePlaceRemove: number;

  autoAlgaePickReefCount: number;
  autoAlgaePickMark1Count: number;
  autoAlgaePickMark2Count: number;
  autoAlgaePickMark3Count: number;

  autoPassedStartLine: boolean;

  teleopCoralPlaceL1Count: number;
  teleopCoralPlaceL2Count: number;
  teleopCoralPlaceL3Count: number;
  teleopCoralPlaceL4Count: number;
  teleopCoralPlaceDropMissCount: number;
  teleopCoralPickStationCount: number;
  teleopCoralPickCarpetCount: number;

  teleopAlgaePlaceNetShot: number;
  teleopAlgaePlaceProcessor: number;
  teleopAlgaePlaceDropMiss: number;
  teleopAlgaePlaceRemove: number;
  teleopAlgaePickReefCount: number;
  teleopAlgaePickCarpetCount: number;

  shallowClimbAttempted: boolean;
  deepClimbAttempted: boolean;
  parkAttempted: boolean;
  climbFailed: boolean;

  playedDefense: boolean;
  brokeDown: boolean;
  comment: string;
}

interface TeamStats {
  matchesPlayed: number;

  avgAutoCoralL1: number;
  avgAutoCoralL2: number;
  avgAutoCoralL3: number;
  avgAutoCoralL4: number;
  avgTeleopCoralL1: number;
  avgTeleopCoralL2: number;
  avgTeleopCoralL3: number;
  avgTeleopCoralL4: number;
  avgAutoAlgaeNet: number;
  avgAutoAlgaeProcessor: number;
  avgTeleopAlgaeNet: number;
  avgTeleopAlgaeProcessor: number;

  avgTotalPoints: number;
  avgAutoPoints: number;
  avgTeleopPoints: number;
  avgEndgamePoints: number;

  mobilityRate: number;
  climbRate: number;
  defenseRate: number;
  breakdownRate: number;

  shallowClimbRate: number;
  deepClimbRate: number;
  parkRate: number;
  climbFailRate: number;

  startPositions: {
    position0: number;
    position1: number;
    position2: number;
    position3: number;
    position4: number;
    position5: number;
  };

  matchResults: {
    matchNumber: string;
    alliance: string;
    eventName: string;
    totalPoints: number;
    autoPoints: number;
    teleopPoints: number;
    endgamePoints: number;
    climbed: boolean;
    brokeDown: boolean;
    startPosition: number;
    comment: string;
  }[];
}

const TeamStatsPage = () => {
  const [scoutingData, setScoutingData] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [compareTeam, setCompareTeam] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [compareStats, setCompareStats] = useState<TeamStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load scouting data using the new deduplication utilities
    const loadData = async () => {
      try {
        const data = await loadLegacyScoutingData();
        setScoutingData(data);
        
        // Get unique event names
        const events = [...new Set(data.map((entry: Record<string, unknown>) => entry.eventName?.toString()).filter(Boolean))];
        events.sort();
        setAvailableEvents(events as string[]);
      } catch (error) {
        console.error("Error loading scouting data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Update available teams based on selected event
    let filteredData = scoutingData;
    
    if (selectedEvent && selectedEvent !== "all") {
      filteredData = scoutingData.filter((entry: Record<string, unknown>) => entry.eventName?.toString() === selectedEvent);
    }
    
    const teams = [...new Set(filteredData.map((entry: Record<string, unknown>) => entry.selectTeam?.toString()).filter(Boolean))];
    teams.sort((a, b) => Number(a) - Number(b));
    setAvailableTeams(teams as string[]);
    
    // Reset team selections if current selections are no longer available
    if (selectedTeam && !teams.includes(selectedTeam)) {
      setSelectedTeam("");
    }
    if (compareTeam && compareTeam !== "none" && !teams.includes(compareTeam)) {
      setCompareTeam("none");
    }
  }, [scoutingData, selectedEvent, selectedTeam, compareTeam]);

  const parseScoutingEntry = (dataObject: Record<string, unknown>): ScoutingEntry => {
    // Convert object properties to ScoutingEntry structure
    return {
      matchNumber: dataObject.matchNumber?.toString() || "",
      alliance: dataObject.alliance?.toString() || "",
      scouterInitials: dataObject.scouterInitials?.toString() || "",
      selectTeam: dataObject.selectTeam?.toString() || "",
      eventName: dataObject.eventName?.toString() || "",
      startPoses0: Boolean(dataObject.startPoses0),
      startPoses1: Boolean(dataObject.startPoses1),
      startPoses2: Boolean(dataObject.startPoses2),
      startPoses3: Boolean(dataObject.startPoses3),
      startPoses4: Boolean(dataObject.startPoses4),
      startPoses5: Boolean(dataObject.startPoses5),
      autoCoralPlaceL1Count: Number(dataObject.autoCoralPlaceL1Count) || 0,
      autoCoralPlaceL2Count: Number(dataObject.autoCoralPlaceL2Count) || 0,
      autoCoralPlaceL3Count: Number(dataObject.autoCoralPlaceL3Count) || 0,
      autoCoralPlaceL4Count: Number(dataObject.autoCoralPlaceL4Count) || 0,
      autoCoralPlaceDropMissCount: Number(dataObject.autoCoralPlaceDropMissCount) || 0,
      autoCoralPickPreloadCount: Number(dataObject.autoCoralPickPreloadCount) || 0,
      autoCoralPickStationCount: Number(dataObject.autoCoralPickStationCount) || 0,
      autoCoralPickMark1Count: Number(dataObject.autoCoralPickMark1Count) || 0,
      autoCoralPickMark2Count: Number(dataObject.autoCoralPickMark2Count) || 0,
      autoCoralPickMark3Count: Number(dataObject.autoCoralPickMark3Count) || 0,
      autoAlgaePlaceNetShot: Number(dataObject.autoAlgaePlaceNetShot) || 0,
      autoAlgaePlaceProcessor: Number(dataObject.autoAlgaePlaceProcessor) || 0,
      autoAlgaePlaceDropMiss: Number(dataObject.autoAlgaePlaceDropMiss) || 0,
      autoAlgaePlaceRemove: Number(dataObject.autoAlgaePlaceRemove) || 0,
      autoAlgaePickReefCount: Number(dataObject.autoAlgaePickReefCount) || 0,
      autoAlgaePickMark1Count: Number(dataObject.autoAlgaePickMark1Count) || 0,
      autoAlgaePickMark2Count: Number(dataObject.autoAlgaePickMark2Count) || 0,
      autoAlgaePickMark3Count: Number(dataObject.autoAlgaePickMark3Count) || 0,
      autoPassedStartLine: Boolean(dataObject.autoPassedStartLine),
      teleopCoralPlaceL1Count: Number(dataObject.teleopCoralPlaceL1Count) || 0,
      teleopCoralPlaceL2Count: Number(dataObject.teleopCoralPlaceL2Count) || 0,
      teleopCoralPlaceL3Count: Number(dataObject.teleopCoralPlaceL3Count) || 0,
      teleopCoralPlaceL4Count: Number(dataObject.teleopCoralPlaceL4Count) || 0,
      teleopCoralPlaceDropMissCount: Number(dataObject.teleopCoralPlaceDropMissCount) || 0,
      teleopCoralPickStationCount: Number(dataObject.teleopCoralPickStationCount) || 0,
      teleopCoralPickCarpetCount: Number(dataObject.teleopCoralPickCarpetCount) || 0,
      teleopAlgaePlaceNetShot: Number(dataObject.teleopAlgaePlaceNetShot) || 0,
      teleopAlgaePlaceProcessor: Number(dataObject.teleopAlgaePlaceProcessor) || 0,
      teleopAlgaePlaceDropMiss: Number(dataObject.teleopAlgaePlaceDropMiss) || 0,
      teleopAlgaePlaceRemove: Number(dataObject.teleopAlgaePlaceRemove) || 0,
      teleopAlgaePickReefCount: Number(dataObject.teleopAlgaePickReefCount) || 0,
      teleopAlgaePickCarpetCount: Number(dataObject.teleopAlgaePickCarpetCount) || 0,
      shallowClimbAttempted: Boolean(dataObject.shallowClimbAttempted),
      deepClimbAttempted: Boolean(dataObject.deepClimbAttempted),
      parkAttempted: Boolean(dataObject.parkAttempted),
      climbFailed: Boolean(dataObject.climbFailed),
      playedDefense: Boolean(dataObject.playedDefense),
      brokeDown: Boolean(dataObject.brokeDown),
      comment: dataObject.comment?.toString() || ""
    };
  };

  const calculateTeamStats = useCallback((teamNumber: string): TeamStats | null => {
    if (!teamNumber) return null;

    let teamDataObjects = scoutingData.filter((dataObject: Record<string, unknown>) => dataObject.selectTeam?.toString() === teamNumber);
    
    // Filter by event if one is selected
    if (selectedEvent && selectedEvent !== "all") {
      teamDataObjects = teamDataObjects.filter((dataObject: Record<string, unknown>) => dataObject.eventName?.toString() === selectedEvent);
    }
    
    if (teamDataObjects.length === 0) {
      return null;
    }

    const teamEntries = teamDataObjects.map(parseScoutingEntry);
    const matchCount = teamEntries.length;

    // Calculate averages
    const totals = teamEntries.reduce((acc, entry) => {
      // Auto coral
      acc.autoCoralL1 += entry.autoCoralPlaceL1Count;
      acc.autoCoralL2 += entry.autoCoralPlaceL2Count;
      acc.autoCoralL3 += entry.autoCoralPlaceL3Count;
      acc.autoCoralL4 += entry.autoCoralPlaceL4Count;
      

      acc.teleopCoralL1 += entry.teleopCoralPlaceL1Count;
      acc.teleopCoralL2 += entry.teleopCoralPlaceL2Count;
      acc.teleopCoralL3 += entry.teleopCoralPlaceL3Count;
      acc.teleopCoralL4 += entry.teleopCoralPlaceL4Count;
      

      acc.autoAlgaeNet += entry.autoAlgaePlaceNetShot;
      acc.autoAlgaeProcessor += entry.autoAlgaePlaceProcessor;
      

      acc.teleopAlgaeNet += entry.teleopAlgaePlaceNetShot;
      acc.teleopAlgaeProcessor += entry.teleopAlgaePlaceProcessor;
      
      // Counts
      acc.mobility += entry.autoPassedStartLine ? 1 : 0;
      acc.defense += entry.playedDefense ? 1 : 0;
      acc.breakdown += entry.brokeDown ? 1 : 0;
      acc.shallowClimb += entry.shallowClimbAttempted ? 1 : 0;
      acc.deepClimb += entry.deepClimbAttempted ? 1 : 0;
      acc.park += entry.parkAttempted ? 1 : 0;
      acc.climbFail += entry.climbFailed ? 1 : 0;
      

      acc.startPos0 += entry.startPoses0 ? 1 : 0;
      acc.startPos1 += entry.startPoses1 ? 1 : 0;
      acc.startPos2 += entry.startPoses2 ? 1 : 0;
      acc.startPos3 += entry.startPoses3 ? 1 : 0;
      acc.startPos4 += entry.startPoses4 ? 1 : 0;
      acc.startPos5 += entry.startPoses5 ? 1 : 0;
      
      return acc;
    }, {
      autoCoralL1: 0, autoCoralL2: 0, autoCoralL3: 0, autoCoralL4: 0,
      teleopCoralL1: 0, teleopCoralL2: 0, teleopCoralL3: 0, teleopCoralL4: 0,
      autoAlgaeNet: 0, autoAlgaeProcessor: 0, teleopAlgaeNet: 0, teleopAlgaeProcessor: 0,
      mobility: 0, defense: 0, breakdown: 0, shallowClimb: 0, deepClimb: 0, park: 0, climbFail: 0,
      startPos0: 0, startPos1: 0, startPos2: 0, startPos3: 0, startPos4: 0, startPos5: 0
    });

    // Calculate match results with points
    const matchResults = teamEntries.map(entry => {
      // Auto points
      const autoCoralPoints = (entry.autoCoralPlaceL1Count * 3) + (entry.autoCoralPlaceL2Count * 4) + 
                           (entry.autoCoralPlaceL3Count * 6) + (entry.autoCoralPlaceL4Count * 7);
      const autoAlgaePoints = (entry.autoAlgaePlaceNetShot * 4) + (entry.autoAlgaePlaceProcessor * 2);
      const autoMobilityPoints = entry.autoPassedStartLine ? 3 : 0;
      const autoPoints = autoCoralPoints + autoAlgaePoints + autoMobilityPoints;
      
      // Teleop points
      const teleopCoralPoints = (entry.teleopCoralPlaceL1Count * 2) + (entry.teleopCoralPlaceL2Count * 3) + 
                             (entry.teleopCoralPlaceL3Count * 4) + (entry.teleopCoralPlaceL4Count * 5);
      const teleopAlgaePoints = (entry.teleopAlgaePlaceNetShot * 4) + (entry.teleopAlgaePlaceProcessor * 2);
      const teleopPoints = teleopCoralPoints + teleopAlgaePoints;
      
      let endgamePoints = 0;
      if ((entry.parkAttempted && !entry.climbFailed) || (entry.shallowClimbAttempted && entry.climbFailed) || (entry.deepClimbAttempted && entry.climbFailed)) endgamePoints += 2;
      if (entry.shallowClimbAttempted && !entry.climbFailed) endgamePoints += 6;
      if (entry.deepClimbAttempted && !entry.climbFailed) endgamePoints += 12;
      
      // Determine start position
      let startPosition = -1;
      if (entry.startPoses0) startPosition = 0;
      else if (entry.startPoses1) startPosition = 1;
      else if (entry.startPoses2) startPosition = 2;
      else if (entry.startPoses3) startPosition = 3;
      else if (entry.startPoses4) startPosition = 4;
      else if (entry.startPoses5) startPosition = 5;
      
      return {
        matchNumber: entry.matchNumber,
        alliance: entry.alliance,
        eventName: entry.eventName,
        totalPoints: autoPoints + teleopPoints + endgamePoints,
        autoPoints,
        teleopPoints,
        endgamePoints,
        climbed: (entry.shallowClimbAttempted || entry.deepClimbAttempted) && !entry.climbFailed,
        brokeDown: entry.brokeDown,
        startPosition,
        comment: entry.comment
      };
    });

    // Calculate average points
    const avgAutoPoints = matchResults.reduce((sum, match) => sum + match.autoPoints, 0) / matchCount;
    const avgTeleopPoints = matchResults.reduce((sum, match) => sum + match.teleopPoints, 0) / matchCount;
    const avgEndgamePoints = matchResults.reduce((sum, match) => sum + match.endgamePoints, 0) / matchCount;

    return {
      matchesPlayed: matchCount,
      avgAutoCoralL1: Math.round((totals.autoCoralL1 / matchCount) * 10) / 10,
      avgAutoCoralL2: Math.round((totals.autoCoralL2 / matchCount) * 10) / 10,
      avgAutoCoralL3: Math.round((totals.autoCoralL3 / matchCount) * 10) / 10,
      avgAutoCoralL4: Math.round((totals.autoCoralL4 / matchCount) * 10) / 10,
      avgTeleopCoralL1: Math.round((totals.teleopCoralL1 / matchCount) * 10) / 10,
      avgTeleopCoralL2: Math.round((totals.teleopCoralL2 / matchCount) * 10) / 10,
      avgTeleopCoralL3: Math.round((totals.teleopCoralL3 / matchCount) * 10) / 10,
      avgTeleopCoralL4: Math.round((totals.teleopCoralL4 / matchCount) * 10) / 10,
      avgAutoAlgaeNet: Math.round((totals.autoAlgaeNet / matchCount) * 10) / 10,
      avgAutoAlgaeProcessor: Math.round((totals.autoAlgaeProcessor / matchCount) * 10) / 10,
      avgTeleopAlgaeNet: Math.round((totals.teleopAlgaeNet / matchCount) * 10) / 10,
      avgTeleopAlgaeProcessor: Math.round((totals.teleopAlgaeProcessor / matchCount) * 10) / 10,
      avgTotalPoints: Math.round((avgAutoPoints + avgTeleopPoints + avgEndgamePoints) * 10) / 10,
      avgAutoPoints: Math.round(avgAutoPoints * 10) / 10,
      avgTeleopPoints: Math.round(avgTeleopPoints * 10) / 10,
      avgEndgamePoints: Math.round(avgEndgamePoints * 10) / 10,
      mobilityRate: Math.round((totals.mobility / matchCount) * 100),
      climbRate: Math.round(((totals.shallowClimb + totals.deepClimb - totals.climbFail) / matchCount) * 100),
      defenseRate: Math.round((totals.defense / matchCount) * 100),
      breakdownRate: Math.round((totals.breakdown / matchCount) * 100),
      shallowClimbRate: Math.round((totals.shallowClimb / matchCount) * 100),
      deepClimbRate: Math.round((totals.deepClimb / matchCount) * 100),
      parkRate: Math.round((totals.park / matchCount) * 100),
      climbFailRate: Math.round((totals.climbFail / matchCount) * 100),
      startPositions: {
        position0: Math.round((totals.startPos0 / matchCount) * 100),
        position1: Math.round((totals.startPos1 / matchCount) * 100),
        position2: Math.round((totals.startPos2 / matchCount) * 100),
        position3: Math.round((totals.startPos3 / matchCount) * 100),
        position4: Math.round((totals.startPos4 / matchCount) * 100),
        position5: Math.round((totals.startPos5 / matchCount) * 100)
      },
      matchResults: matchResults.sort((a, b) => Number(a.matchNumber) - Number(b.matchNumber))
    };
  }, [scoutingData, selectedEvent]);

  useEffect(() => {
    if (selectedTeam) {
      const stats = calculateTeamStats(selectedTeam);
      setTeamStats(stats);
    } else {
      setTeamStats(null);
    }
  }, [selectedTeam, scoutingData, calculateTeamStats]);

  useEffect(() => {
    if (compareTeam && compareTeam !== "none") {
      const stats = calculateTeamStats(compareTeam);
      setCompareStats(stats);
    } else {
      setCompareStats(null);
    }
  }, [compareTeam, scoutingData, calculateTeamStats]);

  const StatCard = ({ title, value, subtitle, color = "blue", compareValue }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    color?: string;
    compareValue?: number;
  }) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const diff = compareValue !== undefined ? numValue - compareValue : undefined;
    
    return (
      <Card className="p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            {diff !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </Card>
    );
  };

  const ProgressCard = ({ title, value, suffix = "%", compareValue }: { 
    title: string; 
    value: number; 
    max?: number; 
    suffix?: string;
    compareValue?: number;
  }) => {
    const diff = compareValue !== undefined ? value - compareValue : undefined;
    
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{value}{suffix}</p>
              {diff !== undefined && (
                <span className={`text-xs font-medium ${
                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  ({diff > 0 ? '+' : ''}{diff}{suffix})
                </span>
              )}
            </div>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      </Card>
    );
  };

  // Responsive Team Selector Component
  const TeamSelector = ({ 
    label, 
    value, 
    onValueChange,
    availableOptions,
    placeholder 
  }: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    availableOptions: string[];
    placeholder: string;
  }) => {
    if (isMobile) {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-40 justify-between"
            >
              <span className="truncate">
                {value === "all" ? "All events" : 
                 value === "none" ? "None" :
                 value && value !== "none" ? 
                   (availableOptions.includes("all") ? value : `Team ${value}`) : 
                   placeholder}
              </span>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>{label}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-2">
                {availableOptions.includes("all") && (
                  <SheetClose asChild>
                    <Button 
                      variant={value === "all" ? "default" : "outline"}
                      className="w-full justify-start h-12 px-4"
                      onClick={() => onValueChange("all")}
                    >
                      All events
                    </Button>
                  </SheetClose>
                )}
                {availableOptions.includes("none") && (
                  <SheetClose asChild>
                    <Button 
                      variant={(!value || value === "none") ? "default" : "outline"}
                      className="w-full justify-start h-12 px-4"
                      onClick={() => onValueChange("none")}
                    >
                      None
                    </Button>
                  </SheetClose>
                )}
                {availableOptions.filter(option => option !== "all" && option !== "none").map((option) => (
                  <SheetClose key={option} asChild>
                    <Button 
                      variant={value === option ? "default" : "outline"}
                      className="w-full justify-start h-12 px-4"
                      onClick={() => onValueChange(option)}
                    >
                      {availableOptions.includes("all") ? option : `Team ${option}`}
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
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.includes("all") && <SelectItem value="all">All events</SelectItem>}
          {availableOptions.includes("none") && <SelectItem value="none">None</SelectItem>}
          {availableOptions.filter(option => option !== "all" && option !== "none").map((option) => (
            <SelectItem key={option} value={option}>
              {availableOptions.includes("all") ? option : `Team ${option}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 pt-4 pb-6">
      <div className="flex flex-col items-center gap-6 max-w-7xl w-full">
        
        {/* Header */}
        <div className="w-full pt-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium">Select Team:</label>
              <TeamSelector
                label="Select Team"
                value={selectedTeam}
                onValueChange={setSelectedTeam}
                availableOptions={availableTeams}
                placeholder="Choose team"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Compare to:</label>
              <TeamSelector
                label="Compare Team"
                value={compareTeam}
                onValueChange={setCompareTeam}
                availableOptions={availableTeams.filter(teamNum => teamNum !== selectedTeam)}
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Event:</label>
              <TeamSelector
                label="Select Event"
                value={selectedEvent}
                onValueChange={setSelectedEvent}
                availableOptions={["all", ...availableEvents]}
                placeholder="All events"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedTeam && teamStats ? (
          <div className="w-full space-y-6">
            
            {/* Team Header */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <CardTitle className="text-2xl">Team {selectedTeam}</CardTitle>
                    {compareTeam && compareTeam !== "none" && compareStats && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-muted-foreground">vs</span>
                        <CardTitle className="text-2xl text-purple-600">Team {compareTeam}</CardTitle>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{teamStats.matchesPlayed} matches</Badge>
                      <Badge variant="default">{teamStats.avgTotalPoints} avg pts</Badge>
                    </div>
                    {compareTeam && compareTeam !== "none" && compareStats && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {compareStats.matchesPlayed} matches
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {compareStats.avgTotalPoints} avg pts
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" enableSwipe={true}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scoring">Scoring</TabsTrigger>
                <TabsTrigger value="auto">Auto Start</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Points" 
                    value={teamStats.avgTotalPoints} 
                    color="green"
                    compareValue={compareStats?.avgTotalPoints}
                  />
                  <StatCard 
                    title="Auto Points" 
                    value={teamStats.avgAutoPoints} 
                    color="blue"
                    compareValue={compareStats?.avgAutoPoints}
                  />
                  <StatCard 
                    title="Teleop Points" 
                    value={teamStats.avgTeleopPoints} 
                    color="purple"
                    compareValue={compareStats?.avgTeleopPoints}
                  />
                  <StatCard 
                    title="Endgame Points" 
                    value={teamStats.avgEndgamePoints} 
                    color="orange"
                    compareValue={compareStats?.avgEndgamePoints}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProgressCard 
                        title="Mobility Rate" 
                        value={teamStats.mobilityRate}
                        compareValue={compareStats?.mobilityRate}
                      />
                      <ProgressCard 
                        title="Climb Success Rate" 
                        value={teamStats.climbRate}
                        compareValue={compareStats?.climbRate}
                      />
                      <ProgressCard 
                        title="Defense Rate" 
                        value={teamStats.defenseRate}
                        compareValue={compareStats?.defenseRate}
                      />
                      <ProgressCard 
                        title="Breakdown Rate" 
                        value={teamStats.breakdownRate}
                        compareValue={compareStats?.breakdownRate}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Climb Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProgressCard 
                        title="Shallow Climb Rate" 
                        value={teamStats.shallowClimbRate}
                        compareValue={compareStats?.shallowClimbRate}
                      />
                      <ProgressCard 
                        title="Deep Climb Rate" 
                        value={teamStats.deepClimbRate}
                        compareValue={compareStats?.deepClimbRate}
                      />
                      <ProgressCard 
                        title="Park Rate" 
                        value={teamStats.parkRate}
                        compareValue={compareStats?.parkRate}
                      />
                      <ProgressCard 
                        title="Climb Failure Rate" 
                        value={teamStats.climbFailRate}
                        compareValue={compareStats?.climbFailRate}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Match Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {teamStats.matchResults
                        .filter(match => match.comment && match.comment.trim() !== "")
                        .map((match, index) => (
                          <div key={index} className="flex flex-col p-3 border rounded gap-2">
                            <div className="flex items-center gap-2">
                              {match.eventName && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {match.eventName}
                                </Badge>
                              )}
                              <Badge variant="outline">Match {match.matchNumber}</Badge>
                              <Badge variant={match.alliance === "red" ? "destructive" : "default"}>
                                {match.alliance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground italic">"{match.comment}"</p>
                          </div>
                        ))
                      }
                      {teamStats.matchResults.filter(match => match.comment && match.comment.trim() !== "").length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-4">
                          No comments recorded for this team's matches
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scoring Tab */}
              <TabsContent value="scoring" className="space-y-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Auto Coral Scoring</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                          title="Level 1" 
                          value={teamStats.avgAutoCoralL1} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgAutoCoralL1}
                        />
                        <StatCard 
                          title="Level 2" 
                          value={teamStats.avgAutoCoralL2} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgAutoCoralL2}
                        />
                        <StatCard 
                          title="Level 3" 
                          value={teamStats.avgAutoCoralL3} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgAutoCoralL3}
                        />
                        <StatCard 
                          title="Level 4" 
                          value={teamStats.avgAutoCoralL4} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgAutoCoralL4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Teleop Coral Scoring</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                          title="Level 1" 
                          value={teamStats.avgTeleopCoralL1} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgTeleopCoralL1}
                        />
                        <StatCard 
                          title="Level 2" 
                          value={teamStats.avgTeleopCoralL2} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgTeleopCoralL2}
                        />
                        <StatCard 
                          title="Level 3" 
                          value={teamStats.avgTeleopCoralL3} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgTeleopCoralL3}
                        />
                        <StatCard 
                          title="Level 4" 
                          value={teamStats.avgTeleopCoralL4} 
                          subtitle="avg per match"
                          compareValue={compareStats?.avgTeleopCoralL4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Auto Algae Scoring</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                          title="Net Shots" 
                          value={teamStats.avgAutoAlgaeNet} 
                          subtitle="avg per match" 
                          color="green"
                          compareValue={compareStats?.avgAutoAlgaeNet}
                        />
                        <StatCard 
                          title="Processor" 
                          value={teamStats.avgAutoAlgaeProcessor} 
                          subtitle="avg per match" 
                          color="green"
                          compareValue={compareStats?.avgAutoAlgaeProcessor}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Teleop Algae Scoring</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                          title="Net Shots" 
                          value={teamStats.avgTeleopAlgaeNet} 
                          subtitle="avg per match" 
                          color="green"
                          compareValue={compareStats?.avgTeleopAlgaeNet}
                        />
                        <StatCard 
                          title="Processor" 
                          value={teamStats.avgTeleopAlgaeProcessor} 
                          subtitle="avg per match" 
                          color="green"
                          compareValue={compareStats?.avgTeleopAlgaeProcessor}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Auto Start Tab */}
              <TabsContent value="auto" className="space-y-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Starting Position Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <AutoStartPositionMap 
                          startPositions={teamStats.startPositions}
                          matchResults={teamStats.matchResults}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Position Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                          title="Position 0" 
                          value={teamStats.startPositions.position0} 
                          subtitle="% of matches" 
                          color="red"
                          compareValue={compareStats?.startPositions.position0}
                        />
                        <StatCard 
                          title="Position 1" 
                          value={teamStats.startPositions.position1} 
                          subtitle="% of matches" 
                          color="orange"
                          compareValue={compareStats?.startPositions.position1}
                        />
                        <StatCard 
                          title="Position 2" 
                          value={teamStats.startPositions.position2} 
                          subtitle="% of matches" 
                          color="yellow"
                          compareValue={compareStats?.startPositions.position2}
                        />
                        <StatCard 
                          title="Position 3" 
                          value={teamStats.startPositions.position3} 
                          subtitle="% of matches" 
                          color="green"
                          compareValue={compareStats?.startPositions.position3}
                        />
                        <StatCard 
                          title="Position 4" 
                          value={teamStats.startPositions.position4} 
                          subtitle="% of matches" 
                          color="blue"
                          compareValue={compareStats?.startPositions.position4}
                        />
                        <StatCard 
                          title="Position 5" 
                          value={teamStats.startPositions.position5} 
                          subtitle="% of matches" 
                          color="purple"
                          compareValue={compareStats?.startPositions.position5}
                        />
                      </div>

                      <div className="mt-6">
                        <p className="text-sm font-medium mb-3">Position Auto Performance</p>
                        <div className="space-y-2">
                          {[0, 1, 2, 3, 4].map(pos => {
                            const positionMatches = teamStats.matchResults.filter(match => match.startPosition === pos);
                            const avgAutoPoints = positionMatches.length > 0 
                              ? Math.round((positionMatches.reduce((sum, match) => sum + match.autoPoints, 0) / positionMatches.length) * 10) / 10
                              : 0;
                            
                            // Calculate compare team's performance for this position
                            let compareAutoPoints = 0;
                            if (compareStats) {
                              const comparePositionMatches = compareStats.matchResults.filter(match => match.startPosition === pos);
                              compareAutoPoints = comparePositionMatches.length > 0 
                                ? Math.round((comparePositionMatches.reduce((sum, match) => sum + match.autoPoints, 0) / comparePositionMatches.length) * 10) / 10
                                : 0;
                            }
                            
                            const diff = compareStats ? avgAutoPoints - compareAutoPoints : undefined;
                            
                            return (
                              <div key={pos} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm">Position {pos}</span>
                                <div className="text-right flex items-center gap-2">
                                  <span className="text-sm font-bold">{avgAutoPoints} auto pts</span>
                                  {diff !== undefined && (
                                    <span className={`text-xs font-medium ${
                                      diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">({positionMatches.length} matches)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab - Similar updates for match results if needed */}
              <TabsContent value="performance" className="space-y-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-medium mb-3">Points by Phase</p>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <span className="text-sm font-medium">Auto</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-blue-600">{teamStats.avgAutoPoints} pts</span>
                                {compareStats && (
                                  <span className={`text-xs font-medium ${
                                    (teamStats.avgAutoPoints - compareStats.avgAutoPoints) > 0 ? 'text-green-600' : 
                                    (teamStats.avgAutoPoints - compareStats.avgAutoPoints) < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    ({(teamStats.avgAutoPoints - compareStats.avgAutoPoints) > 0 ? '+' : ''}{(teamStats.avgAutoPoints - compareStats.avgAutoPoints).toFixed(1)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded">
                              <span className="text-sm font-medium">Teleop</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-purple-600">{teamStats.avgTeleopPoints} pts</span>
                                {compareStats && (
                                  <span className={`text-xs font-medium ${
                                    (teamStats.avgTeleopPoints - compareStats.avgTeleopPoints) > 0 ? 'text-green-600' : 
                                    (teamStats.avgTeleopPoints - compareStats.avgTeleopPoints) < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    ({(teamStats.avgTeleopPoints - compareStats.avgTeleopPoints) > 0 ? '+' : ''}{(teamStats.avgTeleopPoints - compareStats.avgTeleopPoints).toFixed(1)})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                              <span className="text-sm font-medium">Endgame</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-orange-600">{teamStats.avgEndgamePoints} pts</span>
                                {compareStats && (
                                  <span className={`text-xs font-medium ${
                                    (teamStats.avgEndgamePoints - compareStats.avgEndgamePoints) > 0 ? 'text-green-600' : 
                                    (teamStats.avgEndgamePoints - compareStats.avgEndgamePoints) < 0 ? 'text-red-600' : 'text-gray-500'
                                  }`}>
                                    ({(teamStats.avgEndgamePoints - compareStats.avgEndgamePoints) > 0 ? '+' : ''}{(teamStats.avgEndgamePoints - compareStats.avgEndgamePoints).toFixed(1)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-3">Reliability Metrics</p>
                          <div className="space-y-3">
                            <ProgressCard 
                              title="Mobility Success" 
                              value={teamStats.mobilityRate}
                              compareValue={compareStats?.mobilityRate}
                            />
                            <ProgressCard 
                              title="Climb Success" 
                              value={teamStats.climbRate}
                              compareValue={compareStats?.climbRate}
                            />
                            <ProgressCard 
                              title="Breakdown Rate" 
                              value={teamStats.breakdownRate}
                              compareValue={compareStats?.breakdownRate}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Match-by-Match Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {teamStats.matchResults.map((match, index) => (
                          <div key={index} className="flex flex-col p-3 border rounded gap-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {match.eventName && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {match.eventName}
                                  </Badge>
                                )}
                                <Badge variant="outline">Match {match.matchNumber}</Badge>
                                <Badge variant={match.alliance === "red" ? "destructive" : "default"}>
                                  {match.alliance}
                                </Badge>
                                {match.startPosition >= 0 && (
                                  <Badge variant="secondary">Pos {match.startPosition}</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {match.climbed && <Badge variant="secondary">Climbed</Badge>}
                                {match.brokeDown && <Badge variant="destructive">Broke Down</Badge>}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="font-bold text-lg">{match.totalPoints} pts</div>
                              <div className="text-sm text-muted-foreground">
                                A: {match.autoPoints} | T: {match.teleopPoints} | E: {match.endgamePoints}
                              </div>
                            </div>
                            {match.comment && match.comment.trim() !== "" && (
                              <div className="text-xs text-muted-foreground italic border-t pt-2">
                                "{match.comment}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {availableTeams.length === 0 ?
              <img src={LogoNotFound} alt="No Data" className="mb-4 dark:invert" /> : null}
              <p className="text-lg text-muted-foreground mb-4">
                {availableTeams.length === 0 ? "No scouting data available" : "Select a team to view analysis"}
              </p>
              {availableTeams.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Scout some matches first to see team statistics
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeamStatsPage;