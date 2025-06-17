import React from "react";
import ParseDataSelector from "../components/ParseDataComponents/ParseDataSelector";
import ProceedBackButton from "../components/ProceedBackButton";

const ParseDataPage = () => {
  return (
    <>
      <div className="flex w-fit h-full justify-between items-center p-2">
        <ProceedBackButton nextPage={`/settings`} back={true} />
      </div>
      <div className="flex flex-col w-full h-full justify-center items-center whitespace-pre-wrap break-word">
        <h1 className="text-white font-bold ~text-3xl/6xl text-center pb-4">
          Parse Data
        </h1>
        <h2 className="text-white font-bold ~text-1xl/4xl text-center pb-4">
          Plug the flash drives into the computer and upload the files here.
        </h2>
      </div>
      <ParseDataSelector />
    </>
  );
};

export default ParseDataPage;
