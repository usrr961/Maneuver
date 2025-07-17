import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import fieldImage from "@/assets/field.png";

interface Point {
  x: number;
  y: number;
}

interface FieldCanvasProps {
  stageId?: string;
}

const FieldCanvas = ({ stageId = "default" }: FieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw the field background
    const img = new Image();
    img.onload = () => {
      // Calculate container size
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate aspect ratio preserving dimensions
      const imgAspectRatio = img.width / img.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let canvasWidth, canvasHeight;

      if (imgAspectRatio > containerAspectRatio) {
        // Image is wider relative to container
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imgAspectRatio;
      } else {
        // Image is taller relative to container
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imgAspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Load saved drawing if exists
      const savedData = localStorage.getItem(`fieldStrategy_${stageId}`);
      if (savedData) {
        const savedImg = new Image();
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0, canvasWidth, canvasHeight);
        };
        savedImg.src = savedData;
      }
    };
    img.src = fieldImage;
  }, [stageId]);

  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getPointFromEvent(e);

    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!isErasing) {
      ctx.strokeStyle = brushColor;
    }

    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }

    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      // Auto-save when drawing stops
      saveCanvas(false);
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Reload the field background
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Clear saved data
      localStorage.removeItem(`fieldStrategy_${stageId}`);
    };
    img.src = fieldImage;
  };

  const saveCanvas = (showAlert = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    
    if (showAlert) {
      // Manual save - download file
      const link = document.createElement('a');
      link.download = `field-strategy-${stageId}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataURL;
      link.click();
    }

    // Auto-save to localStorage
    localStorage.setItem(`fieldStrategy_${stageId}`, dataURL);
  };

  const canvasStyle: React.CSSProperties = {
    userSelect: 'none',  // Prevent text selection
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
    // Remove touchAction: 'none' - we'll handle this conditionally
  };

  return (
    <div className="w-full h-full flex flex-col" data-stage={stageId}>
      {/* Drawing Controls - Allow normal scrolling */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2 pb-4 md:pb-0">
          <Button
            variant={!isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsErasing(false)}
          >
            Draw
          </Button>
          <Button
            variant={isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsErasing(true)}
          >
            Erase
          </Button>
          
          {/* Size selector */}
          <select 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={2}>Small</option>
            <option value={5}>Medium</option>
            <option value={10}>Large</option>
          </select>
          
          {/* Color selector */}
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={clearCanvas} variant="outline" size="sm">
            Clear
          </Button>
          <Button onClick={() => saveCanvas(true)} variant="outline" size="sm">
            Save {stageId}
          </Button>
        </div>
      </div>

      {/* Canvas Container - Only prevent touch when actively drawing */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center border rounded-lg overflow-hidden bg-green-50 dark:bg-green-950/20 min-h-0"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{
            ...canvasStyle,
            touchAction: isDrawing ? 'none' : 'auto' // Only prevent touch when drawing
          }}
          className="border border-gray-300 rounded-lg cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div>
  );
};

export default FieldCanvas;