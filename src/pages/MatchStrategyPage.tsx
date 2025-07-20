/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldCanvas from "@/components/MatchStrategyComponents/FieldCanvas";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";

interface ScoutingEntry {
  matchNumber: string;                    // index 0
  alliance: string;                       // index 1
  scouterInitials: string;               // index 2
  selectTeam: string;                    // index 3
  // Starting positions (indices 4-9)
  startPoses0: boolean;                  // index 4
  startPoses1: boolean;                  // index 5
  startPoses2: boolean;                  // index 6
  startPoses3: boolean;                  // index 7
  startPoses4: boolean;                  // index 8
  startPoses5: boolean;                  // index 9
  // Auto coral placement (indices 10-14)
  autoCoralPlaceL1Count: number;         // index 10
  autoCoralPlaceL2Count: number;         // index 11
  autoCoralPlaceL3Count: number;         // index 12
  autoCoralPlaceL4Count: number;         // index 13
  autoCoralPlaceDropMissCount: number;   // index 14
  // Auto coral pickup (indices 15-19)
  autoCoralPickPreloadCount: number;     // index 15
  autoCoralPickStationCount: number;     // index 16
  autoCoralPickMark1Count: number;       // index 17
  autoCoralPickMark2Count: number;       // index 18
  autoCoralPickMark3Count: number;       // index 19
  // Auto algae (indices 20-24)
  autoAlgaePlaceNetShot: number;         // index 20
  autoAlgaePlaceProcessor: number;       // index 21
  autoAlgaePlaceDropMiss: number;        // index 22
  autoAlgaePlaceRemove: number;          // index 23
  // Auto algae pickup (indices 24-27)
  autoAlgaePickReefCount: number;        // index 24
  autoAlgaePickMark1Count: number;       // index 25
  autoAlgaePickMark2Count: number;       // index 26
  autoAlgaePickMark3Count: number;       // index 27
  // Auto mobility (index 28)
  autoPassedStartLine: boolean;          // index 28
  // Teleop coral (indices 29-34)
  teleopCoralPlaceL1Count: number;       // index 29
  teleopCoralPlaceL2Count: number;       // index 30
  teleopCoralPlaceL3Count: number;       // index 31
  teleopCoralPlaceL4Count: number;       // index 32
  teleopCoralPlaceDropMissCount: number; // index 33
  teleopCoralPickStationCount: number;   // index 34
  teleopCoralPickCarpetCount: number;    // index 35
  // Teleop algae (indices 36-41)
  teleopAlgaePlaceNetShot: number;       // index 36
  teleopAlgaePlaceProcessor: number;     // index 37
  teleopAlgaePlaceDropMiss: number;      // index 38
  teleopAlgaePlaceRemove: number;        // index 39
  teleopAlgaePickReefCount: number;      // index 40
  teleopAlgaePickCarpetCount: number;    // index 41
  // Endgame (indices 42-46)
  shallowClimbAttempted: boolean;        // index 42
  deepClimbAttempted: boolean;           // index 43
  parkAttempted: boolean;                // index 44
  climbFailed: boolean;                  // index 45
  // Other actions (indices 46-48)
  playedDefense: boolean;                // index 46
  brokeDown: boolean;                    // index 47
  // Comments (index 48)
  comment: string;                       // index 48
}

