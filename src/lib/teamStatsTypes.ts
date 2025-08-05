export interface ScoutingEntry {
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

export interface TeamStats {
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

  matchResults: MatchResult[];
}

export interface MatchResult {
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
}
