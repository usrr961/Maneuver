import { gameDB } from './dexieDB';
import { savePitScoutingEntry } from './pitScoutingUtils';

// Import test data from JSON files
import scouterProfilesData from './testData/scouterProfiles.json';
import pitScoutingData from './testData/pitScoutingData.json';
import matchScheduleData from './testData/matchSchedule.json';
import matchScoutingData from './testData/matchScoutingData.json';

// Helper function to convert relative time to absolute timestamp
const getTimestamp = (timeSpec: any): number => {
  const now = Date.now();
  if (timeSpec.daysAgo) return now - (timeSpec.daysAgo * 24 * 60 * 60 * 1000);
  if (timeSpec.hoursAgo) return now - (timeSpec.hoursAgo * 60 * 60 * 1000);
  if (timeSpec.minutesAgo) return now - (timeSpec.minutesAgo * 60 * 1000);
  return now;
};

export const createTestScouterProfiles = async () => {
  console.log('🧪 Creating test scouter profiles...');

  try {
    // Convert JSON data to the format expected by the database
    const testProfiles = scouterProfilesData.map(profile => ({
      ...profile,
      lastPredictionTime: profile.lastPredictionHoursAgo ? 
        Date.now() - (profile.lastPredictionHoursAgo * 60 * 60 * 1000) :
        profile.lastPredictionDaysAgo ?
        Date.now() - (profile.lastPredictionDaysAgo * 24 * 60 * 60 * 1000) :
        profile.lastPredictionMinutesAgo ?
        Date.now() - (profile.lastPredictionMinutesAgo * 60 * 1000) :
        Date.now(),
      achievements: profile.achievements.map(achievement => ({
        achievementId: achievement.achievementId,
        unlockedAt: getTimestamp(achievement)
      }))
    }));

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

  try {
    let createdCount = 0;
    
    for (const entryData of pitScoutingData) {
      console.log(`Creating pit entry for team ${entryData.teamNumber}...`);
      
      await savePitScoutingEntry(entryData);
      createdCount++;
    }

    console.log('✅ Test pit scouting data created successfully!');
    console.log(`📊 Created ${createdCount} pit scouting entries:`);
    pitScoutingData.forEach(entry => {
      console.log(`  - Team ${entry.teamNumber} (${entry.eventName}) by ${entry.scouterInitials}`);
    });

    return pitScoutingData;
  } catch (error) {
    console.error('❌ Error creating test pit scouting data:', error);
    throw error;
  }
};

export const createTestMatchScoutingData = async () => {
  console.log('🏁 Creating test match scouting data...');

  try {
    // Import the match scouting utilities 
    const { saveScoutingData, addIdsToScoutingData } = await import('./scoutingDataUtils');
    
    // Convert the data to the correct format with IDs
    const dataWithIds = addIdsToScoutingData(matchScoutingData);
    
    // Save the data
    await saveScoutingData({ entries: dataWithIds });

    console.log('✅ Test match scouting data created successfully!');
    console.log(`📊 Created ${matchScoutingData.length} match scouting entries`);
    console.log(`   - Teams: ${new Set(matchScoutingData.map(m => m.selectTeam)).size} different teams`);
    console.log(`   - Matches: ${new Set(matchScoutingData.map(m => m.matchNumber)).size} different matches`);

    return matchScoutingData;
  } catch (error) {
    console.error('❌ Error creating test match scouting data:', error);
    throw error;
  }
};

export const createTestMatchSchedule = async () => {
  console.log('📅 Creating test match schedule...');

  try {
    // Save match schedule to localStorage (same approach as HomePage.tsx)
    localStorage.setItem('matchData', JSON.stringify(matchScheduleData));

    console.log('✅ Test match schedule created successfully!');
    console.log(`📊 Created schedule with ${matchScheduleData.length} matches`);

    return matchScheduleData;
  } catch (error) {
    console.error('❌ Error creating test match schedule:', error);
    throw error;
  }
};

export const createAllTestData = async () => {
  console.log('🚀 Creating all test data...');
  
  try {
    await createTestScouterProfiles();
    await createTestPitScoutingData();
    await createTestMatchSchedule();
    await createTestMatchScoutingData();
    
    console.log('✅ All test data created successfully!');
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
};

export const clearTestData = async () => {
  console.log('🧹 Clearing all test data...');
  try {
    await gameDB.scouters.clear();
    await gameDB.scouterAchievements.clear();
    
    // Also clear pit scouting data
    const { clearAllPitScoutingData } = await import('./pitScoutingUtils');
    await clearAllPitScoutingData();
    
    // Clear match scouting data by saving empty data
    try {
      const { saveScoutingData } = await import('./scoutingDataUtils');
      await saveScoutingData({ entries: [] });
    } catch (error) {
      console.log('Match data clearing failed, skipping...');
    }
    
    // Clear match schedule from localStorage
    try {
      localStorage.removeItem('matchData');
    } catch (error) {
      console.log('Match schedule clearing failed, skipping...');
    }
    
    console.log('✅ All test data cleared!');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};

// Export the data for direct access if needed
export { 
  scouterProfilesData, 
  pitScoutingData, 
  matchScheduleData, 
  matchScoutingData 
};
