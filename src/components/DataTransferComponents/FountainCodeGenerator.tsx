import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createEncoder, blockToBinary } from "luby-transform";
import { fromUint8Array } from "js-base64";
import { loadScoutingData, extractLegacyData } from "@/lib/scoutingDataUtils";

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

interface FountainCodeGeneratorProps {
  onBack: () => void;
  onSwitchToScanner: () => void;
}

const FountainCodeGenerator = ({ onBack, onSwitchToScanner }: FountainCodeGeneratorProps) => {
  const [packets, setPackets] = useState<FountainPacket[]>([]);
  const [currentPacketIndex, setCurrentPacketIndex] = useState(0);
  const [scoutingData, setScoutingData] = useState<{ data: unknown[][] } | null>(null);
  const [cycleSpeed, setCycleSpeed] = useState(200); // 200ms default (5/sec)

  // Speed presets
  const speedPresets = [
    { label: "Ultra Fast (10/sec)", value: 100 },
    { label: "Fast (5/sec)", value: 200 },
    { label: "Medium (2/sec)", value: 500 },
    { label: "Slow (1/sec)", value: 1000 }
  ];

  useEffect(() => {
    // Load scouting data using the new deduplication utilities
    try {
      const scoutingDataWithIds = loadScoutingData();
      
      if (scoutingDataWithIds.entries.length > 0) {
        // Convert to legacy format for fountain codes (scanner expects { data: [...] })
        const legacyDataArrays = extractLegacyData(scoutingDataWithIds.entries);
        const formattedData = { data: legacyDataArrays };
        setScoutingData(formattedData);
        
        console.log("Loaded scouting data for fountain codes:", {
          totalEntries: scoutingDataWithIds.entries.length,
          sampleEntry: legacyDataArrays[0]?.slice(0, 5), // Show first 5 fields
        });
      } else {
        setScoutingData(null);
        console.log("No scouting data found");
      }
    } catch (error) {
      console.error("Error loading scouting data:", error);
      toast.error("Error loading scouting data: " + (error instanceof Error ? error.message : String(error)));
      setScoutingData(null);
    }
  }, []);

  const generateFountainPackets = () => {
    if (!scoutingData) {
      toast.error("No scouting data available");
      return;
    }

    const jsonString = JSON.stringify(scoutingData);
    const data = new TextEncoder().encode(jsonString);
    
    console.log(`🔧 GENERATING FOUNTAIN CODES:`);
    console.log(`- Original data size: ${data.length} bytes`);
    console.log(`- Entries count: ${scoutingData.data?.length || 0}`);
    console.log(`- JSON preview: ${jsonString.substring(0, 100)}...`);
    
    // Use even smaller block size for testing
    const blockSize = 200; // Further reduced for testing
    
    const ltEncoder = createEncoder(data, blockSize);
    const newSessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const generatedPackets: FountainPacket[] = [];
    let packetId = 0;
    const maxPackets = 30; // Increased for better diversity
    const seenIndicesCombinations = new Set(); // Track unique index combinations

    console.log(`- Block size: ${blockSize}`);
    console.log(`- Session ID: ${newSessionId}`);

    for (const block of ltEncoder.fountain()) {
      if (packetId >= maxPackets) break;
      
      try {
        // Check for diversity in indices
        const indicesKey = block.indices.sort().join(',');
        if (seenIndicesCombinations.has(indicesKey)) {
          console.log(`Skipping duplicate indices combination: [${indicesKey}]`);
          continue; // Skip duplicate index combinations
        }
        seenIndicesCombinations.add(indicesKey);

        console.log(`📦 Generating packet ${packetId}:`);
        console.log(`- Block k: ${block.k}`);
        console.log(`- Block bytes: ${block.bytes}`);
        console.log(`- Block indices: [${block.indices.join(',')}]`);
        console.log(`- Block checksum: ${block.checksum}`);

        const binary = blockToBinary(block);
        const base64Data = fromUint8Array(binary);
        
        const packet: FountainPacket = {
          type: 'fountain_packet',
          sessionId: newSessionId,
          packetId,
          k: block.k,
          bytes: block.bytes,
          checksum: String(block.checksum),
          indices: block.indices,
          data: base64Data
        };

        const packetJson = JSON.stringify(packet);
        console.log(`- Packet JSON size: ${packetJson.length} chars`);
        
        if (packetJson.length > 1800) { // Further reduced
          console.warn(`Packet ${packetId} too large (${packetJson.length} chars), skipping`);
          continue; // Don't increment packetId for skipped packets
        }

        generatedPackets.push(packet);
        packetId++;
      } catch (error) {
        console.error(`Error generating packet ${packetId}:`, error);
        break;
      }
    }

    console.log(`✅ GENERATION COMPLETE:`);
    console.log(`- Generated ${generatedPackets.length} packets total`);
    console.log(`- K value: ${generatedPackets[0]?.k}`);
    console.log(`- Unique index combinations: ${seenIndicesCombinations.size}`);
    
    // Log all generated packet indices for debugging
    generatedPackets.forEach((packet, index) => {
      console.log(`Packet ${index}: indices [${packet.indices.join(',')}]`);
    });
    
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
          <Button 
            onClick={onSwitchToScanner} 
            variant="outline" 
            size="sm"
          >
            Switch to Scanner
          </Button>
        </div>

        {!packets.length ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Generate Fountain Codes</CardTitle>
              <CardDescription className="text-center">
                Generate Luby Transform fountain codes from your scouting data. QR codes will automatically cycle for easy scanning.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Alert variant="destructive">
                  <AlertDescription>
                    No scouting data found in storage
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* QR Code Display */}
            <Card className="w-full">
              <CardContent className="p-4 flex justify-center">
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
              </CardContent>
            </Card>

            {/* Packet Info */}
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Packet #{currentPacket.packetId + 1}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentSpeedLabel}
                  </Badge>
                </div>
                <CardDescription>
                  Broadcasting {packets.length} fountain packets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Indices:</span> [{currentPacket.indices.join(',')}]</p>
                  <p><span className="font-medium">K:</span> {currentPacket.k} | <span className="font-medium">Bytes:</span> {currentPacket.bytes}</p>
                  <p><span className="font-medium">Checksum:</span> {String(currentPacket.checksum).slice(0, 8)}...</p>
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
              </CardContent>
            </Card>

            {/* Speed Control */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-sm">Adjust Speed</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Instructions */}
            <Alert>
              <AlertTitle>📱 Scanning Instructions</AlertTitle>
              <AlertDescription>
                Point your scanner at the QR code. Estimated time per cycle: {Math.round((packets.length * cycleSpeed) / 1000)}s
              </AlertDescription>
            </Alert>

            {/* Reset Button - simplified */}
            <Button
              onClick={() => {
                setPackets([]);
                setCurrentPacketIndex(0);
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