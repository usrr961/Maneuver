import React from "react";

/**
 * @returns A component that displays the current match data stored in local storage.
 */
const SettingsViewMatchData = () => {
  return (
    <>
      <div
        className="flex w-full h-full bg-[#242424] border-8 border-[#1D1E1E] rounded-xl overflow-y-scroll overflow-x-hidden mb-4"
      >
        <p className="text-white text-3xl">
          {localStorage.getItem("matchData")}
        </p>
      </div>
    </>
  );
};

export default SettingsViewMatchData;
