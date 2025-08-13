import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider"
import { FullscreenProvider } from "@/contexts/FullscreenContext";
import { analytics } from '@/lib/analytics';

import MainLayout from "@/layouts/MainLayout";
import NotFoundPage from "@/pages/NotFoundPage";

import HomePage from "@/pages/HomePage";
import GameStartPage from "@/pages/GameStartPage";
import AutoStartPage from "@/pages/AutoStartPage";
// import ParseDataPage from "@/pages/ParseDataPage";
import MatchDataPage from "@/pages/MatchDataPage";
import ClearDataPage from "@/pages/ClearDataPage";
import QRDataTransferPage from "@/pages/QRDataTransferPage";
import JSONDataTransferPage from "@/pages/JSONDataTransferPage";
import MatchStrategyPage from "@/pages/MatchStrategyPage";
import { AutoScoringPage, TeleopScoringPage } from "@/pages/ScoringPage";
import EndgamePage from "@/pages/EndgamePage";
import TeamStatsPage from "@/pages/TeamStatsPage";
import PitScoutingPage from "@/pages/PitScoutingPage";
import PickListPage from "./pages/PickListPage";
import StrategyOverviewPage from "./pages/StrategyOverviewPage";
import ScouterTestPage from "./pages/ScouterTestPage";
import MatchResultsPage from "./pages/MatchResultsPage";
import { InstallPrompt } from '@/components/InstallPrompt';
import { StatusBarSpacer } from '@/components/StatusBarSpacer';
import { SplashScreen } from '@/components/SplashScreen';



function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/match-data" element={<MatchDataPage />} />
        <Route path="/clear-data" element={<ClearDataPage />} /> 
        {/* <Route path="/parse-data" element={<ParseDataPage />} /> */}
        <Route path="/game-start" element={<GameStartPage />} />
        <Route path="/auto-start" element={<AutoStartPage />} />
        <Route path="/qr-data-transfer" element={<QRDataTransferPage />} />
        <Route path="/json-transfer" element={<JSONDataTransferPage />} />
        <Route path="/match-strategy" element={<MatchStrategyPage />} />
        <Route path="/auto-scoring" element={<AutoScoringPage />} />
        <Route path="/teleop-scoring" element={<TeleopScoringPage />} />
        <Route path="/endgame" element={<EndgamePage />} />
        <Route path="/team-stats" element={<TeamStatsPage />} />
        <Route path="/pit-scouting" element={<PitScoutingPage />} />
        <Route path="/strategy-overview" element={<StrategyOverviewPage />} />
        <Route path="/pick-list" element={<PickListPage />} />
        <Route path="/scouter-test" element={<ScouterTestPage />} />
        <Route path="/match-results" element={<MatchResultsPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('🚀 App loaded, initializing analytics...');
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // Track PWA install prompt
    window.addEventListener('beforeinstallprompt', () => {
      console.log('💾 PWA install prompt shown');
      analytics.trackEvent('pwa_install_prompt_shown');
    });

    // Track if app was launched as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 App launched as PWA');
      analytics.trackPWALaunched();
    }

    // Debug analytics in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        analytics.debug();
        // Make analytics available globally for testing
        (window as typeof window & { analytics: typeof analytics }).analytics = analytics;
        console.log('💡 Analytics available globally as window.analytics');
        console.log('💡 Try: window.analytics.testTracking()');
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
