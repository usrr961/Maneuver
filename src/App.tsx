import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider"
import { analytics } from '@/lib/analytics';

import MainLayout from "@/layouts/MainLayout";
import NotFoundPage from "@/pages/NotFoundPage";

import HomePage from "@/pages/HomePage";
import GameStartPage from "@/pages/GameStartPage";
import AutoStartPage from "@/pages/AutoStartPage";
// import ParseDataPage from "@/pages/ParseDataPage";
import TBADataPage from "@/pages/TBADataPage";
import ClearDataPage from "@/pages/ClearDataPage";
import QRDataTransferPage from "@/pages/QRDataTransferPage";
import JSONDataTransferPage from "@/pages/JSONDataTransferPage";
import MatchDataQRPage from "@/pages/MatchDataQRPage";
import MatchStrategyPage from "@/pages/MatchStrategyPage";
import { AutoScoringPage, TeleopScoringPage } from "@/pages/ScoringPage";
import EndgamePage from "@/pages/EndgamePage";
import TeamStatsPage from "@/pages/TeamStatsPage";
import PitScoutingPage from "@/pages/PitScoutingPage";
import PickListPage from "./pages/PickListPage";
import StrategyOverviewPage from "./pages/StrategyOverviewPage";
import ScoutManagementDashboardPage from "./pages/ScoutManagementDashboardPage";
import AchievementsPage from "./pages/AchievementsPage";
import DevUtilitiesPage from "./pages/DevUtilitiesPage";
import { InstallPrompt } from '@/components/InstallPrompt';
import { StatusBarSpacer } from '@/components/StatusBarSpacer';
import { SplashScreen } from '@/components/SplashScreen';
import { FullscreenProvider } from '@/contexts/FullscreenContext';



function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/tba-data" element={<TBADataPage />} />
        <Route path="/match-data" element={<TBADataPage />} />
        <Route path="/match-results" element={<TBADataPage />} />
        <Route path="/clear-data" element={<ClearDataPage />} /> 
        {/* <Route path="/parse-data" element={<ParseDataPage />} /> */}
        <Route path="/game-start" element={<GameStartPage />} />
        <Route path="/auto-start" element={<AutoStartPage />} />
        <Route path="/qr-data-transfer" element={<QRDataTransferPage />} />
        <Route path="/json-transfer" element={<JSONDataTransferPage />} />
        <Route path="/match-data-qr" element={<MatchDataQRPage />} />
        <Route path="/match-strategy" element={<MatchStrategyPage />} />
        <Route path="/auto-scoring" element={<AutoScoringPage />} />
        <Route path="/teleop-scoring" element={<TeleopScoringPage />} />
        <Route path="/endgame" element={<EndgamePage />} />
        <Route path="/team-stats" element={<TeamStatsPage />} />
        <Route path="/pit-scouting" element={<PitScoutingPage />} />
        <Route path="/strategy-overview" element={<StrategyOverviewPage />} />
        <Route path="/pick-list" element={<PickListPage />} />
        <Route path="/scout-management" element={<ScoutManagementDashboardPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/dev-utilities" element={<DevUtilitiesPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // Track PWA install prompt
    window.addEventListener('beforeinstallprompt', () => {
      analytics.trackEvent('pwa_install_prompt_shown');
    });

    // Track if app was launched as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      analytics.trackPWALaunched();
    }

    // Debug analytics in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        analytics.debug();
        // Make analytics available globally for testing
        (window as typeof window & { analytics: typeof analytics }).analytics = analytics;
        
        // Make achievement functions available globally for debugging
        import('./lib/achievementUtils').then(achievementUtils => {
          (window as typeof window & { achievements: { backfillAll: () => Promise<void>, checkForNewAchievements: (name: string) => Promise<unknown[]> } }).achievements = {
            backfillAll: achievementUtils.backfillAchievementsForAllScouters,
            checkForNewAchievements: achievementUtils.checkForNewAchievements
          };
        });

        // Make test data generator available globally for testing
        import('./lib/testDataGenerator').then(testData => {
          (window as typeof window & { testData: { createTestProfiles: () => Promise<unknown>, clearAll: () => Promise<void> } }).testData = {
            createTestProfiles: testData.createTestScouterProfiles,
            clearAll: testData.clearTestData
          };
          console.log('🧪 Test data functions available:');
          console.log('  - window.testData.createTestProfiles() - Create test scouter profiles');
          console.log('  - window.testData.clearAll() - Clear all scouter data');
        });

        // Make gameDB available for debugging
        import('./lib/dexieDB').then(db => {
          (window as typeof window & { gameDB: typeof db.gameDB }).gameDB = db.gameDB;
          console.log('🗄️ Database available at window.gameDB');
        });

        // Debug function to check scouter data
        (window as typeof window & { debugScouterData: (name: string) => Promise<void> }).debugScouterData = async (scouterName: string) => {
          const { gameDB } = await import('./lib/dexieDB');
          const scouter = await gameDB.scouters.get(scouterName);
          console.log(`Scouter data for ${scouterName}:`, scouter);
          
          const achievements = await gameDB.scouterAchievements.where('scouterName').equals(scouterName).toArray();
          console.log(`Achievements for ${scouterName}:`, achievements);
          
          // Check specific stake achievements
          const { checkAchievement, ACHIEVEMENT_DEFINITIONS } = await import('./lib/achievementTypes');
          const stakeAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.id.startsWith('stakes_'));
          
          stakeAchievements.forEach(achievement => {
            const isUnlocked = achievements.some(a => a.achievementId === achievement.id);
            const meetsRequirements = checkAchievement(achievement, scouter!);
            console.log(`${achievement.name}: unlocked=${isUnlocked}, meetsReq=${meetsRequirements}, stakesFromPredictions=${scouter?.stakesFromPredictions}`);
          });
        };

        console.log('🐛 Debug function available: window.debugScouterData("Riley Davis")');
      }, 2000);
    }

  }, []);
  
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <FullscreenProvider>
        <div className="min-h-screen bg-background">
          <RouterProvider router={router} />
          <InstallPrompt />
          <StatusBarSpacer />
        </div>
      </FullscreenProvider>
    </ThemeProvider>
  );
}

export default App
