/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Button from "@/components/ui/button";
import { toast } from "sonner";

interface QRChunk {
  id: string;
  part: number;
  total: number;
  data: string;
  checksum: string;
}

const QRChunkScanner = () => {
  const [receivedChunks, setReceivedChunks] = useState<Map<number, QRChunk>>(new Map());
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [reconstructedData, setReconstructedData] = useState<any>(null);

  const validateChecksum = (data: string, expectedChecksum: string): boolean => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const calculatedChecksum = Math.abs(hash).toString(36);
    return calculatedChecksum === expectedChecksum;
  };

  const reconstructData = (chunks: Map<number, QRChunk>): string => {
    const sortedChunks = Array.from(chunks.values()).sort((a, b) => a.part - b.part);
    return sortedChunks.map(chunk => chunk.data).join('');
  };

  const handleQRScan = (result: any) => {
    try {
      const chunk: QRChunk = JSON.parse(result[0].rawValue);
      
      // Validate chunk structure
      if (!chunk.id || !chunk.part || !chunk.total || !chunk.data || !chunk.checksum) {
        toast.error("Invalid QR chunk format");
        return;
      }

      // Validate checksum
      if (!validateChecksum(chunk.data, chunk.checksum)) {
        toast.error("Chunk data corrupted - checksum mismatch");
        return;
      }

      // Check if this is a new session
      if (currentSession && currentSession !== chunk.id) {
        setCurrentSession(chunk.id);
        setReceivedChunks(new Map());
        setIsComplete(false);
      } else if (!currentSession) {
        setCurrentSession(chunk.id);
      }

      // Add chunk to received chunks
      const newChunks = new Map(receivedChunks);
      newChunks.set(chunk.part, chunk);
      setReceivedChunks(newChunks);

      toast.success(`Received chunk ${chunk.part}/${chunk.total}`);

      // Check if we have all chunks
      if (newChunks.size === chunk.total) {
        const completeData = reconstructData(newChunks);
        try {
          const parsedData = JSON.parse(completeData);
          setReconstructedData(parsedData);
          setIsComplete(true);
          toast.success("All chunks received! Data reconstructed successfully.");
        } catch (error) {
          toast.error("Error reconstructing data: " + (error instanceof Error ? error.message : String(error)));
        }
      }

    } catch (error) {
      toast.error("Invalid QR code format: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const saveData = () => {
    if (reconstructedData) {
      // Save to localStorage
      localStorage.setItem("importedScoutingData", JSON.stringify(reconstructedData));
      
      // Create downloadable file
      const dataStr = JSON.stringify(reconstructedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `imported-scouting-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data saved and downloaded!");
    }
  };

  const reset = () => {
    setReceivedChunks(new Map());
    setCurrentSession(null);
    setIsComplete(false);
    setReconstructedData(null);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center pt-16 gap-6 px-4">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center">
          Scan QR Code Chunks
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

            {/* Progress Display */}
            {currentSession && (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress:</span>
                  <span>{receivedChunks.size} chunks received</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(receivedChunks.size / (Array.from(receivedChunks.values())[0]?.total || 1)) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Session: {currentSession.slice(-8)}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-2">
                ✅ All chunks received successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Data has been reconstructed and is ready to save.
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

        {receivedChunks.size > 0 && !isComplete && (
          <Button onClick={reset} variant="secondary" className="w-full">
            Reset Session
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRChunkScanner;