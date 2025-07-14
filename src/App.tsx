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
import SettingsPage from "@/pages/deprecated/SettingsPage";
import ParseDataPage from "@/pages/ParseDataPage";
import MatchDataPage from "@/pages/MatchDataPage";
import ClearDataPage from "@/pages/ClearDataPage";



function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/match-data" element={<MatchDataPage />} />
        <Route path="/clear-data" element={<ClearDataPage />} /> 
        <Route path="/parse-data" element={<ParseDataPage />} />
        <Route path="/game-start" element={<GameStartPage />} />
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
