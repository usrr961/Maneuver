// Tutorial GIF Component
// This shows how you can integrate actual GIF files into the tutorials

import { useState } from 'react';

interface TutorialGifProps {
  src: string;
  alt: string;
  caption?: string;
}

export const TutorialGif = ({ src, alt, caption }: TutorialGifProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="tutorial-gif-container">
      {!isLoaded && !hasError && (
        <div className="bg-muted rounded-lg p-8 animate-pulse">
          <div className="text-center text-muted-foreground text-sm">
            Loading tutorial...
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="bg-muted rounded-lg p-8">
          <div className="text-center text-muted-foreground text-sm">
            Tutorial GIF not available yet
          </div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full rounded-lg border shadow-sm ${isLoaded ? 'block' : 'hidden'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      
      {caption && isLoaded && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          {caption}
        </p>
      )}
    </div>
  );
};

// Example usage in your tutorials:
// <TutorialGif 
//   src="/assets/tutorials/game-start-demo.gif" 
//   alt="Game Start Setup Demo"
//   caption="Setting up a new match with team and alliance selection"
// />
