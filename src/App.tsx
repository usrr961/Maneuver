import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider"

import MainLayout from "@/layouts/MainLayout";

import HomePage from "@/pages/HomePage";
import GameStartPage from "@/pages/GameStartPage";
import SettingsPage from "@/pages/SettingsPage";
import ParseDataPage from "@/pages/ParseDataPage";
import MatchDataPage from "@/pages/MatchDataPage";
import MatchDataOnlinePage from "@/pages/MatchDataOnlinePage";
import MatchDataOfflinePage from "@/pages/MatchDataOfflinePage";

import Button from '@/components/ui/button'


function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/match-data" element={<MatchDataPage />} />
        <Route path="/match-data/online" element={<MatchDataOnlinePage />} />

        { /**
        <Route path="/game-start" element={<GameStartPage />} />
        <Route path="/parse-data" element={<ParseDataPage />} />
        <Route path="/match-data" element={<MatchDataPage />} />
        <Route path="/match-data/online" element={<MatchDataOnlinePage />} />
        <Route path="/match-data/offline" element={<MatchDataOfflinePage />} /> 
        */}
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
