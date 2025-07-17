import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import ProceedBackButton from "../components/ProceedBackButton";
import AutoStartMap from "../components/AutoStartComponents/AutoStartMap";

/**
 * Renders a component representing the Auto Start page.
 *
 * To be used before the auto starts, collecting information such as if the robot showed up and where the robot started.
 *
 * @return {JSX.Element} The component representing the Auto Start page.
 */
const AutoStartPage = () => {
  const location = useLocation();
  const states = location.state;

  // Initialize the state with the passed in state from the previous page, or null if no state was passed in
  const [startPos1, setStartPos1] = useState(
    states?.inputs?.startPoses?.[0] || null
  );
  const [startPos2, setStartPos2] = useState(
    states?.inputs?.startPoses?.[1] || null
  );
  const [startPos3, setStartPos3] = useState(
    states?.inputs?.startPoses?.[2] || null
  );
  const [startPos4, setStartPos4] = useState(
    states?.inputs?.startPoses?.[3] || null
  );
  const [startPos5, setStartPos5] = useState(
    states?.inputs?.startPoses?.[4] || null
  );
  const [startPos6, setStartPos6] = useState(
    states?.inputs?.startPoses?.[5] || null
  );

  const startPoses = [
    startPos1,
    startPos2,
    startPos3,
    startPos4,
    startPos5,
    startPos6,
  ];
  const setStartPoses = [
    setStartPos1,
    setStartPos2,
    setStartPos3,
    setStartPos4,
    setStartPos5,
    setStartPos6,
  ];

  useEffect(() => {
    const newStartPoses = startPoses.map((pos, index) => (pos === null ? setStartPoses[index](false) : pos));
  }, [startPoses]);

  return (
    <div className="flex w-full h-full justify-center items-center gap-5 p-2">
      <div className="w-full h-full"> 
        <AutoStartMap startPoses={startPoses} setStartPoses={setStartPoses} alliance={states.inputs.alliance}/>
      </div>

      <div className="flex flex-col gap-8 w-auto h-full">
        <h1 className="text-5xl font-bold text-white text-center">Auto Start</h1>
        <h2 className="text-2xl text-white text-center">Click where your robot starts on the field.</h2>
        <div className="w-full h-auto">
          <ProceedBackButton
            back={true}
            nextPage="/game-start"
            inputs={{
              ...(states?.inputs || {}),
              startPoses: startPoses.every((pos) => pos === null)
                ? [false, false, false, false, false, false]
                : startPoses,
            }}
          />
        </div>
        <div className="w-full h-auto">
          <ProceedBackButton
            nextPage={"/auto-scoring"}
            inputs={{
              ...(states?.inputs || {}),
              startPoses: startPoses.every((pos) => pos === false)
                ? [null, null, null, null, null, null]
                : startPoses,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AutoStartPage;
