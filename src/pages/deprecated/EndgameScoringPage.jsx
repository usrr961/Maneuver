import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ProceedBackButton from "../components/ProceedBackButton";
import EndgameScoringBargeSection from "../components/EndgameScoringComponents/EndgameScoringBargeSection";
import EndgameScoringToggle from "../components/EndgameScoringComponents/EndgameScoringToggle";
import EndgameScoringComments from "../components/EndgameScoringComponents/EndgameScoringComments";

const EndgameScoringPage = () => {
  const location = useLocation();
  const states = location.state;

  const [shallowClimbAttempted, setShallowClimbAttempted] = useState(
    states?.inputs?.shallowClimbAttempted || false
  );
  const [deepClimbAttempted, setDeepClimbAttempted] = useState(
    states?.inputs?.deepClimbAttempted || false
  );
  const [parkAttempted, setParkAttempted] = useState(
    states?.inputs?.parkAttempted || false
  );

  const climbData = [
    {
      position: "Shallow Climb",
      selected: shallowClimbAttempted,
      setSelected: setShallowClimbAttempted,
    },
    {
      position: "Deep Climb",
      selected: deepClimbAttempted,
      setSelected: setDeepClimbAttempted,
    },
    {
      position: "Park",
      selected: parkAttempted,
      setSelected: setParkAttempted,
    },
  ];

  const [climbFailed, setClimbFailed] = useState(
    states?.inputs?.climbFailed || false
  );
  const [playedDefense, setPlayedDefense] = useState(
    states?.inputs?.playedDefense || false
  );
  const [brokeDown, setBrokeDown] = useState(
    states?.inputs?.brokeDown || false
  );

  const [comment, setComment] = useState(states?.inputs?.comment || "");

  return (
    <main className="flex flex-col w-full h-full justify-center items-center px-5 py-3 gap-2">
      <h1 className="text-white ~text-4xl/7xl font-bold w-full h-fit text-center py-2">
        Endgame Scoring
      </h1>
      <EndgameScoringBargeSection climbData={climbData} />
      <section className="flex w-full gap-1 py-4">
        <EndgameScoringToggle
          question={"Climbed Failed"}
          selected={climbFailed}
          setSelected={setClimbFailed}
        />
        <EndgameScoringToggle
          question={"Played Defense"}
          selected={playedDefense}
          setSelected={setPlayedDefense}
        />
        <EndgameScoringToggle
          question={"Broke Down"}
          selected={brokeDown}
          setSelected={setBrokeDown}
        />
      </section>
      <section className="flex w-full h-full gap-2">
        <div className="flex w-2/3 h-full">
          <EndgameScoringComments comment={comment} setComment={setComment} />
        </div>
        <div className="flex flex-col w-1/3 h-full gap-2">
          <ProceedBackButton
            back={true}
            nextPage="/teleop-scoring"
            inputs={{
              ...(states?.inputs || {}),
              shallowClimbAttempted,
              deepClimbAttempted,
              parkAttempted,
              climbFailed,
              playedDefense,
              brokeDown,
              comment,
            }}
          />
          <ProceedBackButton
            nextPage={`/game-start`}
            inputs={{
              ...(states?.inputs || {}),
              shallowClimbAttempted,
              deepClimbAttempted,
              parkAttempted,
              climbFailed,
              playedDefense,
              brokeDown,
              comment,
            }}
            message={"Submit"}
          />
        </div>
      </section>
    </main>
  );
};

export default EndgameScoringPage;
