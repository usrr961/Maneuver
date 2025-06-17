import React from "react";

import ProceedBackButton from "../components/ProceedBackButton";
import { ModeToggle } from "@/components/mode-toggle";
// import HomeFullscreenButton from "../components/HomeComponents/HomeFullscreenButton";
// import HomeDumpDataButton from "../components/HomeComponents/HomeDumpDataButton";

// import VScouterLogo from "../assets/VScouterLogo.png";
// import FRCReefscapeLogo from "../assets/FRCReefscapeLogo.svg";

const HomePage = () => {
  return (
    <main className="flex-1 overflow-auto w-screen">
      <div className="flex flex-col w-full justify-center items-center py-8 px-8 gap-6">
        <div className="w-auto h-full justify-center items-center gap-6">
          <img
            src={"https://placehold.co/400"}
            className="row-span-4"
          />
          <img
            src={"https://placehold.co/400"}
            className="row-span-3"
            style={{
              width: "auto",
              filter: "invert(100%)",
            }}
          /> 
          <p className="text-white row-span-1">
            <strong>Version</strong>: 2.0.0
          </p>
        </div>

        {/* <div className="grid grid-rows-5 h-full w-full gap-2 flex-1">
          <div className="row-span-2 w-full">
            <ProceedBackButton
              nextPage={`/game-start`}
              message={"Start Scouting"}
            />
          </div>
          <ProceedBackButton
              nextPage={`/game-start`}
              message={"Start Scouting"}
            />            <ProceedBackButton
            nextPage={`/game-start`}
            message={"Start Scouting"}
          />            <ProceedBackButton
          nextPage={`/game-start`}
          message={"Start Scouting"}
        />
          <HomeDumpDataButton />
          <ProceedBackButton nextPage={`/settings`} message={"Settings"} />
          <HomeFullscreenButton />
        </div> */}

      </div>
    </main>
  );
};

export default HomePage;
