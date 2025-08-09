import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  loadScoutingData, 
  saveScoutingData, 
  mergeScoutingData, 
  addIdsToScoutingData
} from "@/lib/scoutingDataUtils";

type JSONUploaderProps = {
  onBack: () => void;
};

const JSONUploader: React.FC<JSONUploaderProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  type FileSelectEvent = React.ChangeEvent<HTMLInputElement>

  const handleFileSelect = (event: FileSelectEvent): void => {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error("Please select a JSON file");
      return;
    }

    setSelectedFile(file);
    toast.info(`Selected: ${file.name}`);
  };

  interface RawScoutingData {
    data: unknown[];
  }

  type ProcessedScoutingData = unknown[][];

  type UploadMode = "append" | "overwrite" | "smart-merge";

  const handleUpload = async (mode: UploadMode): Promise<void> => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const text = await selectedFile.text();
      const jsonData: unknown = JSON.parse(text);

      // Validate scouting data structure
      let newData: unknown[] = [];
      if (
        typeof jsonData === "object" &&
        jsonData !== null &&
        "data" in jsonData &&
        Array.isArray((jsonData as RawScoutingData).data)
      ) {
        // Raw scouting data format
        newData = (jsonData as RawScoutingData).data;
      } else if (Array.isArray(jsonData)) {
        // Processed scouting data format - skip header row if it exists
        const hasHeaderRow =
          jsonData.length > 0 &&
          Array.isArray(jsonData[0]) &&
          typeof jsonData[0][0] === "string" &&
          jsonData[0].some(
            (cell: unknown) =>
              typeof cell === "string" &&
              (cell.includes("match") || cell.includes("team"))
          );

        newData = hasHeaderRow ? (jsonData as ProcessedScoutingData).slice(1) : (jsonData as ProcessedScoutingData);
      } else {
        toast.error("Invalid scouting data format");
        return;
      }

      // Load existing data using new utility
      const existingScoutingData = await loadScoutingData();
      
      // Convert new data to ID structure
      const newDataArrays = newData as unknown[][];
      const newDataWithIds = addIdsToScoutingData(newDataArrays);
      
      // Merge data based on mode
      const mergeResult = mergeScoutingData(
        existingScoutingData.entries,
        newDataWithIds,
        mode
      );
      
      // Save merged data
      await saveScoutingData({ entries: mergeResult.merged });
      
      // Create success message based on mode and results
      const { stats } = mergeResult;
      let message = '';
      
      if (mode === "overwrite") {
        message = `Overwritten with ${stats.final} scouting entries`;
      } else if (mode === "append") {
        message = `Appended ${stats.new} entries to existing ${stats.existing} entries (Total: ${stats.final})`;
      } else if (mode === "smart-merge") {
        if (stats.duplicates > 0) {
          message = `Smart merge: ${stats.new} new entries added, ${stats.duplicates} duplicates skipped (Total: ${stats.final})`;
        } else {
          message = `Smart merge: ${stats.new} new entries added (Total: ${stats.final})`;
        }
      }
      
      toast.success(message);

      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("jsonFileInput") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      toast.error("Error parsing JSON file");
      console.error("Upload error:", error);
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
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Upload Scouting Data</CardTitle>
            <CardDescription className="text-center">
              Upload JSON scouting data files to either overwrite your current data or append to your existing collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Selection */}
            <input
              type="file"
              id="jsonFileInput"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            
            <Button
              onClick={() => {
                const input = document.getElementById("jsonFileInput");
                if (input) input.click();
              }}
              variant="outline"
              className="w-full min-h-16 text-xl whitespace-normal text-wrap py-3 px-4"
            >
              {selectedFile ? `Selected: ${selectedFile.name}` : "Select Scouting Data JSON"}
            </Button>

            {/* Upload Options */}
            {selectedFile && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Button
                    onClick={() => handleUpload("smart-merge")}
                    className="w-full h-16 text-xl bg-green-500 hover:bg-green-600 text-white"
                  >
                    🧠 Smart Merge (Recommended)
                  </Button>
                   <p><strong>Smart Merge</strong>: Skip duplicates, add only new entries</p>
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  
                  <Button
                    onClick={() => handleUpload("append")}
                    className="w-full h-16 text-xl bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    📤 Force Append
                  </Button>
                   <p className="pb-4"><strong>Force Append</strong>: Add all data (may create duplicates)</p>
                  <Button
                    onClick={() => handleUpload("overwrite")}
                    variant="destructive"
                    className="w-full h-16 text-xl text-white"
                  >
                    🔄 Replace All Data
                  </Button>
                  <p><strong>Replace All</strong>: Completely overwrite existing data</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JSONUploader;