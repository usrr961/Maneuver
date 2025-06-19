import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
// import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import NavigationButton from "@/components/NavigationButton";

const MatchDataOnlinePage = () => {
  const navigate = useNavigate();

  const [qrCodeMatchData, setQRCodeMatchData] = useState(""); // The URL to the match data

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
    <main className="h-full w-screen overflow-none">
      {/* back button */}

      {/* container */}
      <div className="flex flex-col w-full h-full items-center">
        <div className="grid grid-cols-3 items-center w-full">
          <div className="items-center justify-center flex col-span-1">
            <NavigationButton variant={"outline"} destination={"/match-data"} className="w-32 h-16">
              Back
            </NavigationButton>
          </div>
          <h1 className="col-span-1 text-primary font-bold ~text-2xl/5xl mx-auto text-center py-6">
            Scan QR Code To Load Match Suggestions
          </h1>
        </div>

        <div className="overflow-hidden flex flex-col items-center justify-center">
          <div className="flex flex-1 items-center justify-center overflow-hidden pb-8">
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
            className="flex w-full h-16 items-center justify-center p-4 ~text-2xl/5xl text-center"
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
