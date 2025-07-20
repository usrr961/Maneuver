import { useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { createDecoder, binaryToBlock } from "luby-transform";
import { toUint8Array } from "js-base64";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FountainPacket {
  type: string;
  sessionId: string;
  packetId: number;
  k: number;
  bytes: number;
  checksum: string;
  indices: number[];
  data: string; // Base64 encoded binary data
}

interface UniversalFountainScannerProps {
  onBack: () => void;
  onSwitchToGenerator?: () => void;
  dataType: 'scouting' | 'match';
  expectedPacketType: string;
  saveData: (data: unknown) => void;
  validateData: (data: unknown) => boolean;
  getDataSummary: (data: unknown) => string;
  title: string;
  description: string;
  completionMessage: string;
}

const UniversalFountainScanner = ({ 
  onBack, 
  onSwitchToGenerator,
  dataType,
  expectedPacketType,
  saveData,
  validateData,
  getDataSummary,
  title,
  description,
  completionMessage
}: UniversalFountainScannerProps) => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [reconstructedData, setReconstructedData] = useState<unknown>(null);
  const [progress, setProgress] = useState({ received: 0, needed: 0, percentage: 0 });
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  
  // Use refs for immediate access without React state delays
  const decoderRef = useRef<unknown>(null);
  const packetsRef = useRef<Map<number, FountainPacket>>(new Map());
  const sessionRef = useRef<string | null>(null);

  // Helper function to add debug messages
  const addDebugMsg = (message: string) => {
    setDebugLog(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleQRScan = (result: { rawValue: string; }[]) => {
    try {
      const packet: FountainPacket = JSON.parse(result[0].rawValue);
      addDebugMsg(`🎯 Scanned packet ${packet.packetId} with indices [${packet.indices.join(',')}]`);
      addDebugMsg(`🆔 Session: ${packet.sessionId.slice(-8)}`);
      
      if (packet.type !== expectedPacketType) {
        addDebugMsg(`❌ Invalid QR code format - expected ${expectedPacketType}, got ${packet.type}`);
        toast.error("Invalid QR code format");
        return;
      }

      addDebugMsg(`📊 Packets before processing: ${packetsRef.current.size}`);

      // SIMPLIFIED SESSION HANDLING - Don't reset on session changes
      if (!sessionRef.current) {
        addDebugMsg(`🆕 First session: k=${packet.k}, bytes=${packet.bytes}`);
        sessionRef.current = packet.sessionId;
        setCurrentSession(packet.sessionId);
        decoderRef.current = createDecoder();
        toast.info(`Started session: ${packet.sessionId.slice(-8)}`);
      } else if (sessionRef.current !== packet.sessionId) {
        // Just log the session change but DON'T reset anything
        addDebugMsg(`🔄 Session change noted: ${sessionRef.current.slice(-4)} → ${packet.sessionId.slice(-4)}`);
        addDebugMsg(`📌 Continuing with same decoder (ignoring session change)`);
      }

      addDebugMsg(`📊 Packets after session check: ${packetsRef.current.size}`);

      // Check if we already have this packet
      if (packetsRef.current.has(packet.packetId) && !allowDuplicates) {
        addDebugMsg(`🔁 Duplicate packet ${packet.packetId} ignored`);
        addDebugMsg(`🔍 Current: indices [${packet.indices.join(',')}]`);
        return;
      }

      // Store the packet
      packetsRef.current.set(packet.packetId, packet);
      addDebugMsg(`📦 Added packet ${packet.packetId}, total: ${packetsRef.current.size}`);

      // Debug: Show all packet IDs we have
      const allPacketIds = Array.from(packetsRef.current.keys()).sort();
      addDebugMsg(`🔢 All packet IDs: [${allPacketIds.join(',')}]`);

      // Use decoder
      if (decoderRef.current) {
        try {
          // Convert base64 back to binary and create block
          const binaryData = toUint8Array(packet.data);
          const block = binaryToBlock(binaryData);

          // Add block to decoder
          addDebugMsg(`🔧 Adding block to decoder...`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isOkay = (decoderRef.current as any).addBlock(block);
          addDebugMsg(`📊 Decoder result: ${isOkay ? 'COMPLETE!' : 'Need more'}`);
          
          if (isOkay) {
            addDebugMsg("🎉 DECODING COMPLETE!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decodedData = (decoderRef.current as any).getDecoded();
            const jsonString = new TextDecoder().decode(decodedData);
            const parsedData = JSON.parse(jsonString);
            
            if (validateData(parsedData)) {
              setReconstructedData(parsedData);
              setIsComplete(true);
              setProgress({ received: packetsRef.current.size, needed: packetsRef.current.size, percentage: 100 });
              
              saveData(parsedData);
              toast.success(completionMessage);
            } else {
              addDebugMsg("❌ Reconstructed data failed validation");
              toast.error("Reconstructed data is invalid");
            }
            return;
          }
        } catch (error) {
          addDebugMsg(`🚨 Block error: ${error instanceof Error ? error.message : String(error)}`);
          toast.error("Failed to process packet");
          return;
        }
      }

      // Update progress estimate
      const received = packetsRef.current.size;
      const estimatedNeeded = Math.max(packet.k + 3, 10);
      const progressPercentage = Math.min((received / estimatedNeeded) * 100, 95);
      
      setProgress({ 
        received, 
        needed: estimatedNeeded, 
        percentage: progressPercentage 
      });
      
      addDebugMsg(`📈 Progress: ${received}/${estimatedNeeded} (${progressPercentage.toFixed(1)}%)`);

    } catch (error) {
      addDebugMsg(`❌ QR scan error: ${error instanceof Error ? error.message : String(error)}`);
      console.error("QR scan error:", error);
      toast.error("Error processing QR code");
    }
  };

  const resetScanner = () => {
    sessionRef.current = null;
    setCurrentSession(null);
    setIsComplete(false);
    setReconstructedData(null);
    setProgress({ received: 0, needed: 0, percentage: 0 });
    setDebugLog([]);
    setAllowDuplicates(false);
    decoderRef.current = null;
    packetsRef.current.clear();
    addDebugMsg("🔄 Scanner reset");
    toast.info("Scanner reset");
  };

  const handleComplete = () => {
    toast.success(`${dataType} data loaded successfully!`);
    navigate("/");
  };

  if (isComplete && reconstructedData) {
    return (
      <div className="h-screen w-full flex flex-col items-center px-4 pt-6 pb-6">
        <div className="flex flex-col items-center gap-4 max-w-md w-full">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-green-600">Reconstruction Complete!</CardTitle>
              <CardDescription>
                {completionMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {getDataSummary(reconstructedData)}
                </Badge>
                <Badge variant="outline">
                  {progress.received} packets received
                </Badge>
              </div>

              <div className="w-full space-y-2">
                <Button
                  onClick={handleComplete}
                  className="w-full"
                >
                  Continue to App
                </Button>
                
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  className="w-full"
                >
                  Scan More Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Data saved to local storage</p>
            <p>• Ready to use throughout the app</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center gap-6 px-4 pt-[var(--header-height)]">
      <div className="flex flex-col items-center gap-4 max-w-md w-full max-h-full overflow-y-auto">
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
          {onSwitchToGenerator && (
            <Button 
              onClick={onSwitchToGenerator} 
              variant="outline" 
              size="sm"
            >
              Switch to Generator
            </Button>
          )}
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {currentSession && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge variant="secondary">
                  Session: ...{currentSession.slice(-8)}
                </Badge>
                <Badge variant="outline">
                  {progress.received} packets
                </Badge>
                <Badge variant="outline">
                  {progress.percentage.toFixed(1)}%
                </Badge>
              </div>
            )}

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
                onScan={handleQRScan}
                onError={() =>
                  toast.error("QR Scanner Error")
                }
              />
            </div>

            {progress.received > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{progress.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-2 w-full">
              {currentSession && (
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  className="flex-1"
                >
                  Reset Scanner
                </Button>
              )}
              
              <Button
                onClick={() => setAllowDuplicates(!allowDuplicates)}
                variant={allowDuplicates ? "default" : "outline"}
                className="flex-1"
                size="sm"
              >
                {allowDuplicates ? "Allow Dupes ✓" : "Skip Dupes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {debugLog.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-sm">Debug Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {debugLog.map((log, index) => (
                  <div key={index} className="font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertTitle>📱 Scanning Instructions</AlertTitle>
          <AlertDescription>
            Scan fountain code packets in any order. No need to scan all packets - reconstruction will complete automatically when enough data is received.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default UniversalFountainScanner;
