import { gameDB } from './dexieDB';
import { savePitScoutingEntry } from './pitScoutingUtils';
import type { PitScoutingEntry } from './pitScoutingTypes';

export const createTestScouterProfiles = async () => {
  console.log('🧪 Creating test scouter profiles...');

  const testProfiles = [
    {
      name: "Sarah Chen",
      stakes: 245,
      stakesFromPredictions: 210, // Base stakes from 42 predictions
      totalPredictions: 42,
      correctPredictions: 38,
      currentStreak: 8,
      longestStreak: 12,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 2), // 2 hours ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 7) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'accuracy_70', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'accuracy_80', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'accuracy_90', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 1) },
        { achievementId: 'streak_5', unlockedAt: Date.now() - (1000 * 60 * 60 * 12) },
        { achievementId: 'streak_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 6) },
        { achievementId: 'stakes_100', unlockedAt: Date.now() - (1000 * 60 * 60 * 2) },
      ]
    },
    {
      name: "Marcus Rodriguez",
      stakes: 180,
      stakesFromPredictions: 150, // Base stakes from 35 predictions
      totalPredictions: 35,
      correctPredictions: 28,
      currentStreak: 5,
      longestStreak: 9,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 4), // 4 hours ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 8) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 7) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'accuracy_70', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'accuracy_80', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'streak_5', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
        { achievementId: 'stakes_100', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 1) },
      ]
    },
    {
      name: "Emma Thompson",
      stakes: 95,
      stakesFromPredictions: 75, // Base stakes from 18 predictions
      totalPredictions: 18,
      correctPredictions: 12,
      currentStreak: 2,
      longestStreak: 4,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
      ]
    },
    {
      name: "Alex Kim",
      stakes: 500,
      stakesFromPredictions: 290, // Base stakes from 58 predictions
      totalPredictions: 58,
      correctPredictions: 52,
      currentStreak: 15,
      longestStreak: 18,
      lastPredictionTime: Date.now() - (1000 * 60 * 30), // 30 minutes ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 10) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 9) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 8) },
        { achievementId: 'predictions_50', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 7) },
        { achievementId: 'accuracy_70', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'accuracy_80', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'streak_5', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'streak_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
        { achievementId: 'stakes_100', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 1) },
      ]
    },
    {
      name: "Jordan Smith",
      stakes: 65,
      stakesFromPredictions: 45, // Base stakes from 12 predictions
      totalPredictions: 12,
      correctPredictions: 7,
      currentStreak: 0,
      longestStreak: 3,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 24 * 3), // 3 days ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 1) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 12) },
      ]
    },
    {
      name: "Riley Davis",
      stakes: 800,
      stakesFromPredictions: 390, // Base stakes from 78 predictions
      totalPredictions: 78,
      correctPredictions: 71,
      currentStreak: 22,
      longestStreak: 25,
      lastPredictionTime: Date.now() - (1000 * 60 * 15), // 15 minutes ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 15) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 14) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 13) },
        { achievementId: 'predictions_50', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 12) },
        { achievementId: 'accuracy_70', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 11) },
        { achievementId: 'accuracy_80', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 10) },
        { achievementId: 'accuracy_90', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 9) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 8) },
        { achievementId: 'streak_5', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 7) },
        { achievementId: 'streak_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'streak_20', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'stakes_100', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'stakes_300', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
      ]
    },
    {
      name: "Casey Park",
      stakes: 25,
      stakesFromPredictions: 15, // Base stakes from 3 predictions
      totalPredictions: 3,
      correctPredictions: 1,
      currentStreak: 0,
      longestStreak: 1,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 24 * 7), // 1 week ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
      ]
    },
    {
      name: "Taylor Wilson",
      stakes: 155,
      stakesFromPredictions: 140, // Base stakes from 28 predictions
      totalPredictions: 28,
      correctPredictions: 21,
      currentStreak: 4,
      longestStreak: 7,
      lastPredictionTime: Date.now() - (1000 * 60 * 60 * 8), // 8 hours ago
      achievements: [
        { achievementId: 'scout_rookie', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 6) },
        { achievementId: 'first_prediction', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 5) },
        { achievementId: 'accuracy_70', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 4) },
        { achievementId: 'predictions_10', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 3) },
        { achievementId: 'streak_3', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 2) },
        { achievementId: 'streak_5', unlockedAt: Date.now() - (1000 * 60 * 60 * 24 * 1) },
        { achievementId: 'stakes_100', unlockedAt: Date.now() - (1000 * 60 * 60 * 12) },
      ]
    }
  ];

  try {
    // Clear existing test profiles (optional - comment out if you want to keep existing data)
    // await gameDB.scouters.clear();
    // await gameDB.scouterAchievements.clear();

    for (const profile of testProfiles) {
      console.log(`Creating profile for ${profile.name}...`);
      
      // Create or update the scouter
      await gameDB.scouters.put({
        name: profile.name,
        stakes: profile.stakes,
        stakesFromPredictions: profile.stakesFromPredictions,
        totalPredictions: profile.totalPredictions,
        correctPredictions: profile.correctPredictions,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        createdAt: Date.now() - (1000 * 60 * 60 * 24 * 15), // Created 15 days ago
        lastUpdated: profile.lastPredictionTime,
      });

      // Add achievements
      for (const achievement of profile.achievements) {
        await gameDB.scouterAchievements.put({
          scouterName: profile.name,
          achievementId: achievement.achievementId,
          unlockedAt: achievement.unlockedAt,
        });
      }
    }

    console.log('✅ Test scouter profiles created successfully!');
    console.log('📊 Profiles created:');
    testProfiles.forEach(profile => {
      const accuracy = Math.round((profile.correctPredictions / profile.totalPredictions) * 100);
      console.log(`  - ${profile.name}: ${profile.stakes} stakes, ${accuracy}% accuracy, ${profile.achievements.length} achievements`);
    });

    return testProfiles;
  } catch (error) {
    console.error('❌ Error creating test profiles:', error);
    throw error;
  }
};

