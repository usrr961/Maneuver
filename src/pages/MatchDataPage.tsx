import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner"
import Button from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MatchDataPage = () => {
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState("");

  const [qrCodeMatchData, setQRCodeMatchData] = useState(""); // The URL to the match data

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("No file selected");
      return;
    }
    const file = files.item(0);
  
    const getText = async () => {
      try {
        const text = await file!.text();
        
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
    <main className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <input
          type="file"
          id="selectFiles"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />  
        <div className="w-full h-64 md:h-80 overflow-hidden rounded-lg">
          <Scanner
            components={{ finder: false }}
            styles={{ 
              video: { 
                borderRadius: "7.5%",
                width: "100%",
                height: "100%",
                objectFit: "cover"
              } 
            }}
            onScan={(result) => {
              setQRCodeMatchData(result[0].rawValue);
              toast.success("QR Code is Scanned Successfully");
            }}
            onError={() =>
              toast.error("Invalid QR Code/User Canceled Prompt")
            }
          />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Scan the generated QR code to fetch match data from The Blue Alliance.
        </p>
        
        <div className="flex items-center justify-center gap-4 w-full max-w-md">
          <Separator className="w-full max-w-xs" />
          <p className="text-center text-xl font-bold">OR</p>
          <Separator className="w-full max-w-xs" />
        </div>
        
        <Button
          type="button"
          variant={"secondary"}
          className="flex w-full max-w-md h-16 items-center justify-center text-xl text-center"
          onClick={() => {
            const input = document.getElementById("selectFiles");
            if (input) input.click();
          }}
        >
          Upload Match Data JSON
        </Button>
        
        <Button
          className="flex w-full max-w-md h-16 items-center justify-center text-xl text-center"
          onClick={() => doneClick()}
        >
          Submit
        </Button>
      </div>
    </main>
  );
};

export default MatchDataPage;
