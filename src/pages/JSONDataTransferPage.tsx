
import { useState } from "react";
import Button from "@/components/ui/button";
import JSONUploader from "@/components/DataTransferComponents/JSONUploader";
import { convertArrayOfArraysToCSV, SCOUTING_DATA_HEADER } from "@/lib/utils";


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

  // Handler to download scouting data as CSV
  const handleDownloadCSV = () => {
    try {
      const scoutingDataRaw = localStorage.getItem("scoutingData");
      if (!scoutingDataRaw) {
        alert("No scouting data found in localStorage.");
        return;
      }
      let dataArr = [];
      const defaultHeader = SCOUTING_DATA_HEADER;
      try {
        const parsed = JSON.parse(scoutingDataRaw);
        if (Array.isArray(parsed)) {
          dataArr = parsed;
        } else if (parsed && Array.isArray(parsed.data)) {
          dataArr = parsed.data;
        } else {
          alert("Scouting data format is invalid.");
          return;
        }
      } catch {
        alert("Failed to parse scouting data.");
        return;
      }
      if (!Array.isArray(dataArr[0]) || dataArr[0].length !== defaultHeader.length || dataArr[0].some((v, i) => v !== defaultHeader[i])) {
        dataArr = [defaultHeader, ...dataArr];
      }
      const csv = convertArrayOfArraysToCSV(dataArr);
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
    } catch {
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
            onClick={() => {
              // Download scoutingData as a plain array (like VScouterData), always including header row
              const scoutingDataRaw = localStorage.getItem("scoutingData");
              if (!scoutingDataRaw) {
                alert("No scouting data found in localStorage.");
                return;
              }
              let dataArr = [];
              // Use shared header
              const defaultHeader = SCOUTING_DATA_HEADER;
              try {
                const parsed = JSON.parse(scoutingDataRaw);
                if (Array.isArray(parsed)) {
                  dataArr = parsed;
                } else if (parsed && Array.isArray(parsed.data)) {
                  dataArr = parsed.data;
                } else {
                  alert("Scouting data format is invalid.");
                  return;
                }
              } catch {
                alert("Failed to parse scouting data.");
                return;
              }
              // Ensure header row is present as first row
              if (!Array.isArray(dataArr[0]) || dataArr[0].length !== defaultHeader.length || dataArr[0].some((v, i) => v !== defaultHeader[i])) {
                dataArr = [defaultHeader, ...dataArr];
              }
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