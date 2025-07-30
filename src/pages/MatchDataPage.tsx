import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"
import Button from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const MatchDataPage = () => {
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState("");
  
  // Direct API input states
  const [apiKey, setApiKey] = useState("");
  const [eventKey, setEventKey] = useState("");

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

  const fetchMatchDataFromTBA = async (tbaApiKey: string, tbaEventKey: string) => {
    try {
      const headers = {
        "X-TBA-Auth-Key": tbaApiKey,
      };
      const res = await fetch(
        `https://www.thebluealliance.com/api/v3/event/${tbaEventKey}/matches/simple`,
        { headers }
      );
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
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

      localStorage.setItem("matchData", JSON.stringify(qualMatchesCleaned));

      const matchDataStr = localStorage.getItem("matchData");
      let fetchedMsg = "Match Data Fetched";
      if (matchDataStr) {
        const matchData = JSON.parse(matchDataStr);
        if (Array.isArray(matchData) && matchData.length > 0 && matchData[0].redAlliance && matchData[0].redAlliance.length > 0) {
          fetchedMsg += `: ${qualMatchesCleaned.length} matches for ${tbaEventKey}`;
        }
      }
      toast.success(fetchedMsg);
      navigate("/");
    } catch (err) {
      toast.error("Failed to fetch match data from TBA");
      console.error(err);
    }
  };

  const doneClick = async () => {
    if (selectedData) {
      localStorage.setItem("matchData", selectedData);
      toast.success("Match data loaded from file");
      navigate("/");
    } else if (apiKey && eventKey) {
      await fetchMatchDataFromTBA(apiKey, eventKey);
    } else {
      toast.error("Please provide match data via file upload or direct API input");
    }
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

        <div className="w-full max-w-md space-y-3">
          <div className="space-y-1">
            <label htmlFor="apiKey" className="text-sm font-medium">
              TBA API Key
            </label>
            <Input
              id="apiKey"
              type="text"
              placeholder="Enter your Blue Alliance API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="eventKey" className="text-sm font-medium">
              Event Key
            </label>
            <Input
              id="eventKey"
              type="text"
              placeholder="e.g., 2024chcmp"
              value={eventKey}
              onChange={(e) => setEventKey(e.target.value)}
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from <a href="https://www.thebluealliance.com/account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">The Blue Alliance</a>
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 w-full max-w-md">
          <Separator className="flex-1" />
          <p className="text-center text-xl font-bold">OR</p>
          <Separator className="flex-1" />
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
          className="flex w-full max-w-md h-16 items-center justify-center text-xl text-center mt-8"
          onClick={() => doneClick()}
        >
          Submit
        </Button>
      </div>
    </main>
  );
};

export default MatchDataPage;
