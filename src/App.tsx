import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider"

import MainLayout from "@/layouts/MainLayout";

import HomePage from "@/pages/HomePage";
import GameStartPage from "@/pages/GameStartPage";
import AutoStartPage from "@/pages/AutoStartPage";
import ParseDataPage from "@/pages/ParseDataPage";
import MatchDataPage from "@/pages/MatchDataPage";
import ClearDataPage from "@/pages/ClearDataPage";
import QRDataTransferPage from "@/pages/QRDataTransferPage";
import JSONDataTransferPage from "@/pages/JSONDataTransferPage";
import MatchStrategyPage from "@/pages/MatchStrategyPage";
import { AutoScoringPage, TeleopScoringPage } from "@/pages/ScoringPage";
import EndgamePage from "@/pages/EndgamePage";
import TeamStatsPage from "@/pages/TeamStatsPage";
import PickListPage from "./pages/PickListPage";



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
        <Route path="/qr-transfer" element={<QRDataTransferPage />} />
        <Route path="/json-transfer" element={<JSONDataTransferPage />} />
        <Route path="/match-strategy" element={<MatchStrategyPage />} />
        <Route path="/auto-scoring" element={<AutoScoringPage />} />
        <Route path="/teleop-scoring" element={<TeleopScoringPage />} />
        <Route path="/endgame" element={<EndgamePage />} />
        <Route path="/team-stats" element={<TeamStatsPage />} />
        <Route path="/pick-list" element={<PickListPage />} />
        {/* Add more routes as needed */}
      </Route>
    )
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App
