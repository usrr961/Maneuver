import React, { useEffect, useState } from "react";
//import { toast } from "react-toastify";

import ProceedBackButton from "../components/ProceedBackButton";
import SettingsMatchDataScanner from "@/components/SettingsComponents/SettingsMatchDataScanner";
import SettingsButton from "@/components/SettingsComponents/SettingsButton";
import SettingsViewMatchData from "@/components/SettingsComponents/SettingsViewMatchData";
import SettingsUpdateButton from "@/components/SettingsComponents/SettingsUpdateButton";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator"
import { Navigation } from "lucide-react";
import NavigationButton from "@/components/NavigationButton";

/**
 * A page for the user to access settings such as clearing match data, viewing match data, and getting match data.
 *
 * @return {JSX.Element} The rendered component.
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  const [matchDataGetClicked, setMatchDataGetClicked] = useState(false);
  const [matchDataClearClicked, setMatchDataClearClicked] = useState(false);
  const [scoutDataClearClicked, setScoutDataClearClicked] = useState(false);
  const [viewScoutingData, setViewScoutingData] = useState(false);



  useEffect(() => {
    /**
     * If the user has clicked the clear match data button, clear the local storage for match data and notify the user.
     * If the user has clicked the clear scouting data button, clear the local storage for scouting data and notify the user.
     */
    if (matchDataClearClicked) {
      localStorage.setItem("matchData", "");
      setMatchDataClearClicked(false);
      //toast.success("Cleared Match Data");
    } else if (scoutDataClearClicked) {
      localStorage.setItem("scoutingData", JSON.stringify({ data: [] }));
      setScoutDataClearClicked(false);
      //toast.success("Cleared Scouting Data");
    }
  }, [matchDataClearClicked, scoutDataClearClicked]);

  return (
    <>
      {/* Container for the settings buttons */}
      <main className="flex flex-col h-screen w-full max-w-3/4 2xl:max-w-1/2 gap-4 p-4 pt-12">
        <div className="flex w-full h-16 justify-between gap-2">
              <ProceedBackButton
                nextPage={"/parse-data"}
                message={"Parse Data"}
              />
        </div>
        <Separator />
        {/* Player Station Radio Buttons
        <div className="flex w-full h-fit gap-4 text-white ">
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="red1">
            <input className="hidden" type="radio" id="red1" name="playerStation" value="Red 1" onChange={handlePlayerStationChange}></input>
            Red 1
          </label>
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="red2">
            <input className="hidden" type="radio" id="red2" name="playerStation" value="Red 2" onChange={handlePlayerStationChange}></input>
            Red 2
          </label>
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="red3">
            <input className="hidden" type="radio" id="red3" name="playerStation" value="Red 3" onChange={handlePlayerStationChange}></input>
            Red 3
          </label>
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="blue1">
            <input className="hidden" type="radio" id="blue1" name="playerStation" value="Blue 1" onChange={handlePlayerStationChange}></input>
            Blue 1
          </label>
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="blue2">
            <input className="hidden" type="radio" id="blue2" name="playerStation" value="Blue 2" onChange={handlePlayerStationChange}></input>
            Blue 2
          </label>
          <label className="has-[:checked]:bg-[#507144] flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/6" htmlFor="blue3">
            <input className="hidden" type="radio" id="blue3" name="playerStation" value="Blue 3" onChange={handlePlayerStationChange}></input>
            Blue 3
          </label>
        </div> */}
        <NavigationButton
            variant={"outline"}
            destination={"/match-data"}
            className="h-16 flex flex-col items-center gap-2"
        >
          Get Match Data
        </NavigationButton>
        <Button
            variant={"outline"}
            className="h-16 flex flex-col items-center gap-2"
        >
          Clear Match Data
        </Button>
        {/* If the user has clicked the view matches data button, render the SettingsViewMatchData component */}
        {/* { !viewScoutingData ?
          (
            <div className="flex flex-col w-full h-fit max-h-16 justify-between gap-2 mb-2">
              <button
                className="flex w-full h-full items-center justify-center border-8 border-[#1D1E1E] rounded-xl bg-[#4A4A4A] text-white font-bold ~text-2xl/5xl ~p-2/8"
                onClick={() => navigate("/match-data")} // Toggles the state when the button is clicked
              >
                Get Match Data
              </button>
              <SettingsButton
                question="Clear Match Data"
                state={matchDataClearClicked}
                setState={setMatchDataClearClicked}
              />
              <SettingsButton
                question="Clear Scouting Data"
                state={scoutDataClearClicked}
                setState={setScoutDataClearClicked}
              />

              <SettingsButton
                question="View Matches Data"
                state={viewScoutingData}
                setState={setViewScoutingData}
              />
            </div>
          ) :
          (
            <SettingsViewMatchData />
          )
      } */}
        
      </main>

      {/* If the user has clicked the get match data button, render the SettingsMatchDataScanner component */}
      {matchDataGetClicked && (
        <SettingsMatchDataScanner
          state={matchDataGetClicked}
          setState={setMatchDataGetClicked}
        />
      )}
    </>
  );
};

export default SettingsPage;
