import { Button } from "@/components/ui/button";
import { EyeOff, Maximize2 } from "lucide-react";

interface DrawingControlsProps {
  isErasing: boolean;
  brushSize: number;
  brushColor: string;
  currentStageId: string;
  isMobile: boolean;
  isFullscreen: boolean;
  onToggleErasing: (erasing: boolean) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushColorChange: (color: string) => void;
  onClearCanvas: () => void;
  onSaveCanvas: () => void;
  onToggleFullscreen: () => void;
  onToggleHideControls: () => void;
}

export const DrawingControls = ({
  isErasing,
  brushSize,
  brushColor,
  currentStageId,
  isMobile,
  isFullscreen,
  onToggleErasing,
  onBrushSizeChange,
  onBrushColorChange,
  onClearCanvas,
  onSaveCanvas,
  onToggleFullscreen,
  onToggleHideControls
}: DrawingControlsProps) => {
  if (isFullscreen) {
    // Fullscreen drawing controls
    return (
      <div className="flex-shrink-0 p-2 md:p-4 border-b bg-background">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <Button
            variant={!isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleErasing(false)}
          >
            Draw
          </Button>
          <Button
            variant={isErasing ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleErasing(true)}
          >
            Erase
          </Button>
          
          {/* Size selector */}
          <select 
            value={brushSize} 
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value={2}>Small</option>
            <option value={5}>Medium</option>
            <option value={10}>Large</option>
            <option value={20}>X-Large</option>
          </select>
          
          {/* Color selector */}
          <input
            type="color"
            value={brushColor}
            onChange={(e) => onBrushColorChange(e.target.value)}
            className="w-8 h-8 border rounded cursor-pointer"
          />
          
          <Button onClick={onClearCanvas} variant="outline" size="sm">
            Clear
          </Button>
          <Button onClick={onSaveCanvas} variant="outline" size="sm">
            Save
          </Button>
          
          {/* Hide Controls Button - Only on mobile screens */}
          {isMobile && (
            <Button
              onClick={onToggleHideControls}
              variant="outline"
              size="sm"
              title="Hide controls for more drawing space"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Normal drawing controls
  return (
    <div className="flex justify-between items-center mb-4 flex-shrink-0 flex-wrap gap-2">
      <div className="flex items-center gap-2 pb-2 md:pb-0">
        <Button
          variant={!isErasing ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleErasing(false)}
        >
          Draw
        </Button>
        <Button
          variant={isErasing ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleErasing(true)}
        >
          Erase
        </Button>
        
        {/* Size selector */}
        <select 
          value={brushSize} 
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value={2}>Small</option>
          <option value={5}>Medium</option>
          <option value={10}>Large</option>
          <option value={20}>X-Large</option>
        </select>
        
        {/* Color selector */}
        <input
          type="color"
          value={brushColor}
          onChange={(e) => onBrushColorChange(e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onClearCanvas} variant="outline" size="sm">
          Clear
        </Button>
        <Button onClick={onSaveCanvas} variant="outline" size="sm">
          Save {currentStageId}
        </Button>
        <Button onClick={onToggleFullscreen} variant="outline" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
