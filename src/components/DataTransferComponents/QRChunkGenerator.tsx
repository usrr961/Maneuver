import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QRChunk {
  id: string;
  part: number;
  total: number;
  data: string;
  checksum: string;
}

const QRChunkGenerator = () => {
  const [chunks, setChunks] = useState<QRChunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [scoutingData, setScoutingData] = useState<any>(null);

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

  const calculateChecksum = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  const generateChunks = () => {
    if (!scoutingData) {
      toast.error("No scouting data available");
      return;
    }

    const jsonString = JSON.stringify(scoutingData);
    const maxChunkSize = 2000; // Safe QR code size
    const totalChunks = Math.ceil(jsonString.length / maxChunkSize);
    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const generatedChunks: QRChunk[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * maxChunkSize;
      const end = Math.min(start + maxChunkSize, jsonString.length);
      const chunkData = jsonString.slice(start, end);
      
      generatedChunks.push({
        id: sessionId,
        part: i + 1,
        total: totalChunks,
        data: chunkData,
        checksum: calculateChecksum(chunkData)
      });
    }

    setChunks(generatedChunks);
    setCurrentChunkIndex(0);
    toast.success(`Generated ${totalChunks} QR code chunks`);
  };

  const nextChunk = () => {
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex(currentChunkIndex + 1);
    }
  };

  const previousChunk = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(currentChunkIndex - 1);
    }
  };

  const currentChunk = chunks[currentChunkIndex];

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center pt-16 gap-6 px-4">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">
          QR Code Data Transfer
        </h1>

        {!chunks.length ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Generate QR code chunks from your scouting data for easy transfer between devices.
            </p>
            <Button
              onClick={generateChunks}
              className="w-full h-12"
              disabled={!scoutingData}
            >
              Generate QR Chunks
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
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={JSON.stringify(currentChunk)}
                size={256}
                level="M"
              />
            </div>

            {/* Chunk Info */}
            <div className="text-center">
              <p className="font-semibold">
                Chunk {currentChunk.part} of {currentChunk.total}
              </p>
              <p className="text-sm text-muted-foreground">
                Session ID: {currentChunk.id.slice(-8)}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-2 w-full">
              <Button
                onClick={previousChunk}
                disabled={currentChunkIndex === 0}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={nextChunk}
                disabled={currentChunkIndex === chunks.length - 1}
                variant="outline"
                className="flex-1"
              >
                Next
              </Button>
            </div>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setChunks([]);
                setCurrentChunkIndex(0);
              }}
              variant="secondary"
              className="w-full"
            >
              Generate New Chunks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRChunkGenerator;