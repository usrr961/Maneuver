import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, EyeOff, Eye } from "lucide-react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useIsMobile } from "@/hooks/use-mobile";
import fieldImage from "@/assets/field.png";

interface Point {
  x: number;
  y: number;
}

interface FieldCanvasProps {
  stageId?: string;
  onStageChange?: (newStageId: string) => void;
}

const FieldCanvas = ({ stageId = "default", onStageChange }: FieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const { isFullscreen, setIsFullscreen } = useFullscreen();
  const [currentStageId, setCurrentStageId] = useState(stageId); // Internal stage tracking
  const [hideControls, setHideControls] = useState(false); // State to hide controls on smaller screens
  const isMobile = useIsMobile();
  const backgroundImageRef = useRef<HTMLImageElement | null>(null); // Store background image reference

  // Available stages for switching - memoized to prevent recreating on every render
  const stages = useMemo(() => [
    { id: 'autonomous', label: 'Autonomous' },
    { id: 'teleop', label: 'Teleop' },
    { id: 'endgame', label: 'Endgame' }
  ], []);

  const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
  const currentStage = stages[currentStageIndex];

  // Update internal stage when prop changes (but only if not in fullscreen)
  useEffect(() => {
    if (!isFullscreen) {
      setCurrentStageId(stageId);
    }
  }, [stageId, isFullscreen]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = isFullscreen ? fullscreenRef.current : containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load and draw the field background
    const img = new Image();
    img.onload = () => {
      let containerWidth, containerHeight;
      
      if (isFullscreen) {
        // For fullscreen, calculate available space more carefully
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Account for header (estimate 120px) + footer (estimate 60px) + padding
        let reservedHeight = 180; // Base: header + footer + padding
        
        // Add space for stage switcher and controls if they're visible
        if (!hideControls || !isMobile) {
          reservedHeight += 100; // Stage switcher (~50px) + drawing controls (~50px)
        }
        
        const reservedWidth = 32; // 16px padding on each side
        
        containerWidth = viewportWidth - reservedWidth;
        containerHeight = viewportHeight - reservedHeight;
      } else {
        // Normal mode - use container dimensions
        const containerRect = container.getBoundingClientRect();
        const padding = 32;
        containerWidth = containerRect.width - padding;
        containerHeight = containerRect.height - padding;
      }

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

      // Set canvas dimensions
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Set canvas display size to match calculated dimensions
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Store background image reference for erasing
      backgroundImageRef.current = img;

      // Load saved drawing if exists - use currentStageId instead of stageId
      const savedData = localStorage.getItem(`fieldStrategy_${currentStageId}`);
      if (savedData) {
        const savedImg = new Image();
        savedImg.onload = () => {
          ctx.drawImage(savedImg, 0, 0, canvasWidth, canvasHeight);
        };
        savedImg.src = savedData;
      }
    };
    img.src = fieldImage;
  }, [currentStageId, isFullscreen, hideControls, isMobile]);

  useEffect(() => {
    setupCanvas();

    // Resize handler
    const handleResize = () => {
      if (isFullscreen) {
        setupCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStageId, isFullscreen, hideControls, setupCanvas]); // Add hideControls to dependencies

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsFullscreen(false);
      document.body.style.overflow = 'auto';
      // When exiting fullscreen, sync with parent component
      if (onStageChange && currentStageId !== stageId) {
        onStageChange(currentStageId);
      }
    }
  }, [isFullscreen, setIsFullscreen, onStageChange, currentStageId, stageId]);

  // Save canvas function - defined here so switchStage can use it
  const saveCanvas = useCallback((showAlert = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    
    if (showAlert) {
      // Manual save - download file
      const link = document.createElement('a');
      link.download = `field-strategy-${currentStageId}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataURL;
      link.click();
    }

    // Auto-save to localStorage - use currentStageId
    localStorage.setItem(`fieldStrategy_${currentStageId}`, dataURL);
  }, [currentStageId]);

  // Handle stage switching in fullscreen
  const switchStage = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : stages.length - 1;
    } else {
      newIndex = currentIndex < stages.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newStageId = stages[newIndex].id;
    
    // Save current canvas before switching
    saveCanvas(false);
    
    // Update internal stage ID (don't call onStageChange yet)
    setCurrentStageId(newStageId);
    
    // If not in fullscreen, also update parent
    if (!isFullscreen && onStageChange) {
      onStageChange(newStageId);
    }
  }, [currentStageId, isFullscreen, onStageChange, stages, saveCanvas]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      if (e.key === 'Escape') {
        toggleFullscreen();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        switchStage('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        switchStage('next');
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, currentStageId, switchStage, toggleFullscreen]);

  const getPointFromEvent = (e: React.MouseEvent | React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Capture the pointer to prevent other elements from receiving pointer events
    if ('setPointerCapture' in e.currentTarget && e.currentTarget instanceof HTMLElement) {
      try {
        e.currentTarget.setPointerCapture((e as React.PointerEvent).pointerId);
      } catch {
        // Ignore errors if pointer capture fails
      }
    }
    
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPoint = getPointFromEvent(e);

    if (isErasing) {
      // For erasing, we'll use destination-out to remove content
      // but then immediately patch the background back in
      ctx.save();
      
      // First, erase the content
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
      
      // Now patch the background back in the same area
      if (backgroundImageRef.current) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
      }
      
      ctx.restore();
    } else {
      // Normal drawing
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = brushColor;

      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
      }
    }

    setLastPoint(currentPoint);
  };

  const stopDrawing = (e?: React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Release pointer capture if it was set
      if ('releasePointerCapture' in e.currentTarget && e.currentTarget instanceof HTMLElement) {
        try {
          e.currentTarget.releasePointerCapture((e as React.PointerEvent).pointerId);
        } catch {
          // Ignore errors if pointer capture release fails
        }
      }
    }
    
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
    if (!canvas || !ctx || !backgroundImageRef.current) return;

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw just the background image
    ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);

    // Clear saved data - use currentStageId
    localStorage.removeItem(`fieldStrategy_${currentStageId}`);
  };

  const canvasStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    display: 'block',
    touchAction: 'none', // Prevent all touch gestures
    WebkitTouchCallout: 'none', // Disable iOS callout
    WebkitTapHighlightColor: 'transparent' // Remove tap highlight on mobile
  };

  const DrawingControls = () => (
    <div className={`flex ${isFullscreen ? 'justify-center' : 'justify-between'} items-center mb-4 flex-shrink-0 flex-wrap gap-2`}>
      <div className="flex items-center gap-2 pb-2 md:pb-0">
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
          <option value={20}>X-Large</option>
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
          Save {currentStageId}
        </Button>
        <Button onClick={toggleFullscreen} variant="outline" size="sm">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div 
        ref={fullscreenRef}
        className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
        style={{ 
          touchAction: 'none',
          height: '100vh',
          width: '100vw'
        }}
      >
        {/* Fullscreen Header - Fixed height */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background">
          <div className="grid grid-cols-3 items-center">
            {/* Left side - Title */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold truncate">
                Field Strategy
              </h2>
              
              {/* Phase name when controls are hidden on any screen size */}
              {hideControls && (
                <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {currentStage?.label || currentStageId}
                </div>
              )}
            </div>
            
            {/* Center - Phase controls on medium+ screens when controls are visible */}
            <div className="hidden md:flex items-center justify-center gap-2">
              {!hideControls && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => switchStage('prev')}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden lg:inline">Previous</span>
                  </Button>
                  
                  <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                    {currentStage?.label || currentStageId}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => switchStage('next')}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden lg:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Right side - Exit button */}
            <div className="flex items-center justify-end">
              <Button onClick={toggleFullscreen} variant="outline" size="sm">
                <Minimize2 className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stage Switcher - Only on mobile screens when controls are visible */}
        {isMobile && !hideControls && (
          <div className="flex-shrink-0 p-2 md:p-3 border-b bg-background md:hidden">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchStage('prev')}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {currentStage?.label || currentStageId}
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  {currentStageIndex + 1} / {stages.length}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => switchStage('next')}
                className="flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Fullscreen Controls - Fixed height, conditionally hidden on small screens */}
        {(!hideControls || !isMobile) && (
          <div className="flex-shrink-0 p-2 md:p-4 border-b bg-background">
            <div className="flex flex-wrap justify-center items-center gap-2">
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
                <option value={20}>X-Large</option>
              </select>
              
              {/* Color selector */}
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 border rounded cursor-pointer"
              />
              
              <Button onClick={clearCanvas} variant="outline" size="sm">
                Clear
              </Button>
              <Button onClick={() => saveCanvas(true)} variant="outline" size="sm">
                Save
              </Button>
              
              {/* Hide Controls Button - Only on mobile screens */}
              {isMobile && (
                <Button
                  onClick={() => setHideControls(!hideControls)}
                  variant="outline"
                  size="sm"
                  title="Hide controls for more drawing space"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Canvas - Flexible height */}
        <div 
          className="flex-1 flex items-center justify-center p-2 md:p-4 bg-green-50 dark:bg-green-950/20 overflow-hidden relative"
          style={{ touchAction: 'none' }}
        >
        {/* Floating Controls - Only visible when controls are hidden on mobile */}
        {hideControls && isMobile && (
          <div className="absolute top-2 right-2 z-10">
            {/* Vertical layout on smaller screens, horizontal on lg+ */}
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
              {/* Show Controls Button */}
              <Button
                onClick={() => setHideControls(false)}
                variant="secondary"
                size="sm"
                className="shadow-lg"
                title="Show all controls"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {/* Phase Controls */}
              <div className="flex flex-col lg:flex-row gap-1 lg:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => switchStage('prev')}
                  className="shadow-lg bg-background/90 hover:bg-background"
                  title="Previous phase"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => switchStage('next')}
                  className="shadow-lg bg-background/90 hover:bg-background"
                  title="Next phase"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Drawing Controls */}
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-2">
                <Button
                  variant={!isErasing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsErasing(false)}
                  className="shadow-lg"
                  title="Draw mode"
                >
                  Draw
                </Button>
                <Button
                  variant={isErasing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsErasing(true)}
                  className="shadow-lg"
                  title="Erase mode"
                >
                  Erase
                </Button>
                <Button 
                  onClick={clearCanvas} 
                  variant="destructive" 
                  size="sm"
                  className="shadow-lg"
                  title="Clear canvas"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div 
          className="w-full h-full flex items-center justify-center"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <canvas
            ref={canvasRef}
            style={{
              ...canvasStyle,
              touchAction: 'none'  // Always prevent touch gestures
            }}
            className="border border-gray-300 rounded-lg cursor-crosshair shadow-lg"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
          />
        </div>
        </div>

        {/* Fullscreen Footer - Fixed height */}
        <div className="flex-shrink-0 p-2 md:p-4 border-t bg-background text-center text-xs md:text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            {!isMobile && (
              <>
                <span>Press ESC to exit fullscreen</span>
                <span>Use ← → arrows to switch stages</span>
              </>
            )}
            {isMobile && (
              <span>Tap Exit Fullscreen to return • Use Previous/Next or &lt; / &gt; to switch stages</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex flex-col" 
      data-stage={stageId}
      style={{ touchAction: 'pan-x pan-y' }} // Allow normal scrolling but prevent other gestures
    >
      {/* Normal Drawing Controls */}
      <DrawingControls />

      {/* Normal Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center border rounded-lg bg-green-50 dark:bg-green-950/20 min-h-0 p-4"
        style={{ touchAction: 'none' }}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <canvas
            ref={canvasRef}
            style={{
              ...canvasStyle,
              touchAction: 'none'  // Always prevent touch gestures
            }}
            className="border border-gray-300 rounded-lg cursor-crosshair max-w-full max-h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldCanvas;