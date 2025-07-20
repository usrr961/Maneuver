import ManeuverVerticalLogo from "../assets/Maneuver Wordmark Vertical.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import demoData from "../app/dashboard/VScouterData-5_52_53 PM-Blue 1.json";
import { loadLegacyScoutingData } from "../lib/scoutingDataUtils";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if demo data is already loaded on component mount
  useEffect(() => {
    try {
      const existingData = loadLegacyScoutingData();
      if (existingData.length > 0) {
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error checking existing data:", error);
    }
  }, []);

  const loadDemoData = async () => {
    setIsLoading(true);

    try {
      // Exclude the first row (column headers) from the demo data
      const dataWithoutHeaders = demoData.slice(1);

      // Store in localStorage with the same format as the app expects
      const scoutingDataObj = {
        timestamp: new Date().toISOString(),
        data: dataWithoutHeaders,
      };

      localStorage.setItem("scoutingData", JSON.stringify(scoutingDataObj));

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading demo data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem("scoutingData");
    setIsLoaded(false);
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
              <h3 className="text-lg font-semibold">Demo Data</h3>
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
