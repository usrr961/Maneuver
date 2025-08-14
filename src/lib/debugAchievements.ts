import { gameDB } from './dexieDB';
import { checkForNewAchievements } from './achievementUtils';
import { ACHIEVEMENT_DEFINITIONS } from './achievementTypes';

export const debugAchievements = async (scouterName: string) => {
  console.log('🔍 Debug analysis for', scouterName);
  
  // Get current scouter data
  const scouter = await gameDB.scouters.get(scouterName);
  if (!scouter) {
    console.log('❌ Scouter not found');
    return;
  }
  
  console.log('📊 Current scouter stats:', {
    stakes: scouter.stakes,
    totalPredictions: scouter.totalPredictions,
    correctPredictions: scouter.correctPredictions,
    accuracy: Math.round((scouter.correctPredictions / scouter.totalPredictions) * 100),
    currentStreak: scouter.currentStreak,
    longestStreak: scouter.longestStreak
  });
  
  // Get current achievements
  const achievements = await gameDB.scouterAchievements
    .where('scouterName')
    .equals(scouterName)
    .toArray();
  
  console.log('🏆 Current achievements:', achievements.length);
  achievements.forEach(achievement => {
    const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievement.achievementId);
    if (def) {
      console.log(`  - ${def.name} (+${def.stakesReward} stakes)`);
    }
  });
  
  // Calculate total stakes from achievements
  const totalStakesFromAchievements = achievements.reduce((sum, achievement) => {
    const def = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievement.achievementId);
    return sum + (def?.stakesReward || 0);
  }, 0);
  
  console.log('💰 Total stakes from achievements:', totalStakesFromAchievements);
  console.log('💰 Expected base stakes:', scouter.stakes - totalStakesFromAchievements);
  
  // Check which stakes achievements should be unlocked
  const stakesAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.id.startsWith('stakes_'));
  console.log('🎯 Stakes achievements analysis:');
  
  stakesAchievements.forEach(achievement => {
    const isUnlocked = achievements.some(a => a.achievementId === achievement.id);
    const shouldBeUnlocked = scouter.stakes >= achievement.requirements.value;
    const status = isUnlocked ? '✅' : (shouldBeUnlocked ? '❌ MISSING' : '⏳');
    
    console.log(`  ${status} ${achievement.name}: needs ${achievement.requirements.value}, has ${scouter.stakes}`);
  });
  
  // Try manual achievement check
  console.log('🔄 Running manual achievement check...');
  const newAchievements = await checkForNewAchievements(scouterName);
  
  if (newAchievements.length > 0) {
    console.log('🎉 New achievements unlocked:', newAchievements.map(a => a.name));
  } else {
    console.log('ℹ️ No new achievements to unlock');
  }
  
  // Get updated scouter data
  const updatedScouter = await gameDB.scouters.get(scouterName);
  if (updatedScouter && updatedScouter.stakes !== scouter.stakes) {
    console.log('💰 Stakes updated:', scouter.stakes, '->', updatedScouter.stakes);
  }
};

export const fixStakesAchievements = async () => {
  console.log('🔧 Attempting to fix stakes achievements...');
  
  const scouters = await gameDB.scouters.toArray();
  
  for (const scouter of scouters) {
    console.log(`\n🔍 Checking ${scouter.name}...`);
    await debugAchievements(scouter.name);
  }
};
