import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createEncoder, blockToBinary } from "luby-transform";
import { fromUint8Array } from "js-base64";

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

const FountainCodeGenerator = () => {
  const [packets, setPackets] = useState<FountainPacket[]>([]);
  const [currentPacketIndex, setCurrentPacketIndex] = useState(0);
  const [scoutingData, setScoutingData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [encoder, setEncoder] = useState<any>(null);
  const [cycleSpeed, setCycleSpeed] = useState(200); // 200ms default (5/sec)

  // Speed presets
  const speedPresets = [
    { label: "Ultra Fast (10/sec)", value: 100 },
    { label: "Fast (5/sec)", value: 200 },
    { label: "Medium (2/sec)", value: 500 },
    { label: "Slow (1/sec)", value: 1000 }
  ];

  useEffect(() => {
    // Load scouting data from localStorage
    const data = localStorage.getItem("scoutingData");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setScoutingData(parsedData);
      } catch (error) {
        toast.error("Error loading scouting data");
      }
    }
  }, []);

  const generateFountainPackets = () => {
    if (!scoutingData) {
      toast.error("No scouting data available");
      return;
    }

    const jsonString = JSON.stringify(scoutingData);
    const data = new TextEncoder().encode(jsonString);
    
    // Use smaller block size for QR code compatibility
    const blockSize = 800;
    
    // Create encoder using the correct API
    const ltEncoder = createEncoder(data, blockSize);
    setEncoder(ltEncoder);
    
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Generate fountain packets
    const generatedPackets: FountainPacket[] = [];
    let packetId = 0;
    
    // Generate a reasonable number of packets (with redundancy)
    const maxPackets = 50; // Limit to prevent infinite generation

    for (const block of ltEncoder.fountain()) {
      if (packetId >= maxPackets) break;
      
      try {
        // Convert block to binary then to base64 string
        const binary = blockToBinary(block);
        const base64Data = fromUint8Array(binary);
        
        const packet: FountainPacket = {
          type: 'fountain_packet',
          sessionId: newSessionId,
          packetId,
          k: block.k,
          bytes: block.bytes,
          checksum: block.checksum,
          indices: block.indices,
          data: base64Data
        };

        // Check if packet JSON is small enough for QR code
        const packetJson = JSON.stringify(packet);
        if (packetJson.length > 2500) { // QR code size limit
          console.warn(`Packet ${packetId} too large (${packetJson.length} chars), skipping`);
          packetId++;
          continue;
        }

        generatedPackets.push(packet);
        packetId++;
      } catch (error) {
        console.error(`Error generating packet ${packetId}:`, error);
        break;
      }
    }

    setPackets(generatedPackets);
    setCurrentPacketIndex(0);
    
    const selectedSpeed = speedPresets.find(s => s.value === cycleSpeed);
    const estimatedTime = Math.round((generatedPackets.length * cycleSpeed) / 1000);
    toast.success(`Generated ${generatedPackets.length} packets - cycling at ${selectedSpeed?.label}! (~${estimatedTime}s per cycle)`);
  };

  // Auto-cycle packets based on selected speed
  useEffect(() => {
    if (packets.length > 0) {
      const interval = setInterval(() => {
        setCurrentPacketIndex(prev => (prev + 1) % packets.length);
      }, cycleSpeed);

      return () => clearInterval(interval);
    }
  }, [packets.length, cycleSpeed]);

  const currentPacket = packets[currentPacketIndex];
  const currentSpeedLabel = speedPresets.find(s => s.value === cycleSpeed)?.label || "Custom";

  return (
    <div
      className="h-screen w-full flex flex-col items-center gap-6 px-4 pt-[var(--header-height)]">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">
          Fountain Code QR Transfer
        </h1>

        {!packets.length ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Generate Luby Transform fountain codes from your scouting data. QR codes will automatically cycle for easy scanning.
            </p>

            {/* Speed Selection */}
            <div className="w-full">
              <p className="text-sm font-medium mb-2 text-center">Cycle Speed:</p>
              <div className="grid grid-cols-2 gap-2">
                {speedPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={cycleSpeed === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCycleSpeed(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateFountainPackets}
              className="w-full h-12"
              disabled={!scoutingData}
            >
              Generate & Start Auto-Cycling
            </Button>
            {!scoutingData && (
              <p className="text-sm text-red-500">
                No scouting data found in storage
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* QR Code Display */}
            {currentPacket && (
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={JSON.stringify(currentPacket)}
                  size={300}
                  level="L"
                  includeMargin={false}
                />
              </div>
            )}

            {/* Packet Info */}
            <div className="text-center">
              <p className="font-semibold text-lg">
                Packet #{currentPacket.packetId + 1} of {packets.length}
              </p>
              <p className="text-sm text-muted-foreground">
                🔄 {currentSpeedLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Indices: [{currentPacket.indices.join(',')}]
              </p>
              <p className="text-xs text-muted-foreground">
                K: {currentPacket.k} | Bytes: {currentPacket.bytes}
              </p>
              <p className="text-xs text-muted-foreground">
                Checksum: {String(currentPacket.checksum).slice(0, 8)}...
              </p>
            </div>

            {/* Speed Control While Running */}
            <div className="w-full">
              <p className="text-sm font-medium mb-2 text-center">Adjust Speed:</p>
              <div className="grid grid-cols-2 gap-2">
                {speedPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={cycleSpeed === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCycleSpeed(preset.value)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📱 Point your scanner at the QR code
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Estimated time per cycle: {Math.round((packets.length * cycleSpeed) / 1000)}s
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span>Current cycle:</span>
                <span>{currentPacketIndex + 1}/{packets.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all ease-linear"
                  style={{ 
                    width: `${((currentPacketIndex + 1) / packets.length) * 100}%`,
                    transitionDuration: `${cycleSpeed}ms`
                  }}
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setPackets([]);
                setCurrentPacketIndex(0);
                setSessionId("");
                setEncoder(null);
              }}
              variant="secondary"
              className="w-full"
            >
              Stop & Generate New Packets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FountainCodeGenerator;