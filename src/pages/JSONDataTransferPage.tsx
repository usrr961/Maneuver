import { useState } from "react";
import Button from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import JSONDownloader from "@/components/DataTransferComponents/JSONDownloader";
import JSONUploader from "@/components/DataTransferComponents/JSONUploader";

const JSONDataTransferPage = () => {
  const [mode, setMode] = useState<'select' | 'download' | 'upload'>('select');

  if (mode === 'download') {
    return (
      <JSONDownloader 
        onBack={() => setMode('select')} 
        onSwitchToUpload={() => setMode('upload')} 
      />
    );
  }

  if (mode === 'upload') {
    return (
      <JSONUploader 
        onBack={() => setMode('select')} 
        onSwitchToDownload={() => setMode('download')} 
      />
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full overflow-y-auto">
        <p className="text-center text-muted-foreground">
          Download your scouting data as JSON files or upload JSON files to overwrite your local data storage.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={() => setMode('download')}
            className="w-full h-16 text-xl"
          >
            Download JSON Data
          </Button>
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            onClick={() => setMode('upload')}
            variant="outline"
            className="w-full h-16 text-xl"
          >
            Upload JSON Data
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Download: Export your data for backup or transfer</p>
          <p>• Upload: Import data from other devices</p>
          <p>• Supports both scouting and match schedule data</p>
        </div>
      </div>
    </div>
  );
};

export default JSONDataTransferPage;