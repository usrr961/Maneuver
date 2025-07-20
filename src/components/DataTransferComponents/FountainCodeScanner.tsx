/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createDecoder, binaryToBlock } from "luby-transform";
import { toUint8Array } from "js-base64";
import { 
  loadScoutingData, 
  saveScoutingData, 
  mergeScoutingData, 
  addIdsToScoutingData,
  extractLegacyData,
  getDataSummary
} from "@/lib/scoutingDataUtils";

interface FountainPacket {
  type: 'fountain_packet';
  sessionId: string;
  packetId: number;
  k: number;
  bytes: number;
  checksum: string;
  indices: number[];
  data: string; // Base64 encoded binary data
}

interface FountainCodeScannerProps {
  onBack: () => void;
  onSwitchToGenerator: () => void;
}

const FountainCodeScanner = ({ onBack, onSwitchToGenerator }: FountainCodeScannerProps) => {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  interface ScoutingData {
    data: any[];
  }
  
  const [reconstructedData, setReconstructedData] = useState<ScoutingData | null>(null);
  const [progress, setProgress] = useState({ received: 0, needed: 0, percentage: 0 });
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [completedPacketCount, setCompletedPacketCount] = useState(0);
  
  // Use refs for immediate access without React state delays
  const decoderRef = useRef<any>(null);
  const packetsRef = useRef<Map<number, FountainPacket>>(new Map());
  const sessionRef = useRef<string | null>(null);

  // Helper function to add debug messages
  const addDebugMsg = (message: string) => {
    setDebugLog(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Remove the problematic useEffect and replace with console.log
  useEffect(() => {
    if (isComplete) {
      console.log("📺 Success screen should show, isComplete:", isComplete);
      console.log("reconstructedData:", reconstructedData);
      console.log("completedPacketCount:", completedPacketCount);
    }
  }, [isComplete, reconstructedData, completedPacketCount]);

  const handleQRScan = (result: { rawValue: any; }[]) => {
    try {
      const packet: FountainPacket = JSON.parse(result[0].rawValue);
      addDebugMsg(`🎯 Scanned packet ${packet.packetId} with indices [${packet.indices.join(',')}]`);
      addDebugMsg(`🆔 Session: ${packet.sessionId.slice(-8)}`);
      addDebugMsg(`📋 Current session: ${packet.sessionId ? packet.sessionId.slice(-8) : 'none'}`);
      
      if (packet.type !== 'fountain_packet') {
        addDebugMsg("❌ Invalid QR code format");
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

      // Add packet to received set
      packetsRef.current.set(packet.packetId, packet);

      addDebugMsg(`📦 Packet ${packet.packetId}: indices [${packet.indices.join(',')}]`);
      addDebugMsg(`📊 Total packets after adding: ${packetsRef.current.size}/${packet.k}`);
      
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
          const isOkay = decoderRef.current.addBlock(block);
          addDebugMsg(`📊 Decoder result: ${isOkay ? 'COMPLETE!' : 'Need more'}`);
          
          if (isOkay) {
            addDebugMsg("🎉 DECODING COMPLETE!");
            const decodedData = decoderRef.current.getDecoded();
            const jsonString = new TextDecoder().decode(decodedData);
            const parsedData = JSON.parse(jsonString);
            setReconstructedData(parsedData);
            setCompletedPacketCount(packetsRef.current.size);
            setIsComplete(true);
            toast.success("Data successfully reconstructed!");
            return;
          }
        } catch (error) {
          addDebugMsg(`🚨 Block error: ${error instanceof Error ? error.message : String(error)}`);
          toast.error("Failed to process packet");
          return;
        }
      } else {
        addDebugMsg("⚠️ No decoder available - this shouldn't happen!");
      }

      // Update progress
      const newProgress = {
        received: packetsRef.current.size,
        needed: packet.k,
        percentage: Math.min((packetsRef.current.size / packet.k) * 100, 100)
      };
      setProgress(newProgress);

      toast.success(`Received packet ${packet.packetId + 1} (${packetsRef.current.size}/${packet.k})`);

    } catch (error) {
      addDebugMsg(`🚨 QR error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Error processing QR code");
    }
  };

  const saveData = () => {
    if (reconstructedData) {
      console.log("Saving reconstructed data:", reconstructedData);
      
      // Load existing data using new utility
      const existingScoutingData = loadScoutingData();
      
      // Convert new data to ID structure
      let newDataArrays: unknown[][] = [];
      if (reconstructedData.data && Array.isArray(reconstructedData.data)) {
        newDataArrays = reconstructedData.data;
      }
      const newDataWithIds = addIdsToScoutingData(newDataArrays);
      
      // Merge with smart deduplication
      const mergeResult = mergeScoutingData(
        existingScoutingData.entries,
        newDataWithIds,
        'smart-merge'
      );
      
      // Prepare data for download (use legacy format for compatibility)
      const legacyFormatData = { data: extractLegacyData(mergeResult.merged) };
      
      // Save to localStorage
      saveScoutingData({ entries: mergeResult.merged });
      console.log("Data saved to localStorage");
      
      // Show merge info
      const { stats } = mergeResult;
      if (stats.duplicates > 0) {
        toast.info(`Merged: ${stats.new} new + ${stats.existing} existing (${stats.duplicates} duplicates skipped)`);
      }
      
      // Download file
      const dataStr = JSON.stringify(legacyFormatData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `fountain-reconstructed-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("File download initiated");
      toast.success("Data saved successfully!");
    } else {
      console.error("No reconstructed data to save");
    }
  };

  const saveToApp = (mode: 'append' | 'overwrite' | 'smart-merge') => {
    if (reconstructedData) {
      console.log(`Saving to app localStorage (${mode}):`, reconstructedData);
      
      // Load existing data using new utility
      const existingScoutingData = loadScoutingData();
      
      // Convert new data to ID structure
      let newDataArrays: unknown[][] = [];
      if (reconstructedData.data && Array.isArray(reconstructedData.data)) {
        newDataArrays = reconstructedData.data;
      }
      const newDataWithIds = addIdsToScoutingData(newDataArrays);
      
      // Merge data with deduplication
      const mergeResult = mergeScoutingData(
        existingScoutingData.entries,
        newDataWithIds,
        mode
      );
      
      // Save merged data
      saveScoutingData({ entries: mergeResult.merged });
      
      // Create summary message
      const { stats } = mergeResult;
      let message = '';
      
      if (mode === 'overwrite') {
        message = `Data replaced: ${stats.final} entries`;
        toast.success(message);
      } else if (mode === 'append') {
        message = `Data appended: ${stats.existing} + ${stats.new} = ${stats.final} entries`;
        toast.success(message);
      } else if (mode === 'smart-merge') {
        if (stats.duplicates > 0) {
          message = `Smart merge: ${stats.new} new entries added, ${stats.duplicates} duplicates skipped (Total: ${stats.final})`;
          toast.success(message);
        } else {
          message = `Smart merge: ${stats.new} new entries added (Total: ${stats.final})`;
          toast.success(message);
        }
      }
      
      console.log("Merge stats:", stats);
      console.log("Final message:", message);
      
      toast.success("Data saved to app! Returning to main view...");
      
      // Navigate back to main app after a brief delay
      setTimeout(() => {
        onBack();
      }, 1500);
    } else {
      console.error("No reconstructed data to save");
      toast.error("No data to save");
    }
  };

  const reset = () => {
    packetsRef.current = new Map();
    sessionRef.current = null;
    decoderRef.current = null;
    setCurrentSession(null);
    setIsComplete(false);
    setReconstructedData(null);
    setProgress({ received: 0, needed: 0, percentage: 0 });
    setDebugLog([]);
    addDebugMsg("🔄 Scanner reset");
  };

  // Convert ref to state for display purposes
  const receivedPackets = packetsRef.current;

  console.log("Rendering FountainCodeScanner, isComplete:", isComplete);

  return (
    <div className="h-screen w-full flex flex-col items-center px-4 pt-[var(--header-height)] pb-6">
      <div className="flex flex-col items-center gap-4 max-w-md w-full overflow-y-auto">
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
            onClick={onSwitchToGenerator} 
            variant="outline" 
            size="sm"
          >
            Switch to Generator
          </Button>
        </div>
        {!isComplete ? (
          <>
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center">Scan Fountain Packets</CardTitle>
                <CardDescription className="text-center">
                  Scan Luby Transform packets in any order. The decoder will automatically reconstruct when enough packets are received.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Scanner */}
                <div className="w-full h-64 overflow-hidden rounded-lg">
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
                    onError={() => {
                      addDebugMsg("🚨 Camera error");
                      toast.error("Scanner error");
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Debug Log Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-sm">Debug Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1 font-mono bg-muted p-2 rounded max-h-20 overflow-y-auto">
                  {debugLog.length === 0 ? (
                    <p className="text-muted-foreground">Waiting for QR codes...</p>
                  ) : (
                    debugLog.map((msg, i) => (
                      <p key={i}>{msg}</p>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Display */}
            {currentSession && progress.needed > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Progress</CardTitle>
                    <Badge variant="outline">
                      {progress.received}/{progress.needed}+ needed
                    </Badge>
                  </div>
                  <CardDescription>
                    Session: {currentSession.slice(-8)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {progress.percentage.toFixed(1)}% of minimum required (may need more for diversity)
                  </p>

                  {/* Show received packet details */}
                  {receivedPackets.size > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Received packets:</p>
                      {Array.from(receivedPackets.values()).map(p => (
                        <p key={p.packetId} className="text-muted-foreground">
                          #{p.packetId}: [{p.indices.join(',')}]
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Add button to allow/block duplicates */}
                  <div className="mt-2">
                    <Button 
                      onClick={() => setAllowDuplicates(!allowDuplicates)}
                      variant="outline" 
                      size="sm"
                      className="w-full text-xs"
                    >
                      {allowDuplicates ? "Block Duplicates" : "Allow Duplicates (Test)"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="w-full p-8 bg-green-100 dark:bg-green-900 rounded-lg text-center">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              SUCCESS!
            </h1>
            <p className="mt-2 text-green-700 dark:text-green-300">
              Data reconstructed with {completedPacketCount} packets
            </p>
            
            {/* Show what will be saved */}
            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
              <p>Ready to save {reconstructedData?.data?.length || 0} scouting entries</p>
              {(() => {
                try {
                  const existingScoutingData = loadScoutingData();
                  const summary = getDataSummary(existingScoutingData);
                  return (
                    <div className="space-y-1">
                      <p>Existing data: {summary.totalEntries} entries</p>
                      {summary.totalEntries > 0 && (
                        <p className="text-xs opacity-75">
                          {summary.teams.length} teams • {summary.matches.length} matches • {summary.scouters.length} scouters
                        </p>
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error("Error loading existing data summary:", error);
                  return <p>No existing data found</p>;
                }
              })()}
            </div>

            <div className="mt-4 space-y-2">
              {/* Smart Merge Mode - recommended for most cases */}
              <Button 
                onClick={() => saveToApp('smart-merge')} 
                className="w-full bg-green-600 hover:bg-green-700 min-h-[4rem] py-3 px-4"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium">🧠 Smart Merge (Recommended)</span>
                  <span className="text-xs opacity-90 whitespace-normal">Skip duplicates, add only new entries</span>
                </div>
              </Button>
              
              {/* Append Mode - for manual control */}
              <Button 
                onClick={() => saveToApp('append')} 
                className="w-full bg-blue-600 hover:bg-blue-700 min-h-[4rem] py-3 px-4"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium">📤 Force Append</span>
                  <span className="text-xs opacity-90 whitespace-normal">Add all entries (may create duplicates)</span>
                </div>
              </Button>
              
              {/* Overwrite Mode - for lead receiving from another lead */}
              <Button 
                onClick={() => saveToApp('overwrite')} 
                className="w-full bg-orange-600 hover:bg-orange-700 min-h-[4rem] py-3 px-4"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium">🔄 Replace All Data</span>
                  <span className="text-xs opacity-90 whitespace-normal">Replace existing with this data</span>
                </div>
              </Button>
              
              <Button 
                onClick={() => saveData()} 
                variant="outline" 
                className="w-full min-h-[3rem] py-3 px-4"
              >
                <span className="text-sm font-medium">📁 Download JSON Only</span>
              </Button>
              
              <Button 
                onClick={reset} 
                variant="secondary" 
                className="w-full min-h-[3rem] py-3 px-4"
              >
                <span className="text-sm font-medium">🔄 Scan New</span>
              </Button>
            </div>
          </div>
        )}

        {receivedPackets.size > 0 && !isComplete && (
          <Button onClick={reset} variant="secondary" className="w-full">
            Reset Session
          </Button>
        )}
      </div>
    </div>
  );
};

export default FountainCodeScanner;