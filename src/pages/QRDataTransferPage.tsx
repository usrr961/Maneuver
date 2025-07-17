import { useState } from "react";
import Button from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FountainCodeGenerator from "@/components/DataTransferComponents/FountainCodeGenerator";
import FountainCodeScanner from "@/components/DataTransferComponents/FountainCodeScanner";

const QRDataTransferPage = () => {
  const [mode, setMode] = useState<'select' | 'generate' | 'scan'>('select');

  if (mode === 'generate') {
    return (
      <FountainCodeGenerator 
        onBack={() => setMode('select')} 
        onSwitchToScanner={() => setMode('scan')} 
      />
    );
  }

  if (mode === 'scan') {
    return (
      <FountainCodeScanner 
        onBack={() => setMode('select')} 
        onSwitchToGenerator={() => setMode('generate')} 
      />
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-[var(--header-height)] pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full overflow-y-auto">

        <p className="text-center text-muted-foreground">
          Transfer large scouting data files using fountain codes. Scan packets in any order until reconstruction is complete.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Button
            onClick={() => setMode('generate')}
            className="w-full h-16 text-xl"
          >
            Generate Fountain Codes
          </Button>
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
          
          <Button
            onClick={() => setMode('scan')}
            variant="outline"
            className="w-full h-16 text-xl"
          >
            Scan Fountain Codes
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Codes can be scanned in any order</p>
          <p>• No need to receive all codes</p>
          <p>• Automatic reconstruction when enough data is received</p>
        </div>
      </div>
    </div>
  );
};

export default QRDataTransferPage;