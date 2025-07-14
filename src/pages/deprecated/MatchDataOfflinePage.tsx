import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

const MatchDataOfflinePage = () => {
  const navigate = useNavigate();

  const [selectedData, setSelectedData] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files.item(0);

    const getText = async () => {
      try {
        const text = await file.text();
        
        setSelectedData(JSON.stringify(JSON.parse(text).matches));
        // toast.success("Data Loaded");
      } catch {
        // toast.error("Error In Loading");
      }
    };
    getText();
  };

  const doneClick = () => {
    localStorage.setItem("matchData", selectedData);
    
    
    // toast.success(
    //   "Data Submitted: " +
    //     JSON.parse(localStorage.getItem("matchData"))[0].redAlliance[0]
    // );
    navigate("/");
  };

  return (
    <div className="w-full h-full">
      <input
        type="file"
        id="selectFiles"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <div className="h-full w-full overflow-none items-center justify-center">
        <div className="overflow-hidden flex flex-col items-center justify-center gap-4 py-16">
          <Button
            type="button"
            className="flex w-full max-w-1/2 h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
            onClick={() => {
              const input = document.getElementById("selectFiles");
              if (input) input.click();
            }}
          >
            Upload Match File
          </Button>
          <Button
            type="button"
            className="flex w-full max-w-1/2 h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
            onClick={() => doneClick()}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchDataOfflinePage;
