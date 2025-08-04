
import { useState } from "react";
import Button from "@/components/ui/button";
import JSONUploader from "@/components/DataTransferComponents/JSONUploader";
import { convertArrayOfArraysToCSV, SCOUTING_DATA_HEADER } from "@/lib/utils";
import { loadScoutingData, extractLegacyData } from "@/lib/scoutingDataUtils";


const JSONDataTransferPage = () => {
  const [mode, setMode] = useState<'select' | 'upload'>('select');

  if (mode === 'upload') {
    return (
      <JSONUploader 
        onBack={() => setMode('select')} 
        onSwitchToDownload={() => setMode('select')} 
      />
    );
  }

  const handleDownloadCSV = async () => {
    try {
      const scoutingDataWithIds = await loadScoutingData();
      console.log("JSONDataTransferPage CSV - Loaded data:", scoutingDataWithIds.entries.length, "entries");
      
      if (scoutingDataWithIds.entries.length === 0) {
        alert("No scouting data found.");
        return;
      }

      const dataArr = extractLegacyData(scoutingDataWithIds.entries);
      console.log("JSONDataTransferPage CSV - Legacy data:", dataArr.length, "entries");
      
      const defaultHeader = SCOUTING_DATA_HEADER;
      const finalDataArr = [defaultHeader, ...dataArr];
      
      const csv = convertArrayOfArraysToCSV(finalDataArr as (string | number)[][]);
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
      );
      element.setAttribute(
        "download",
        `ManeuverScoutingData-${new Date().toLocaleTimeString()}-local.csv`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error("Failed to export scouting data as CSV:", error);
      alert("Failed to export scouting data as CSV.");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <p className="text-center text-muted-foreground">
          Export your scouting data as CSV for analysis, or upload JSON files to overwrite your local data storage.
        </p>


        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={async () => {
              try {
                const scoutingDataWithIds = await loadScoutingData();
                console.log("JSONDataTransferPage JSON - Loaded data:", scoutingDataWithIds.entries.length, "entries");
                
                if (scoutingDataWithIds.entries.length === 0) {
                  alert("No scouting data found.");
                  return;
                }

                const dataArr = extractLegacyData(scoutingDataWithIds.entries);
                console.log("JSONDataTransferPage JSON - Legacy data:", dataArr.length, "entries");
                
                const element = document.createElement("a");
                element.setAttribute(
                  "href",
                  "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataArr, null, 2))
                );
                element.setAttribute(
                  "download",
                  `ManeuverScoutingData-${new Date().toLocaleTimeString()}.json`
                );
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              } catch (error) {
                console.error("Failed to export scouting data as JSON:", error);
                alert("Failed to export scouting data as JSON.");
              }
            }}
            className="w-full h-16 text-xl"
          >
            Download Scouting Data as JSON
          </Button>
          <Button
            onClick={handleDownloadCSV}
            variant="secondary"
            className="w-full h-16 text-xl"
          >
            Download Scouting Data as CSV
          </Button>
          <Button
            onClick={() => setMode('upload')}
            variant="outline"
            className="w-full h-16 text-xl"
          >
            Upload JSON Data
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• CSV: Export scouting data for spreadsheet analysis</p>
          <p>• Upload: Import data from other devices</p>
          <p>• Supports both scouting and match schedule data</p>
        </div>
      </div>
    </div>
  );
};

export default JSONDataTransferPage;