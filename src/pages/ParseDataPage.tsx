import React from "react";
import ParseDataSelector from "@/components/ParseDataComponents/ParseDataSelector";

const ParseDataPage = () => {
  return (
    <>
      <div className="flex flex-col w-full justify-center items-center whitespace-pre-wrap break-word">
        <h2 className="text-white font-bold text-2xl text-center p-8">
          Plug the flash drives into the computer and upload the files here.
        </h2>
      </div>
      <ParseDataSelector />
    </>
  );
};

export default ParseDataPage;
