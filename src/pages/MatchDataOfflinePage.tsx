import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SettingsBackButton from "../components/SettingsComponents/SettingsBackButton";

const MatchDataOfflinePage = () => {
  const navigate = useNavigate();

  const [selectedData, setSelectedData] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files.item(0);

    const getText = async () => {
      try {
        const text = await file.text();
        
        setSelectedData(JSON.stringify(JSON.parse(text).matches));
        toast.success("Data Loaded");
      } catch {
        toast.error("Error In Loading");
      }
    };
    getText();
  };

  const doneClick = () => {
    localStorage.setItem("matchData", selectedData);
    
    
    toast.success(
      "Data Submitted: " +
        JSON.parse(localStorage.getItem("matchData"))[0].redAlliance[0]
    );
    navigate("/");
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <input
        type="file"
        id="selectFiles"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      {/* back button */}
      <SettingsBackButton route={"/match-data"}/>

      {/* container */}
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <h1 className="text-white font-bold ~text-2xl/5xl text-center pb-4">
          Scan QR Code To Load Match Suggestions
        </h1>
        <div className="flex w-full h-full items-center justify-center gap-4 px-4">
          <button
            type="button"
            className="flex w-full h-full justify-center items-center gap-4 bg-[#242424] border-8 border-[#1D1E1E] rounded-xl p-4 text-white font-bold ~text-2xl/5xl text-center"
            onClick={() => document.getElementById("selectFiles").click()}
          >
            Upload Match File
          </button>
          <button
            type="button"
            className="flex w-full h-full justify-center items-center gap-4 bg-[#242424] border-8 border-[#1D1E1E] rounded-xl p-4 text-white font-bold ~text-2xl/5xl text-center"
            onClick={() => doneClick()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchDataOfflinePage;
