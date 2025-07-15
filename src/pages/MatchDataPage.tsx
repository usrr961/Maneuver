import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner"
import Button from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const MatchDataPage = () => {
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState("");

  const [qrCodeMatchData, setQRCodeMatchData] = useState(""); // The URL to the match data

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

  const doneClick = async () => {
    if (selectedData) {
      localStorage.setItem("matchData", selectedData);
    } else if (qrCodeMatchData) {
      const qrCodeMatchDataParsed = JSON.parse(qrCodeMatchData)
      try {
        const headers = {
          "X-TBA-Auth-Key": qrCodeMatchDataParsed.apiKey,
        };
        const res = await fetch(
          `https://www.thebluealliance.com/api/v3/event/${qrCodeMatchDataParsed.eventKey}/matches/simple`,
          { headers }
        ); // Fetching the data from the URL
        const fullData = await res.json();

        const qualMatchesCleaned = [];

        for (const match of fullData) {
          if (match.comp_level == "qm") {
            qualMatchesCleaned.push({
              matchNum: match["match_number"],
              redAlliance: match.alliances.red.team_keys.map((team: string) =>
                team.replace("frc", "")
              ),
              blueAlliance: match.alliances.blue.team_keys.map((team: string) =>
                team.replace("frc", "")
              ),
            });
          }
        }
        
        // Sort the match data by matchNum
        qualMatchesCleaned.sort((a, b) => a.matchNum - b.matchNum);

        localStorage.setItem("matchData", JSON.stringify(qualMatchesCleaned)); // Storing the data in local storage so it can be accessed if the website is refreshed

        const matchDataStr = localStorage.getItem("matchData");
        let fetchedMsg = "Match Data Fetched";
        if (matchDataStr) {
          const matchData = JSON.parse(matchDataStr);
          if (Array.isArray(matchData) && matchData.length > 0 && matchData[0].redAlliance && matchData[0].redAlliance.length > 0) {
            fetchedMsg += ": " + matchData[0].redAlliance[0];
          }
        }
        toast.success(fetchedMsg); // Notifying the user that the data has been fetched
        navigate("/"); // Navigating back to the home page
      } catch (err) {
        // If anything goes wrong, notify the user
        toast.error("Invalid Data");
        console.log(err);
      }
    };
  };
  return (
    <main
      className={cn(
        "h-full w-full overflow-none",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
      )}
    >
      <input
        type="file"
        id="selectFiles"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <div className="flex flex-col w-full h-full items-center">
        <div className="overflow-hidden flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold p-4">Scan QR Code for Match Data</h1>
          <div className="flex flex-1 items-center justify-center overflow-hidden">
            <Scanner
              components={{ finder: false }}
              styles={{ video: { borderRadius: "7.5%" } }}
              onScan={(result) => {
                setQRCodeMatchData(result[0].rawValue); // If the QR code is found, set the URL
                toast.success("QR Code is Scanned Successfully");
              }}
              onError={() =>
                // If the QR code is not found, notify the user
                toast.error("Invalid QR Code/User Canceled Prompt")
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the generated QR code to fetch match data from The Blue Alliance.
          </p>
          <div className="flex items-center justify-center gap-4 w-full max-w-md">
            <Separator className="w-full" />
            <p className="text-center text-xl font-bold">
              OR
            </p>
            <Separator className="w-full" />
          </div>
          <Button
            type="button"
            variant={"secondary"}
            className="flex w-full h-16 items-center justify-center ~text-2xl/5xl text-center"
            onClick={() => {
              const input = document.getElementById("selectFiles");
              if (input) input.click();
            }}
          >
            Upload Match Data JSON
          </Button>
          <Button
            className="flex w-full h-16 items-center justify-center ~text-2xl/5xl text-center mt-4"
            onClick={() => doneClick()}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className="pointer-events-none absolute mt-7 top-[var(--header-height)] left-0 right-0 bottom-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black"></div>
    </main>
  );
};

export default MatchDataPage;