const MatchStrategyPage = () => {
  const [scoutingData, setScoutingData] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(Array(6).fill(""));
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("autonomous");
  const [matchNumber, setMatchNumber] = useState<string>("");

  useEffect(() => {
    // Load scouting data using the new deduplication utilities
    try {
      const data = loadLegacyScoutingData();
      setScoutingData(data);
      
      // Get unique team numbers (team number is now at index 4 due to ID at index 0)
      const teams = [...new Set(data.map((entry: any[]) => entry[4]?.toString()).filter(Boolean))];
      teams.sort((a, b) => Number(a) - Number(b));
      setAvailableTeams(teams as string[]);
    } catch (error) {
      console.error("Error loading scouting data:", error);
    }
  }, []);

  const parseScoutingEntry = (dataArray: any[]): ScoutingEntry => {
    // Account for ID at index 0, so actual data starts at index 1
    return {
      matchNumber: dataArray[1]?.toString() || "",     // was 0, now 1
      alliance: dataArray[2] || "",                    // was 1, now 2
      scouterInitials: dataArray[3] || "",             // was 2, now 3
      selectTeam: dataArray[4]?.toString() || "",      // was 3, now 4
      startPoses0: dataArray[5] || false,              // was 4, now 5
      startPoses1: dataArray[6] || false,              // was 5, now 6
      startPoses2: dataArray[7] || false,              // was 6, now 7
      startPoses3: dataArray[8] || false,              // was 7, now 8
      startPoses4: dataArray[9] || false,              // was 8, now 9
      startPoses5: dataArray[10] || false,             // was 9, now 10
      autoCoralPlaceL1Count: dataArray[11] || 0,       // was 10, now 11
      autoCoralPlaceL2Count: dataArray[12] || 0,       // was 11, now 12
      autoCoralPlaceL3Count: dataArray[13] || 0,       // was 12, now 13
      autoCoralPlaceL4Count: dataArray[14] || 0,       // was 13, now 14
      autoCoralPlaceDropMissCount: dataArray[15] || 0, // was 14, now 15
      autoCoralPickPreloadCount: dataArray[16] || 0,   // was 15, now 16
      autoCoralPickStationCount: dataArray[17] || 0,   // was 16, now 17
      autoCoralPickMark1Count: dataArray[18] || 0,     // was 17, now 18
      autoCoralPickMark2Count: dataArray[19] || 0,     // was 18, now 19
      autoCoralPickMark3Count: dataArray[20] || 0,     // was 19, now 20
      autoAlgaePlaceNetShot: dataArray[21] || 0,       // was 20, now 21
      autoAlgaePlaceProcessor: dataArray[22] || 0,     // was 21, now 22
      autoAlgaePlaceDropMiss: dataArray[23] || 0,      // was 22, now 23
      autoAlgaePlaceRemove: dataArray[24] || 0,           // was 23, now 24
      autoAlgaePickReefCount: dataArray[25] || 0,         // was 24, now 25
      autoAlgaePickMark1Count: dataArray[26] || 0,        // was 25, now 26
      autoAlgaePickMark2Count: dataArray[27] || 0,        // was 26, now 27
      autoAlgaePickMark3Count: dataArray[28] || 0,        // was 27, now 28
      autoPassedStartLine: dataArray[29] || false,        // was 28, now 29
      teleopCoralPlaceL1Count: dataArray[30] || 0,        // was 29, now 30
      teleopCoralPlaceL2Count: dataArray[31] || 0,        // was 30, now 31
      teleopCoralPlaceL3Count: dataArray[32] || 0,        // was 31, now 32
      teleopCoralPlaceL4Count: dataArray[33] || 0,        // was 32, now 33
      teleopCoralPlaceDropMissCount: dataArray[34] || 0,  // was 33, now 34
      teleopCoralPickStationCount: dataArray[35] || 0,    // was 34, now 35
      teleopCoralPickCarpetCount: dataArray[36] || 0,     // was 35, now 36
      teleopAlgaePlaceNetShot: dataArray[37] || 0,        // was 36, now 37
      teleopAlgaePlaceProcessor: dataArray[38] || 0,      // was 37, now 38
      teleopAlgaePlaceDropMiss: dataArray[39] || 0,       // was 38, now 39
      teleopAlgaePlaceRemove: dataArray[40] || 0,         // was 39, now 40
      teleopAlgaePickReefCount: dataArray[41] || 0,       // was 40, now 41
      teleopAlgaePickCarpetCount: dataArray[42] || 0,     // was 41, now 42
      shallowClimbAttempted: dataArray[43] || false,      // was 42, now 43
      deepClimbAttempted: dataArray[44] || false,         // was 43, now 44
      parkAttempted: dataArray[45] || false,              // was 44, now 45
      climbFailed: dataArray[46] || false,                // was 45, now 46
      playedDefense: dataArray[47] || false,              // was 46, now 47
      brokeDown: dataArray[48] || false,                  // was 47, now 48
      comment: dataArray[49] || ""                        // was 48, now 49
    };
  };

  const getTeamStats = (teamNumber: string) => {
    if (!teamNumber) return null;

    const teamDataArrays = scoutingData.filter(dataArray => dataArray[4]?.toString() === teamNumber); // was index 3, now 4
    
    if (teamDataArrays.length === 0) {
      return {
        matchesPlayed: 0,
        totalPiecesScored: 0,
        avgTotalPoints: 0,
        climbRate: 0
      };
    }

    const teamEntries = teamDataArrays.map(parseScoutingEntry);

    // Calculate total pieces scored (coral placed + algae placed)
    const totalPiecesScored = teamEntries.reduce((sum, entry) => {
      const autoCoralScored = entry.autoCoralPlaceL1Count + entry.autoCoralPlaceL2Count + 
                           entry.autoCoralPlaceL3Count + entry.autoCoralPlaceL4Count;
      const teleopCoralScored = entry.teleopCoralPlaceL1Count + entry.teleopCoralPlaceL2Count + 
                             entry.teleopCoralPlaceL3Count + entry.teleopCoralPlaceL4Count;
      const autoAlgaeScored = entry.autoAlgaePlaceNetShot + entry.autoAlgaePlaceProcessor;
      const teleopAlgaeScored = entry.teleopAlgaePlaceNetShot + entry.teleopAlgaePlaceProcessor;
      
      return sum + autoCoralScored + teleopCoralScored + autoAlgaeScored + teleopAlgaeScored;
    }, 0);

    // Calculate average total points
    const totalPoints = teamEntries.reduce((sum, entry) => {
      // Auto points
      const autoCoralPoints = (entry.autoCoralPlaceL1Count * 3) + (entry.autoCoralPlaceL2Count * 4) + 
                           (entry.autoCoralPlaceL3Count * 6) + (entry.autoCoralPlaceL4Count * 7);
      const autoAlgaePoints = (entry.autoAlgaePlaceNetShot * 4) + (entry.autoAlgaePlaceProcessor * 2);
      const autoMobilityPoints = entry.autoPassedStartLine ? 3 : 0;
      
      // Teleop points
      const teleopCoralPoints = (entry.teleopCoralPlaceL1Count * 2) + (entry.teleopCoralPlaceL2Count * 3) + 
                             (entry.teleopCoralPlaceL3Count * 4) + (entry.teleopCoralPlaceL4Count * 5);
      const teleopAlgaePoints = (entry.teleopAlgaePlaceNetShot * 4) + (entry.teleopAlgaePlaceProcessor * 2);
      
      // Endgame points
      let endgamePoints = 0;
      if ((entry.parkAttempted && !entry.climbFailed) || (entry.shallowClimbAttempted && entry.climbFailed) || (entry.deepClimbAttempted && entry.climbFailed)) endgamePoints += 2;
      if (entry.shallowClimbAttempted && !entry.climbFailed) endgamePoints += 6;
      if (entry.deepClimbAttempted && !entry.climbFailed) endgamePoints += 12;

      return sum + autoCoralPoints + autoAlgaePoints + autoMobilityPoints + 
             teleopCoralPoints + teleopAlgaePoints + endgamePoints;
    }, 0);

    // Calculate climb rate (successful climbs)
    const climbCount = teamEntries.filter(entry => 
      (entry.shallowClimbAttempted || entry.deepClimbAttempted) && !entry.climbFailed
    ).length;

    return {
      matchesPlayed: teamEntries.length,
      totalPiecesScored: Math.round((totalPiecesScored / teamEntries.length) * 10) / 10,
      avgTotalPoints: Math.round((totalPoints / teamEntries.length) * 10) / 10,
      climbRate: Math.round((climbCount / teamEntries.length) * 100)
    };
  };

  const handleTeamChange = (index: number, teamNumber: string) => {
    const newSelectedTeams = [...selectedTeams];
    newSelectedTeams[index] = teamNumber === "none" ? "" : teamNumber;
    setSelectedTeams(newSelectedTeams);
  };

  const clearAllStrategies = () => {
    // Clear all localStorage data for the three stages
    localStorage.removeItem('fieldStrategy_autonomous');
    localStorage.removeItem('fieldStrategy_teleop');
    localStorage.removeItem('fieldStrategy_endgame');
    
    // Force refresh of all canvases by changing the activeTab and back
    const currentTab = activeTab;
    setActiveTab('');
    setTimeout(() => {
      setActiveTab(currentTab);
    }, 50);
    
    console.log('All strategy canvases cleared');
  };

  const saveAllStrategyCanvases = () => {
    // Add a small delay to ensure all canvases are rendered
    setTimeout(() => {
      // Try to get from localStorage first since it's more reliable
      const autonomousData = localStorage.getItem('fieldStrategy_autonomous');
      const teleopData = localStorage.getItem('fieldStrategy_teleop');
      const endgameData = localStorage.getItem('fieldStrategy_endgame');

      if (!autonomousData || !teleopData || !endgameData) {
        alert('Please draw on all three strategy tabs (Autonomous, Teleop, and Endgame) before saving');
        return;
      }

      // Create a new canvas to composite all three images
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) return;

      // Load all three images
      const autonomousImg = new Image();
      const teleopImg = new Image();
      const endgameImg = new Image();

      let loadedCount = 0;
      const totalImages = 3;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          // All images loaded, now composite them
          const imgWidth = autonomousImg.width;
          const imgHeight = autonomousImg.height;
          
          // Set composite canvas size (3x height for stacking + extra space for match number)
          const topMargin = matchNumber ? 60 : 40; // Extra space if match number exists
          compositeCanvas.width = imgWidth;
          compositeCanvas.height = imgHeight * 3 + topMargin;

          // Clear canvas with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

          // Add match number at the very top if provided
          if (matchNumber) {
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`Match ${matchNumber}`, imgWidth / 2, 30);
          }

          // Draw title labels for each section
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';

          // Draw Autonomous section
          ctx.fillText('AUTONOMOUS', imgWidth / 2, topMargin + 30);
          ctx.drawImage(autonomousImg, 0, topMargin + 40, imgWidth, imgHeight - 40);

          // Draw Teleop section
          ctx.fillText('TELEOP', imgWidth / 2, topMargin + imgHeight + 30);
          ctx.drawImage(teleopImg, 0, topMargin + imgHeight + 40, imgWidth, imgHeight - 40);

          // Draw Endgame section
          ctx.fillText('ENDGAME', imgWidth / 2, topMargin + (imgHeight * 2) + 30);
          ctx.drawImage(endgameImg, 0, topMargin + (imgHeight * 2) + 40, imgWidth, imgHeight - 40);

          // Add team information at the top - corrected positioning and alliance sides
          ctx.font = 'bold 16px Arial';
          const blueTeams = selectedTeams.slice(3, 6).filter(Boolean); // Blue teams (originally index 3-5)
          const redTeams = selectedTeams.slice(0, 3).filter(Boolean);  // Red teams (originally index 0-2)
          
          if (blueTeams.length > 0 || redTeams.length > 0) {
            const teamInfoY = matchNumber ? 50 : 20; // Position below match number if it exists
            
            // Blue alliance on left side
            ctx.fillStyle = '#0000ff';
            ctx.textAlign = 'left';
            ctx.fillText(`Blue: ${blueTeams.join(', ')}`, 10, teamInfoY);
            
            // Red alliance on right side
            ctx.fillStyle = '#ff0000';
            ctx.textAlign = 'right';
            ctx.fillText(`Red: ${redTeams.join(', ')}`, imgWidth - 10, teamInfoY);
          }

          // Download the composite image
          const dataURL = compositeCanvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataURL;
          const filename = matchNumber 
            ? `match-${matchNumber}-strategy-${new Date().toISOString().slice(0, 10)}.png`
            : `match-strategy-complete-${new Date().toISOString().slice(0, 10)}.png`;
          link.download = filename;
          link.click();

          console.log('Composite strategy image saved successfully');
        }
      };

      // Set up image load handlers
      autonomousImg.onload = onImageLoad;
      teleopImg.onload = onImageLoad;
      endgameImg.onload = onImageLoad;

      // Load the images
      autonomousImg.src = autonomousData;
      teleopImg.src = teleopData;
      endgameImg.src = endgameData;

    }, 100); // Small delay to ensure DOM is ready
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
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
            <Button onClick={clearAllStrategies} variant="outline" className="flex-1 md:flex-none px-3 py-2">
              Clear All
            </Button>
            <Button onClick={saveAllStrategyCanvases} variant="outline" className="flex-1 md:flex-none px-3 py-2">
              Save All
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-6 w-full pb-6">
          {/* Field Strategy Tabs */}
          <Card className="w-full">
            <CardContent className="h-[500px] p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
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

          {/* Team Analysis - Split by Alliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Red Alliance */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-600 dark:text-red-400">Red Alliance</CardTitle>
                  <div className="text-right text-sm">
                    <div className="font-bold text-lg">
                      {Math.round(selectedTeams.slice(0, 3).reduce((sum, team) => {
                        const stats = getTeamStats(team);
                        return sum + (stats?.avgTotalPoints || 0);
                      }, 0))} pts
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedTeams.slice(0, 3).filter(team => {
                        const stats = getTeamStats(team);
                        return stats && stats.climbRate > 50;
                      }).length}/3 climbers
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => {
                  const team = selectedTeams[index];
                  const stats = getTeamStats(team);

                  return (
                    <Card key={index} className="p-3 border-red-200 dark:border-red-800">
                      <div className="space-y-3">
                        {/* Team Selector */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-red-600 dark:text-red-400 min-w-0">
                            Red Team {index + 1}:
                          </label>
                          <Select 
                            value={selectedTeams[index] || "none"} 
                            onValueChange={(value) => handleTeamChange(index, value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No team</SelectItem>
                              {availableTeams.map((teamNum) => (
                                <SelectItem key={teamNum} value={teamNum}>
                                  Team {teamNum}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Team Stats */}
                        {team && stats ? (
                          <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-red-200 dark:border-red-800">
                            <div className="text-center">
                              <p className="font-medium text-xs">Avg Pieces</p>
                              <p className="text-lg font-bold text-blue-600">
                                {stats.totalPiecesScored}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-xs">Avg Points</p>
                              <p className="text-lg font-bold text-green-600">
                                {stats.avgTotalPoints}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-xs">Climb Rate</p>
                              <p className="text-lg font-bold text-purple-600">
                                {stats.climbRate}%
                              </p>
                            </div>
                            <div className="col-span-3 text-center text-xs text-muted-foreground mt-1">
                              {stats.matchesPlayed} matches played
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-muted-foreground text-sm">
                            {team ? "No data available" : "No team selected"}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            {/* Blue Alliance */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-600 dark:text-blue-400">Blue Alliance</CardTitle>
                  <div className="text-right text-sm">
                    <div className="font-bold text-lg">
                      {Math.round(selectedTeams.slice(3, 6).reduce((sum, team) => {
                        const stats = getTeamStats(team);
                        return sum + (stats?.avgTotalPoints || 0);
                      }, 0))} pts
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedTeams.slice(3, 6).filter(team => {
                        const stats = getTeamStats(team);
                        return stats && stats.climbRate > 50;
                      }).length}/3 climbers
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => {
                  const team = selectedTeams[index + 3];
                  const stats = getTeamStats(team);

                  return (
                    <Card key={index + 3} className="p-3 border-blue-200 dark:border-blue-800">
                      <div className="space-y-3">
                        {/* Team Selector */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-blue-600 dark:text-blue-400 min-w-0">
                            Blue Team {index + 1}:
                          </label>
                          <Select 
                            value={selectedTeams[index + 3] || "none"} 
                            onValueChange={(value) => handleTeamChange(index + 3, value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No team</SelectItem>
                              {availableTeams.map((teamNum) => (
                                <SelectItem key={teamNum} value={teamNum}>
                                  Team {teamNum}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Team Stats */}
                        {team && stats ? (
                          <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                            <div className="text-center">
                              <p className="font-medium text-xs">Avg Pieces</p>
                              <p className="text-lg font-bold text-blue-600">
                                {stats.totalPiecesScored}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-xs">Avg Points</p>
                              <p className="text-lg font-bold text-green-600">
                                {stats.avgTotalPoints}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-xs">Climb Rate</p>
                              <p className="text-lg font-bold text-purple-600">
                                {stats.climbRate}%
                              </p>
                            </div>
                            <div className="col-span-3 text-center text-xs text-muted-foreground mt-1">
                              {stats.matchesPlayed} matches played
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-muted-foreground text-sm">
                            {team ? "No data available" : "No team selected"}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchStrategyPage;