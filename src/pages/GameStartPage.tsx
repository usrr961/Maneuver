import { useState } from "react";
import { useLocation } from "react-router-dom";
import GameStartSelectAlliance from "@/components/GameStartComponents/GameStartSelectAlliance";
import GameStartTextInput from "@/components/GameStartComponents/GameStartTextInput";
import GameStartSelectTeam from "@/components/GameStartComponents/GameStartSelectTeam";
import Button from "@/components/ui/button";

/**
 * Renders a component representing the Game Start Page.
 *
 * To be used before the game starts, collecting information such as match number, scouter initials, and the team that is being scouted.
 *
 * @return {JSX.Element} The component representing the Game Start Page.
 */
const GameStartPage = () => {
  const location = useLocation();
  const states = location.state;
  

  // Initialize the state with the passed in state from the previous page, or null if no state was passed in
  const [alliance, setAlliance] = useState(states?.inputs?.alliance || null);
  const [matchNumber, setMatchNumber] = useState(
    states?.inputs?.matchNumber || null
  );
  const [scouterInitials, setScouterInitials] = useState(
    states?.inputs?.scouterInitials || null
  );
  const [selectTeam, setSelectTeam] = useState(
    states?.inputs?.selectTeam || null
  );

  return (
    <>
      <div className="flex justify-center items-center h-fit w-full px-4 pt-16">
        <div className="flex flex-col h-fit w-full max-w-2/3 justify-center gap-4">
          <div className="flex h-full w-full gap-6">
            <GameStartTextInput
              question="Match Number"
              setTextValue={setMatchNumber}
              defaultText={matchNumber}
              numberOnly={true}
            />
            <GameStartSelectAlliance
              currentAlliance={alliance}
              setAlliance={setAlliance}
            />
            <GameStartTextInput
              question="Scouter Initials"
              setTextValue={setScouterInitials}
              defaultText={scouterInitials}
            />
          </div>
          <div className="flex flex-col h-full w-full gap-6">
            <div>
              <GameStartSelectTeam
                defaultSelectTeam={selectTeam}
                setSelectTeam={setSelectTeam}
                selectedMatch={matchNumber}
                selectedAlliance={alliance}
              />
            </div>
            <div className="flex justify-between">
              <div className="flex w-full justify-left items-start">
                <Button 
                  className="w-full h-16 items-center justify-center p-4 text-2xl text-center"
                  onClick={() => {
                    localStorage.setItem("matchData", JSON.stringify([]));
                    localStorage.setItem("matchNumber", matchNumber);
                    localStorage.setItem("scouterInitials", scouterInitials);
                    localStorage.setItem("selectTeam", selectTeam);
                    localStorage.setItem("alliance", alliance);
                  }}>
                  Start Scouting
                </Button>
              </div>
              {/* <div
                className="flex flex-col h-full w-full gap-6">
                <div>
                  <ProceedBackButton nextPage={`/`} back={true} />
                </div>
                <div>
                  <ProceedBackButton
                    nextPage={`/auto-start`}
                    inputs={{
                      ...(states?.inputs || {}),
                      matchNumber: matchNumber,
                      alliance: alliance,
                      scouterInitials: scouterInitials,
                      selectTeam: selectTeam,
                    }}
                  />
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameStartPage;