export const createTestPitScoutingData = async () => {
  console.log('🔧 Creating test pit scouting data...');

  const pitEntries: Omit<PitScoutingEntry, 'id' | 'timestamp'>[] = [
    {
      teamNumber: '2539',
      eventName: '2025pawar', 
      scouterInitials: 'Sarah Chen',
      weight: 95,
      drivetrain: 'Swerve',
      programmingLanguage: 'Java',
      groundPickupCapabilities: {
        coralGroundPickup: true,
        algaeGroundPickup: true
      },
      reportedAutoScoring: {
        position0: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 2, algaeNet: 0, algaeProcessor: 0 },
        position1: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position2: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position3: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 2, algaeNet: 0, algaeProcessor: 0 },
        position4: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 }
      },
      reportedTeleopScoring: {
        coralL1: 2,
        coralL2: 4,
        coralL3: 6,
        coralL4: 5,
        totalAlgae: 3,
        algaeNetShots: false,
        algaeProcessor: true
      },
      reportedEndgame: {
        canShallowClimb: false,
        canDeepClimb: true,
        canPark: true
      },
      notes: 'Very consistent robot, great at L4 coral placement. Fast climb.'
    },
    {
      teamNumber: '5895',
      eventName: '2025pawar',
      scouterInitials: 'Marcus Rodriguez', 
      weight: 110,
      drivetrain: 'Tank Drive',
      programmingLanguage: 'C++',
      groundPickupCapabilities: {
        coralGroundPickup: true,
        algaeGroundPickup: true
      },
      reportedAutoScoring: {
        position0: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position1: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position2: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 0, algaeNet: 0, algaeProcessor: 0 },
        position3: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 3, algaeNet: 0, algaeProcessor: 0 },
        position4: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 }
      },
      reportedTeleopScoring: {
        coralL1: 0,
        coralL2: 3,
        coralL3: 5,
        coralL4: 6,
        totalAlgae: 6,
        algaeNetShots: true,
        algaeProcessor: false
      },
      reportedEndgame: {
        canShallowClimb: false,
        canDeepClimb: true,
        canPark: true
      },
      notes: 'Strong coral scoring, excellent algae net shots. Sometimes gets beached.'
    },
    {
      teamNumber: '341',
      eventName: '2025mrcmp',
      scouterInitials: 'Alex Kim',
      weight: 88,
      drivetrain: 'Mecanum',
      programmingLanguage: 'Python',
      groundPickupCapabilities: {
        coralGroundPickup: false,
        algaeGroundPickup: false
      },
      reportedAutoScoring: {
        position0: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position1: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position2: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position3: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 2, algaeNet: 0, algaeProcessor: 0 },
        position4: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 0, algaeNet: 0, algaeProcessor: 0 }
      },
      reportedTeleopScoring: {
        coralL1: 3,
        coralL2: 2,
        coralL3: 3,
        coralL4: 2,
        totalAlgae: 0,
        algaeNetShots: false,
        algaeProcessor: false
      },
      reportedEndgame: {
        canShallowClimb: true,
        canDeepClimb: false,
        canPark: true
      },
      notes: 'Coral-focused robot. Cannot pick up game pieces from ground.'
    },
    {
      teamNumber: '1168',
      eventName: '2025pawar',
      scouterInitials: 'Emma Thompson',
      weight: 102,
      drivetrain: 'West Coast',
      programmingLanguage: 'Java',
      groundPickupCapabilities: {
        coralGroundPickup: true,
        algaeGroundPickup: false
      },
      reportedAutoScoring: {
        position0: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 0, algaeNet: 0, algaeProcessor: 0 },
        position1: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position2: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 0, algaeNet: 0, algaeProcessor: 0 },
        position3: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position4: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 0, algaeNet: 0, algaeProcessor: 0 }
      },
      reportedTeleopScoring: {
        coralL1: 1,
        coralL2: 2,
        coralL3: 2,
        coralL4: 3,
        totalAlgae: 2,
        algaeNetShots: false,
        algaeProcessor: true
      },
      reportedEndgame: {
        canShallowClimb: true,
        canDeepClimb: true,
        canPark: true
      },
      notes: 'Well-rounded robot, reliable performance across all game elements.'
    },
    {
      teamNumber: '3142',
      eventName: '2025mrcmp',
      scouterInitials: 'AN',
      weight: 118,
      drivetrain: 'Swerve',
      programmingLanguage: 'C++',
      groundPickupCapabilities: {
        coralGroundPickup: true,
        algaeGroundPickup: true
      },
      reportedAutoScoring: {
        position0: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position1: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 2, algaeNet: 0, algaeProcessor: 0 },
        position2: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 1, algaeNet: 0, algaeProcessor: 0 },
        position3: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 3, algaeNet: 0, algaeProcessor: 0 },
        position4: { coralL1: 0, coralL2: 0, coralL3: 0, coralL4: 2, algaeNet: 0, algaeProcessor: 0 }
      },
      reportedTeleopScoring: {
        coralL1: 0,
        coralL2: 1,
        coralL3: 4,
        coralL4: 8,
        totalAlgae: 4,
        algaeNetShots: true,
        algaeProcessor: true
      },
      reportedEndgame: {
        canShallowClimb: false,
        canDeepClimb: true,
        canPark: false
      },
      notes: 'High-scoring robot, excellent at L4 coral and algae. Dedicated to deep climb only.'
    }
  ];

  try {
    let createdCount = 0;
    
    for (const entryData of pitEntries) {
      console.log(`Creating pit entry for team ${entryData.teamNumber}...`);
      
      await savePitScoutingEntry(entryData);
      createdCount++;
    }

    console.log('✅ Test pit scouting data created successfully!');
    console.log(`📊 Created ${createdCount} pit scouting entries:`);
    pitEntries.forEach(entry => {
      console.log(`  - Team ${entry.teamNumber} (${entry.eventName}) by ${entry.scouterInitials}`);
    });

    return pitEntries;
  } catch (error) {
    console.error('❌ Error creating test pit scouting data:', error);
    throw error;
  }
};

export const clearTestData = async () => {
  console.log('🧹 Clearing all scouter and pit scouting data...');
  try {
    await gameDB.scouters.clear();
    await gameDB.scouterAchievements.clear();
    
    // Also clear pit scouting data
    const { clearAllPitScoutingData } = await import('./pitScoutingUtils');
    await clearAllPitScoutingData();
    
    console.log('✅ All scouter and pit scouting data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};
