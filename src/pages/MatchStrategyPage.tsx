/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/animate-ui/radix/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldCanvas from "@/components/MatchStrategyComponents/FieldCanvas";
import { AllianceCard } from "@/components/MatchStrategyComponents/AllianceCard";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";
import { createTeamStatsCalculator } from "@/lib/matchStrategyUtils";
import { clearAllStrategies, saveAllStrategyCanvases } from "@/lib/strategyCanvasUtils";

const MatchStrategyPage = () => {
  const [scoutingData, setScoutingData] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(Array(6).fill(""));
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("autonomous");
  const [matchNumber, setMatchNumber] = useState<string>("");
  const [activeStatsTab, setActiveStatsTab] = useState("overall");
  
  // Create the team stats calculator function
  const getTeamStats = createTeamStatsCalculator(scoutingData);

  useEffect(() => {
    // Load scouting data using the new deduplication utilities
    const loadData = async () => {
      try {
        const data = await loadLegacyScoutingData();
        setScoutingData(data);
        
        // Get unique team numbers from selectTeam field
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

  // Touch handlers for alliance card swipe functionality
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
      // Import haptics dynamically
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
    <div className="min-h-screen w-full flex flex-col items-start px-4 pt-6 pb-6">
      <h1 className="text-2xl font-bold">Match Strategy</h1>
      <div className="flex flex-col items-center gap-4 max-w-7xl w-full">
        {/* Header section - should scroll naturally */}
        <div className="flex md:justify-between w-full flex-wrap md:flex-nowrap gap-2 pt-4">
          <div className="flex items-center gap-2 w-full md:w-auto pb-2 md:pb-0">
            <label htmlFor="match-number" className="font-semibold whitespace-nowrap">
              Match #:
            </label>
            <Input
              id="match-number"
              type="text"
              placeholder="Optional"
              value={matchNumber}
              onChange={(e) => setMatchNumber(e.target.value)}
              className="w-24"
            />
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

                {/* Separator - Vertical on lg, horizontal on smaller screens */}
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