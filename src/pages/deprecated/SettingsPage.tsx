import React, { useEffect, useState } from "react";
import { toast } from "sonner"
import ProceedBackButton from "../../components/deprecated/ProceedBackButton";
import Button from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator"
import NavigationButton from "@/components/deprecated/NavigationButton";

/**
 * A page for the user to access settings such as clearing match data, viewing match data, and getting match data.
 *
 * @return {JSX.Element} The rendered component.
 */
const SettingsPage = () => {
  const [matchDataClearClicked, setMatchDataClearClicked] = useState(false);
  const [scoutDataClearClicked, setScoutDataClearClicked] = useState(false);



  useEffect(() => {
    /**
     * If the user has clicked the clear match data button, clear the local storage for match data and notify the user.
     * If the user has clicked the clear scouting data button, clear the local storage for scouting data and notify the user.
     */
    if (matchDataClearClicked) {
      localStorage.setItem("matchData", "");
      setMatchDataClearClicked(false);
      toast.success("Cleared Match Data");
    } else if (scoutDataClearClicked) {
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      setScoutDataClearClicked(false);
      toast.success("Cleared Scouting Data");
    }
  }, [matchDataClearClicked, scoutDataClearClicked]);

  return (
    <>
      {/* Container for the settings buttons */}
      <main className="flex flex-col h-screen w-full gap-4 p-4 pt-12 items-center">
        <div className="flex flex-col gap-4 w-full max-w-3/4">
          <div className="flex w-full h-16 justify-between gap-2">
            <ProceedBackButton
              nextPage={"/parse-data"}
              message={"Parse Data"}
            />
          </div>
          <Separator />
        
          <NavigationButton
              variant={"outline"}
              destination={"/match-data"}
              className="h-16 w-full flex flex-col items-center gap-2"
          >
            Get Match Data
          </NavigationButton>
          <Button
              variant={"outline"}
              className="h-16 w-full flex flex-col items-center gap-2"
          >
            Clear Match Data
          </Button>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
