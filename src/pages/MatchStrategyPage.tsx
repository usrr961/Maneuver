/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldCanvas from "@/components/MatchStrategyComponents/FieldCanvas";
import { AllianceCard } from "@/components/MatchStrategyComponents/AllianceCard";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";
import { loadScoutingEntriesByMatch } from "@/lib/dexieDB";
import { createTeamStatsCalculator } from "@/lib/matchStrategyUtils";
import { clearAllStrategies, saveAllStrategyCanvases } from "@/lib/strategyCanvasUtils";

const MatchStrategyPage = () => {
  const [scoutingData, setScoutingData] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(Array(6).fill(""));
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("autonomous");
  const [matchNumber, setMatchNumber] = useState<string>("");
  const [activeStatsTab, setActiveStatsTab] = useState("overall");
  const [isLookingUpMatch, setIsLookingUpMatch] = useState(false);
  
  // Create the team stats calculator function
  const getTeamStats = createTeamStatsCalculator(scoutingData);

  // Debounced match number lookup
  const lookupMatchTeams = useCallback(async (matchNum: string) => {
    if (!matchNum.trim()) return;
    
    setIsLookingUpMatch(true);
    try {
      const matchNumber = parseInt(matchNum.trim());
      
      // First check localStorage match data (from TBA API)
      const matchDataStr = localStorage.getItem("matchData");
      if (matchDataStr) {
        try {
          const matchData = JSON.parse(matchDataStr);
          const match = matchData.find((m: any) => m.matchNum === matchNumber);
          
          if (match && match.redAlliance && match.blueAlliance) {
            
            const redTeams = match.redAlliance.slice(0, 3);
            const blueTeams = match.blueAlliance.slice(0, 3);
            

            const newSelectedTeams = Array(6).fill("");
            
            for (let i = 0; i < redTeams.length && i < 3; i++) {
              newSelectedTeams[i] = redTeams[i];
            }
            
            for (let i = 0; i < blueTeams.length && i < 3; i++) {
              newSelectedTeams[i + 3] = blueTeams[i];
            }
            
            setSelectedTeams(newSelectedTeams);
            setIsLookingUpMatch(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing match data:", error);
        }
      }
      
      // Fallback: Try scouting database and legacy data (existing logic)
      const matchEntries = await loadScoutingEntriesByMatch(matchNum.trim());
      
      const legacyMatches = scoutingData.filter((entry: any) => 
        entry.matchNumber?.toString() === matchNum.trim()
      );
      
      const redTeams: string[] = [];
      const blueTeams: string[] = [];
      
      matchEntries.forEach(entry => {
        if (entry.teamNumber) {
          if (entry.alliance === "red" || entry.alliance === "redAlliance") {
            if (!redTeams.includes(entry.teamNumber)) {
              redTeams.push(entry.teamNumber);
            }
          } else if (entry.alliance === "blue" || entry.alliance === "blueAlliance") {
            if (!blueTeams.includes(entry.teamNumber)) {
              blueTeams.push(entry.teamNumber);
            }
          }
        }
      });
      
      if (matchEntries.length === 0 && legacyMatches.length > 0) {
        legacyMatches.forEach((entry: any) => {
          const teamNumber = entry.selectTeam?.toString();
          if (teamNumber) {
            if (entry.alliance === "red" || entry.alliance === "redAlliance") {
              if (!redTeams.includes(teamNumber)) {
                redTeams.push(teamNumber);
              }
            } else if (entry.alliance === "blue" || entry.alliance === "blueAlliance") {
              if (!blueTeams.includes(teamNumber)) {
                blueTeams.push(teamNumber);
              }
            }
          }
        });
      }
      
      if (redTeams.length > 0 || blueTeams.length > 0) {
        redTeams.sort((a, b) => Number(a) - Number(b));
        blueTeams.sort((a, b) => Number(a) - Number(b));
        
        const newSelectedTeams = Array(6).fill("");
        
        for (let i = 0; i < 3; i++) {
          newSelectedTeams[i] = redTeams[i] || "";
        }
        
        for (let i = 0; i < 3; i++) {
          newSelectedTeams[i + 3] = blueTeams[i] || "";
        }
        
        setSelectedTeams(newSelectedTeams);
      } else {
        console.log("No match entries found for match number:", matchNum);
      }
    } catch (error) {
      console.error("Error looking up match teams:", error);
    } finally {
      setIsLookingUpMatch(false);
    }
  }, [scoutingData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (matchNumber.trim()) {
        lookupMatchTeams(matchNumber);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [matchNumber, lookupMatchTeams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadLegacyScoutingData();
        setScoutingData(data);
        
        const matchNumbers = [...new Set(data.map((entry: Record<string, unknown>) => entry.matchNumber?.toString()).filter(Boolean))];
        console.log("Available match numbers:", matchNumbers.sort((a, b) => Number(a) - Number(b)));
        
        const teams = [...new Set(data.map((entry: Record<string, unknown>) => entry.selectTeam?.toString()).filter(Boolean))];
        teams.sort((a, b) => Number(a) - Number(b));
        setAvailableTeams(teams as string[]);
      } catch (error) {
        console.error("Error loading scouting data:", error);
      }
    };

    loadData();
  }, []);

  const handleTeamChange = (index: number, teamNumber: string) => {
    const newSelectedTeams = [...selectedTeams];
    newSelectedTeams[index] = teamNumber === "none" ? "" : teamNumber;
    setSelectedTeams(newSelectedTeams);
  };

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleAllianceCardTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleAllianceCardTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      import('@/lib/haptics').then(({ haptics }) => {
        haptics.light();
      });
      
      const tabValues = ['overall', 'auto', 'teleop', 'endgame'];
      const currentIndex = tabValues.indexOf(activeStatsTab);
      
      if (currentIndex !== -1) {
        let newIndex;
        if (deltaX > 0) {
          // Swipe right - go to previous tab
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1;
        } else {
          // Swipe left - go to next tab
          newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0;
        }
        
        const newValue = tabValues[newIndex];
        console.log(`Alliance card swipe: ${activeStatsTab} → ${newValue}`);
        setActiveStatsTab(newValue);
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold">Match Strategy</h1>
      </div>
      <div className="flex flex-col items-center gap-4 max-w-7xl w-full">
        {/* Header section */}
        <div className="flex md:justify-between w-full flex-wrap md:flex-nowrap gap-2 pt-4">
          <div className="flex items-center gap-2 w-full md:w-auto pb-2 md:pb-0">
            <label htmlFor="match-number" className="font-semibold whitespace-nowrap">
              Match #:
            </label>
            <div className="relative">
              <Input
                id="match-number"
                type="text"
                placeholder="Optional"
                value={matchNumber}
                onChange={(e) => setMatchNumber(e.target.value)}
                className="w-24"
              />
              {isLookingUpMatch && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </div>
            {matchNumber && !isLookingUpMatch && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Auto-fills from match data
              </span>
            )}
            {(() => {
              const hasMatchData = localStorage.getItem("matchData");
              if (!hasMatchData) {
                return (
                  <span className="text-xs text-orange-500 whitespace-nowrap">
                    Load match data first
                  </span>
                );
              }
              return null;
            })()}
          </div>
          <div className="flex items-center md:justify-end w-full md:w-auto gap-2">
            <Button 
              onClick={() => clearAllStrategies(setActiveTab, activeTab)} 
              variant="outline" 
              className="flex-1 md:flex-none px-3 py-2"
            >
              Clear All
            </Button>
            <Button 
              onClick={() => saveAllStrategyCanvases(matchNumber, selectedTeams)} 
              variant="outline" 
              className="flex-1 md:flex-none px-3 py-2"
            >
              Save All
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-8 w-full pb-6">
          {/* Field Strategy Tabs */}
          <Card className="w-full">
            <CardContent className="h-[500px] p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col" enableSwipe={true}>
                <TabsList className="grid w-full grid-cols-3 mb-4 flex-shrink-0">
                  <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
                  <TabsTrigger value="teleop">Teleop</TabsTrigger>
                  <TabsTrigger value="endgame">Endgame</TabsTrigger>
                </TabsList>
                
                {/* Canvas container */}
                <div className="flex-1 mt-0">
                  <TabsContent value="autonomous" className="h-full mt-0" data-stage="autonomous">
                    <FieldCanvas 
                      key="autonomous" 
                      stageId="autonomous" 
                      onStageChange={(newStageId) => setActiveTab(newStageId)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="teleop" className="h-full mt-0" data-stage="teleop">
                    <FieldCanvas 
                      key="teleop" 
                      stageId="teleop" 
                      onStageChange={(newStageId) => setActiveTab(newStageId)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="endgame" className="h-full mt-0" data-stage="endgame">
                    <FieldCanvas 
                      key="endgame" 
                      stageId="endgame" 
                      onStageChange={(newStageId) => setActiveTab(newStageId)}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Team Analysis Card - Combined Layout */}
          <Card className="w-full">
            <CardHeader>
              {/* Team Stats Tabs */}
              <Tabs value={activeStatsTab} onValueChange={setActiveStatsTab} className="w-full" enableSwipe={true}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                  <TabsTrigger value="auto">Auto</TabsTrigger>
                  <TabsTrigger value="teleop">Teleop</TabsTrigger>
                  <TabsTrigger value="endgame">Endgame</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {/* Alliance Split Layout */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Blue Alliance */}
                <AllianceCard
                  alliance="blue"
                  selectedTeams={selectedTeams}
                  availableTeams={availableTeams}
                  activeStatsTab={activeStatsTab}
                  getTeamStats={getTeamStats}
                  onTeamChange={handleTeamChange}
                  onTouchStart={handleAllianceCardTouchStart}
                  onTouchEnd={handleAllianceCardTouchEnd}
                />

                {/* Separator */}
                <div className="lg:w-px lg:bg-border lg:mx-0 lg:h-auto h-px bg-border w-full my-0 lg:my-4"></div>
                
                {/* Red Alliance */}
                <AllianceCard
                  alliance="red"
                  selectedTeams={selectedTeams}
                  availableTeams={availableTeams}
                  activeStatsTab={activeStatsTab}
                  getTeamStats={getTeamStats}
                  onTeamChange={handleTeamChange}
                  onTouchStart={handleAllianceCardTouchStart}
                  onTouchEnd={handleAllianceCardTouchEnd}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchStrategyPage;