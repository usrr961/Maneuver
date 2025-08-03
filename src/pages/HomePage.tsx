import ManeuverVerticalLogo from "../assets/Maneuver Wordmark Vertical.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import demoData from "../app/dashboard/ManeuverData-5_52_53 PM-Blue 1.json";
import { loadLegacyScoutingData, saveScoutingData, addIdsToScoutingData, loadScoutingData } from "../lib/scoutingDataUtils";
import { clearAllScoutingData } from "../lib/indexedDBUtils";
import { analytics } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if demo data is already loaded on component mount
  useEffect(() => {
    const checkExistingData = async () => {
      try {
        const existingData = await loadLegacyScoutingData();
        if (existingData.length > 0) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error checking existing data:", error);
      }
    };

    checkExistingData();
  }, []);

  const loadDemoData = async () => {
    haptics.medium(); // Feedback on button press
    setIsLoading(true);

    try {
      // Exclude the first row (column headers) from the demo data
      const dataWithoutHeaders = demoData.slice(1);
      console.log("HomePage - Demo data without headers:", dataWithoutHeaders.length, "entries");

      // Add IDs to the data for IndexedDB compatibility
      const dataWithIds = addIdsToScoutingData(dataWithoutHeaders);
      console.log("HomePage - Demo data with IDs:", dataWithIds.length, "entries");
      console.log("HomePage - Sample entry with ID:", dataWithIds[0]);

      // Store using IndexedDB through the utility function
      await saveScoutingData({ entries: dataWithIds });
      console.log("HomePage - Demo data saved to IndexedDB successfully");

      // Verify the data was saved by loading it back
      const verifyData = await loadScoutingData();
      console.log("HomePage - Verification: loaded", verifyData.entries.length, "entries from IndexedDB");

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsLoaded(true);
      haptics.success(); // Success feedback
      // Track demo data load
      analytics.trackDemoDataLoad();
      
    } catch (error) {
      haptics.error(); // Error feedback
      console.error("HomePage - Error loading demo data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    haptics.medium();
    
    try {
      // Clear data from IndexedDB and fallback to localStorage
      await clearAllScoutingData();
      setIsLoaded(false);
      
      // Track demo data clear
      analytics.trackDemoDataClear();
    } catch (error) {
      console.error("Error clearing data:", error);
      // Fallback: clear localStorage directly if IndexedDB fails
      localStorage.removeItem("scoutingData");
      setIsLoaded(false);
      analytics.trackDemoDataClear();
    }
  };

  return (
    <main className="overflow-hidden h-screen w-full">
      <div
        className={cn(
          "flex flex-col h-full w-full justify-center items-center gap-6 pt-6",
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
          <p className="text-center">
            <strong>Version</strong>: 2025.1.0
          </p>
        </div>

        {/* Demo Data Section */}
        <Card className="w-full max-w-md mx-4 mt-8 scale-75 md:scale-100">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold">Demo Data</h2>
              <p className="text-sm text-muted-foreground">
                Load sample scouting data to explore the app's features
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
                    51 matches • 14 teams • Ready to explore
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
      <div className="pointer-events-none absolute mt-7 top-10 left-0 right-0 bottom-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>
  );
};

export default HomePage;
