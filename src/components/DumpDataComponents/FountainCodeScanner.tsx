import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createDecoder, binaryToBlock } from "luby-transform";
import { toUint8Array } from "js-base64";

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

const FountainCodeScanner = () => {
  const [receivedPackets, setReceivedPackets] = useState<Map<number, FountainPacket>>(new Map());
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [reconstructedData, setReconstructedData] = useState<any>(null);
  const [progress, setProgress] = useState({ received: 0, needed: 0, percentage: 0 });
  const [decoder, setDecoder] = useState<any>(null);

  const handleQRScan = (result: any) => {
    try {
      const packet: FountainPacket = JSON.parse(result[0].rawValue);
      
      // Validate packet structure
      if (packet.type !== 'fountain_packet' || !packet.sessionId) {
        toast.error("Invalid fountain packet format");
        return;
      }

      // Check if this is a new session
      if (currentSession && currentSession !== packet.sessionId) {
        setCurrentSession(packet.sessionId);
        setReceivedPackets(new Map());
        setIsComplete(false);
        setDecoder(createDecoder());
      } else if (!currentSession) {
        setCurrentSession(packet.sessionId);
        setDecoder(createDecoder());
      }

      // Check for duplicate packets
      if (receivedPackets.has(packet.packetId)) {
        toast.info(`Packet #${packet.packetId + 1} already received`);
        return;
      }

      // Add packet to received list
      const newPackets = new Map(receivedPackets);
      newPackets.set(packet.packetId, packet);
      setReceivedPackets(newPackets);

      // Try to add packet to luby-transform decoder
      if (decoder) {
        try {
          // Convert base64 data back to binary then to block
          const binary = toUint8Array(packet.data);
          const block = binaryToBlock(binary);
          
          // Add block to decoder
          const isComplete = decoder.addBlock(block);
          
          if (isComplete) {
            // Successfully reconstructed!
            const decodedData = decoder.getDecoded();
            
            try {
              const jsonString = new TextDecoder().decode(decodedData);
              const parsedData = JSON.parse(jsonString);
              setReconstructedData(parsedData);
              setIsComplete(true);
              toast.success("Data successfully reconstructed using Luby Transform!");
              return;
            } catch (error) {
              toast.error("Error parsing reconstructed data");
            }
          }
        } catch (decodeError) {
          console.error("Error adding block to decoder:", decodeError);
          toast.error("Error processing packet");
          return;
        }
      }

      toast.success(`Received packet #${packet.packetId + 1}`);

      // Update progress - estimate based on typical fountain code requirements
      const estimatedNeeded = Math.ceil(packet.k * 1.1); // Usually need ~10% more than k
      const percentage = Math.min((newPackets.size / estimatedNeeded) * 100, 100);
      setProgress({
        received: newPackets.size,
        needed: estimatedNeeded,
        percentage
      });

    } catch (error) {
      toast.error("Invalid QR code format");
      console.error("QR scan error:", error);
    }
  };

  const saveData = () => {
    if (reconstructedData) {
      // Check if there's existing imported data to merge with
      const existingDataStr = localStorage.getItem("importedScoutingData");
      let mergedData = reconstructedData;
      
      if (existingDataStr) {
        try {
          const existingData = JSON.parse(existingDataStr);
          
          // Merge the datasets (assuming array of match data)
          if (Array.isArray(existingData) && Array.isArray(reconstructedData)) {
            mergedData = [...existingData, ...reconstructedData];
            toast.info(`Merged with existing data: ${existingData.length} + ${reconstructedData.length} = ${mergedData.length} entries`);
          } else if (typeof existingData === 'object' && typeof reconstructedData === 'object') {
            // If objects, merge properties
            mergedData = { ...existingData, ...reconstructedData };
            toast.info("Merged object data with existing data");
          }
        } catch (error) {
          toast.warning("Could not merge with existing data, saving as new");
        }
      }
      
      // Save merged data to localStorage
      localStorage.setItem("importedScoutingData", JSON.stringify(mergedData));
      
      // Also save to scoutingData for fountain code generation
      localStorage.setItem("scoutingData", JSON.stringify(mergedData));
      
      // Create downloadable file
      const dataStr = JSON.stringify(mergedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `aggregated-scouting-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Aggregated data saved and available for fountain code generation!");
    }
  };

  const reset = () => {
    setReceivedPackets(new Map());
    setCurrentSession(null);
    setIsComplete(false);
    setReconstructedData(null);
    setProgress({ received: 0, needed: 0, percentage: 0 });
    setDecoder(null);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center gap-6 px-4 pt-[var(--header-height)]">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">
          Scan Luby Transform Packets
        </h1>

        {!isComplete ? (
          <>
            {/* Scanner */}
            <div className="w-full max-w-sm h-64 overflow-hidden rounded-lg">
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
                onError={() => toast.error("Scanner error")}
              />
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Scan Luby Transform packets in any order. The decoder will automatically reconstruct when enough packets are received.
            </p>

            {/* Progress Display */}
            {currentSession && progress.needed > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress:</span>
                  <span>{progress.received}/{progress.needed} packets</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {progress.percentage.toFixed(1)}% complete
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Session: {currentSession.slice(-8)}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-2">
                ✅ Data successfully reconstructed!
              </p>
              <p className="text-sm text-muted-foreground">
                Received {receivedPackets.size} packets and decoded using the luby-transform package.
              </p>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button onClick={saveData} className="flex-1">
                Save Data
              </Button>
              <Button onClick={reset} variant="outline" className="flex-1">
                Scan New
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