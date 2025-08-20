import ManeuverVerticalLogo from "../assets/Maneuver Wordmark Vertical.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataAttribution } from "@/components/DataAttribution";
import { useState, useEffect } from "react";
import demoData from "../app/dashboard/ManeuverData-5_52_53 PM-Blue 1.json";
import { loadLegacyScoutingData, saveScoutingData, addIdsToScoutingData, loadScoutingData } from "../lib/scoutingDataUtils";
import { clearAllScoutingData, gameDB } from "../lib/dexieDB";
import { createTestScouterProfiles, createTestPitScoutingData } from "../lib/testDataGenerator";
import { clearAllPitScoutingData } from "../lib/pitScoutingUtils";
import { analytics } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkExistingData = async () => {
      try {
        const existingData = await loadLegacyScoutingData();
        const existingScouters = await gameDB.scouters.count();
        if (existingData.length > 0 || existingScouters > 0) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error checking existing data:", error);
      }
    };

    checkExistingData();
  }, []);

  const loadDemoData = async () => {
    haptics.medium();
    setIsLoading(true);

    try {
      // Load demo scouting data
      const dataWithoutHeaders = demoData.slice(1);
      const dataWithIds = addIdsToScoutingData(dataWithoutHeaders);
      await saveScoutingData({ entries: dataWithIds });

      // Load demo scouter profiles using the test data generator
      const testProfiles = await createTestScouterProfiles();

      // Load demo pit scouting data
      const pitEntries = await createTestPitScoutingData();

      // Also add the scouter names to the selectable list in localStorage
      const scouterNames = testProfiles.map(profile => profile.name);
      localStorage.setItem("scoutersList", JSON.stringify(scouterNames.sort()));

      const verifyData = await loadScoutingData();
      console.log("HomePage - Verification: loaded", verifyData.entries.length, "entries from IndexedDB");
      console.log("HomePage - Loaded", testProfiles.length, "demo scouters with achievements");
      console.log("HomePage - Loaded", pitEntries.length, "pit scouting entries");

      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsLoaded(true);
      haptics.success();
      analytics.trackDemoDataLoad();
      
    } catch (error) {
      haptics.error();
      console.error("HomePage - Error loading demo data:", error);
      // Show error details to help debug
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    haptics.medium();
    
    try {
      await clearAllScoutingData();
      
      // Also clear scouter profiles
      await gameDB.scouters.clear();
      await gameDB.predictions.clear();
      await gameDB.scouterAchievements.clear();
      
      // Also clear pit scouting data
      await clearAllPitScoutingData();
      
      // Clear scouter list from localStorage
      localStorage.removeItem("scoutersList");
      localStorage.removeItem("currentScouter");
      localStorage.removeItem("scouterInitials");
      
      setIsLoaded(false);
      analytics.trackDemoDataClear();
    } catch (error) {
      console.error("Error clearing data:", error);
      // Clear localStorage as fallback and update UI anyway
      localStorage.removeItem("scoutingData");
      localStorage.removeItem("scoutersList");
      localStorage.removeItem("currentScouter");
      localStorage.removeItem("scouterInitials");
      setIsLoaded(false);
      analytics.trackDemoDataClear();
    }
  };

  return (
    <main className="relative min-h-screen w-full">
      <div
        className={cn(
          "flex flex-col min-h-screen w-full justify-center items-center gap-6 pt-6 pb-24 2xl:pb-6",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      >
        <div className="flex flex-col w-auto justify-center items-center gap-6 scale-75 md:scale-75 lg:scale-100">
          <img
            src={ManeuverVerticalLogo}
            width="600"
            height="240"
            alt="Maneuver Logo"
            className="dark:invert"
          />
          <div className="text-center space-y-2">
            <p>
              <strong>Version</strong>: 2025.1.0
            </p>
            <DataAttribution sources={['tba', 'nexus']} variant="compact" />
          </div>
        </div>

        {/* Demo Data Section */}
        <Card className="w-full max-w-md mx-4 mt-8 scale-75 md:scale-100">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold">Demo Data</h2>
              <p className="text-sm text-muted-foreground">
                Load sample scouting data, scouter profiles, and pit scouting data to explore the app's features
              </p>

              {!isLoaded ? (
                <Button
                  onClick={loadDemoData}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Loading..." : "Load Demo Data"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Demo data loaded successfully!
                  </div>
                  <p className="text-xs text-muted-foreground">
                    51 matches • 14 teams • 8 scouters • 5 pit entries • Ready to explore
                  </p>
                  <Button
                    onClick={clearData}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear Data
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>
  );
};

export default HomePage;
