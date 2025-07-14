import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ProceedBackButton from "../components/deprecated/ProceedBackButton";
import GameStartSelectAlliance from "../components/GameStartComponents/GameStartSelectAlliance";
import GameStartTextInput from "../components/GameStartComponents/GameStartTextInput";
import GameStartSelectTeam from "../components/GameStartComponents/GameStartSelectTeam";

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
  console.log(states.inputs);
  

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
      <div className="flex justify-center items-center h-fit w-screen p-3">
        <div className="flex h-fit w-full justify-center gap-10">
          <div className="flex flex-col h-full w-96 gap-6">
            <div>
              <GameStartTextInput
                question="Match Number"
                setTextValue={setMatchNumber}
                defaultText={matchNumber}
                numberOnly={true}
              />
            </div>
            <div>
              <GameStartSelectAlliance
                currentAlliance={alliance}
                setAlliance={setAlliance}
              />
            </div>
            <div>
              <GameStartTextInput
                question="Scouter Initials"
                setTextValue={setScouterInitials}
                defaultText={scouterInitials}
              />
            </div>
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
              <div className="flex w-full justify-left items-start lg:items-center lg:justify-center">
                <h1 className="text-white text-5xl font-bold">
                  Game Start
                </h1>
              </div>
              <div
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameStartPage;
