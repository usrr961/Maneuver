import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const JSONDownloader = ({ onBack, onSwitchToUpload }) => {
  const isOneDimensional = (value) => {
    if (
      typeof value == "string" ||
      typeof value == "boolean" ||
      typeof value == "number"
    ) {
      return true;
    }
    return false;
  };

  const convertToCamelCase = (word1, word2) => {
    if (word1 == "") {
      return word2;
    }
    return word1 + (word2.charAt(0).toUpperCase() + word2.slice(1));
  };

  const addHeaders = (data, previousKey = "") => {
    let headers = [];
    for (const [key, value] of Object.entries(data)) {
      if (isOneDimensional(value)) {
        headers.push(convertToCamelCase(previousKey, key));
      } else if (Array.isArray(value)) {
        for (let arrayIndex = 0; arrayIndex < value.length; arrayIndex++) {
          if (isOneDimensional(value[arrayIndex])) {
            headers.push(convertToCamelCase(previousKey, key) + arrayIndex);
          } else {
            headers = [
              ...headers,
              ...addHeaders(value[arrayIndex], convertToCamelCase(key, subKey)),
            ];
          }
        }
      } else {
        // Dict
        for (const [subKey, subValue] of Object.entries(value)) {
          if (isOneDimensional(subValue)) {
            headers.push(convertToCamelCase(key, subKey)); // key + subKey = keySubKey
          } else {
            headers = [
              ...headers,
              ...addHeaders(subValue, convertToCamelCase(key, subKey)),
            ];
          }
        }
      }
    }
    return headers;
  };

  const addRow = (data) => {
    let row = [];
    for (const [key, value] of Object.entries(data)) {
      if (isOneDimensional(value)) {
        row.push(value);
      } else if (Array.isArray(value)) {
        for (let arrayIndex = 0; arrayIndex < value.length; arrayIndex++) {
          if (isOneDimensional(value[arrayIndex])) {
            row.push(value[arrayIndex]);
          } else {
            row = [
              ...row,
              ...addRow(value[arrayIndex]),
            ];
          }
        }
      } else {
        // Dict
        for (const [subKey, subValue] of Object.entries(value)) {
          if (isOneDimensional(subValue)) {
            row.push(subValue); // key + subKey = keySubKey
          } else {
            row = [
              ...row,
              ...addRow(subValue),
            ];
          }
        }
      }
    }
    return row;
  };

  const cleanText = (text) => {
    if (typeof text !== "string") return text;
    // Remove non-printable characters and trim extra spaces
    return text.replace(/[\x00-\x1F\x7F]/g, "").trim();
  };

  const handleDownloadJSON = () => {
    const data = localStorage.getItem("scoutingData");
    if (!data || data === '{"data":[]}') {
      toast.error("No scouting data to download");
      return;
    }

    try {
      const jsonData = JSON.parse(data).data;
      const playerStation = localStorage.getItem("playerStation") || "Unknown";

      // Clean the comments column
      const cleanedData = jsonData.map((row) => {
        if (row.comment) {
          row.comment = cleanText(row.comment);
        }
        return row;
      });

      const csvConvertedData = [];
      csvConvertedData.push(addHeaders(cleanedData[0]));
      for (const value of Object.values(cleanedData)) {
        csvConvertedData.push(addRow(value));
      }

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(csvConvertedData))
      );
      element.setAttribute(
        "download",
        `VScouterData-${new Date().toLocaleTimeString()}-${playerStation}.json`
      );

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

      toast.success(`Downloaded scouting data for station ${playerStation}`);
    } catch (error) {
      toast.error("Error downloading data");
      console.error("Download error:", error);
    }
  };

  const handleDownloadRawJSON = () => {
    const data = localStorage.getItem("scoutingData");
    if (!data || data === '{"data":[]}') {
      toast.error("No scouting data to download");
      return;
    }

    try {
      const playerStation = localStorage.getItem("playerStation") || "Unknown";
      
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(data)
      );
      element.setAttribute(
        "download",
        `RawScoutingData-${new Date().toLocaleTimeString()}-${playerStation}.json`
      );

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

      toast.success("Downloaded raw scouting data");
    } catch (error) {
      toast.error("Error downloading raw data");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center gap-6 px-4 pt-[var(--header-height)]">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Navigation Header */}
        <div className="flex items-center justify-between w-full">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            ← Back
          </Button>
          <Button 
            onClick={onSwitchToUpload} 
            variant="outline" 
            size="sm"
          >
            Switch to Upload
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Download Scouting Data</CardTitle>
            <CardDescription className="text-center">
              Download your collected scouting data as JSON files for transfer or backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleDownloadJSON}
              className="w-full h-16 text-xl"
            >
              Download Processed JSON
            </Button>
            
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            
            <Button
              onClick={handleDownloadRawJSON}
              variant="outline"
              className="w-full h-16 text-xl"
            >
              Download Raw JSON
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <div className="space-y-1">
              <p>• Processed JSON: CSV-formatted data for analysis</p>
              <p>• Raw JSON: Original scouting data structure</p>
              <p>• Files include player station identifier</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default JSONDownloader;