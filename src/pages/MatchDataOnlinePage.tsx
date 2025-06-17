import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
// import { toast } from "react-toastify";
import SettingsBackButton from "../components/SettingsComponents/SettingsBackButton";
import Button from "@/components/ui/Button";

const MatchDataOnlinePage = () => {
  const navigate = useNavigate();

  const [qrCodeMatchData, setQRCodeMatchData] = useState({}); // The URL to the match data

  const doneClick = async () => {
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
            redAlliance: match.alliances.red.team_keys.map((team) =>
              team.replace("frc", "")
            ),
            blueAlliance: match.alliances.blue.team_keys.map((team) =>
              team.replace("frc", "")
            ),
          });
        }
      }
      
      // Sort the match data by matchNum
      qualMatchesCleaned.sort((a, b) => a.matchNum - b.matchNum);

      localStorage.setItem("matchData", JSON.stringify(qualMatchesCleaned)); // Storing the data in local storage so it can be accessed if the website is refreshed

      // toast.success(
      //   "Match Data Fetched: " +
      //     JSON.parse(localStorage.getItem("matchData"))[0].redAlliance[0]
      // ); // Notifying the user that the data has been fetched

      navigate("/"); // Navigating back to the home page
    } catch (err) {
      // If anything goes wrong, notify the user
      //toast.error("Invalid Data");
      console.log(err);
    }
  };

  return (
    <main className="h-full w-screen">
      {/* back button */}
      <SettingsBackButton route={"/match-data"}/>

      {/* container */}
      <div className="flex flex-col w-full h-full items-center justify-center">
        <h1 className="text-white font-bold ~text-2xl/5xl text-center pb-4">
          Scan QR Code To Load Match Suggestions
        </h1>
        <div className="flex w-full h-full gap-4 items-center justify-center">
          <div className="w-1/2 h-full">
            <Scanner
              components={{ finder: false }}
              styles={{ video: { borderRadius: "7.5%" } }}
              onScan={(result) => {
                setQRCodeMatchData(result[0].rawValue); // If the QR code is found, set the URL
                //toast.success("QR Code is Scanned Successfully");
              }}
              onError={() =>
                // If the QR code is not found, notify the user
                console.log("Invalid QR Code/User Canceled Prompt")
                //toast.error("Invalid QR Code/User Canceled Prompt")
              }
            />
          </div>
          <Button
            className="flex w-fit h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
            onClick={() => doneClick()}
          >
            Submit
          </Button>
        </div>
      </div>
    </main>
  );
};

export default MatchDataOnlinePage;
