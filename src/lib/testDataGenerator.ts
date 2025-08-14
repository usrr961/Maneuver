import { gameDB } from './dexieDB';

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

export const clearTestData = async () => {
  console.log('🧹 Clearing all scouter data...');
  try {
    await gameDB.scouters.clear();
    await gameDB.scouterAchievements.clear();
    console.log('✅ All scouter data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};
