/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { loadLegacyScoutingData } from "../../lib/scoutingDataUtils";

interface JSONDownloaderProps {
  onBack: () => void;
  onSwitchToUpload: () => void;
}

const JSONDownloader = ({ onBack, onSwitchToUpload }: JSONDownloaderProps) => {
  const isOneDimensional = (value: unknown) => {
    if (
      typeof value == "string" ||
      typeof value == "boolean" ||
      typeof value == "number"
    ) {
      return true;
    }
    return false;
  };

  const convertToCamelCase = (word1: string, word2: string) => {
    if (word1 == "") {
      return word2;
    }
    return word1 + (word2.charAt(0).toUpperCase() + word2.slice(1));
  };

  const addHeaders = (data: unknown, previousKey = "") => {
    let headers: any[] = [];
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return headers;
    }
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (isOneDimensional(value)) {
        headers.push(convertToCamelCase(previousKey, key));
      } else if (Array.isArray(value)) {
        for (let arrayIndex = 0; arrayIndex < value.length; arrayIndex++) {
          if (isOneDimensional(value[arrayIndex])) {
            headers.push(convertToCamelCase(previousKey, key) + arrayIndex);
          } else {
            headers = [
              ...headers,
              ...addHeaders(value[arrayIndex], convertToCamelCase(previousKey, key)),
            ];
          }
        }
      } else {
        // Dict
        for (const [subKey, subValue] of Object.entries(value as Record<string, unknown>)) {
          if (isOneDimensional(subValue)) {
            headers.push(convertToCamelCase(convertToCamelCase(previousKey, key), subKey));
          } else {
            headers = [
              ...headers,
              ...addHeaders(subValue, convertToCamelCase(convertToCamelCase(previousKey, key), subKey)),
            ];
          }
        }
      }
    }
    return headers;
  };
  const addRow = (data: unknown) => {
    let row: any[] = [];
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return row;
    }
    for (const [, value] of Object.entries(data as Record<string, unknown>)) {
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
        for (const [, subValue] of Object.entries(value as Record<string, unknown>)) {
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

  const cleanText = (text: string) => {
    if (typeof text !== "string") return text;
    // Remove non-printable characters and trim extra spaces
    return text.replace(/[\x00-\x1F\x7F]/g, "").trim();
  };

  const handleDownloadJSON = () => {
    try {
      const jsonData = loadLegacyScoutingData();
      if (jsonData.length === 0) {
        toast.error("No scouting data to download");
        return;
      }

      const playerStation = localStorage.getItem("playerStation") || "Unknown";

      // Clean the comments column (assuming it's at a specific index)
      const cleanedData = jsonData.map((row: unknown[]) => {
        // Create a copy of the row
        const cleanedRow = [...row];
        // If there's a comment field at a specific index, clean it
        // You may need to adjust this index based on your data structure
        const commentIndex = row.length - 1; // Assuming comment is the last column
        if (typeof cleanedRow[commentIndex] === 'string') {
          cleanedRow[commentIndex] = cleanText(cleanedRow[commentIndex] as string);
        }
        return cleanedRow;
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
        `Maneuver-${new Date().toLocaleTimeString()}-${playerStation}.json`
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
    try {
      const jsonData = loadLegacyScoutingData();
      if (jsonData.length === 0) {
        toast.error("No scouting data to download");
        return;
      }

      const playerStation = localStorage.getItem("playerStation") || "Unknown";
      
      // Convert back to the original format for raw download
      const rawData = { data: jsonData };
      
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawData))
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