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
import ParseDataPage from "@/pages/ParseDataPage";
import MatchDataPage from "@/pages/MatchDataPage";
import ClearDataPage from "@/pages/ClearDataPage";
import QRDataTransferPage from "@/pages/QRDataTransferPage";
import JSONDataTransferPage from "@/pages/JSONDataTransferPage";
import MatchDataQRPage from "@/pages/MatchDataQRPage";
import MatchStrategyPage from "@/pages/MatchStrategyPage";
import { AutoScoringPage, TeleopScoringPage } from "@/pages/ScoringPage";
import EndgamePage from "@/pages/EndgamePage";
import TeamStatsPage from "@/pages/TeamStatsPage";
import PickListPage from "./pages/PickListPage";
import StrategyOverviewPage from "./pages/StrategyOverviewPage";
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
        <Route path="/parse-data" element={<ParseDataPage />} />
        <Route path="/game-start" element={<GameStartPage />} />
        <Route path="/auto-start" element={<AutoStartPage />} />
        <Route path="/scout-data-qr" element={<QRDataTransferPage />} />
        <Route path="/json-transfer" element={<JSONDataTransferPage />} />
        <Route path="/match-data-qr" element={<MatchDataQRPage />} />
        <Route path="/match-strategy" element={<MatchStrategyPage />} />
        <Route path="/auto-scoring" element={<AutoScoringPage />} />
        <Route path="/teleop-scoring" element={<TeleopScoringPage />} />
        <Route path="/endgame" element={<EndgamePage />} />
        <Route path="/team-stats" element={<TeamStatsPage />} />
        <Route path="/strategy-overview" element={<StrategyOverviewPage />} />
        <Route path="/pick-list" element={<PickListPage />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('App loaded, analytics:', analytics); // Add this debug line
    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // Track initial page view
    analytics.trackPageView();

    // Track PWA install prompt
    window.addEventListener('beforeinstallprompt', () => {
      analytics.trackEvent('pwa_install_prompt_shown');
    });

    // Track if app was launched as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      analytics.trackEvent('pwa_launched');
    }

  }, []);
  
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <RouterProvider router={router} />
        <InstallPrompt />
        <StatusBarSpacer />
      </div>
    </ThemeProvider>
  );
}

export default App
