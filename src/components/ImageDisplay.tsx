
import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ImageDisplayProps {
  imageUrl: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl }) => {
  // The URL currently displayed or being faded out
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  // The loading and error state for the *next* image
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
        setIsLoading(false);
        return;
    };

    // Keep showing the old image while the new one loads in the background
    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      // Once loaded, swap it in. The `key` change will trigger the fade animation.
      setActiveImageUrl(imageUrl);
      setIsLoading(false);
    };

    img.onerror = () => {
      // If loading fails, keep the old image and show an error over it.
      setError('The Forge could not render the visual for this scene.');
      setIsLoading(false);
    };
  }, [imageUrl]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      {/* Display the active image. The key change triggers the animation. */}
      {activeImageUrl && (
        <img
          key={activeImageUrl}
          src={activeImageUrl}
          alt="A scene from the Forge's Loom"
          className="w-full h-full object-cover animate-fade-in-slow animate-zoom-pan"
        />
      )}
      
      {/* Replaced spinner with a subtle, textured overlay that pulses gently. */}
      {isLoading && (
         <div className="absolute inset-0 z-10 animate-subtle-pulse-texture"></div>
      )}

      {/* Error Overlay - shown over the old image if the new one fails */}
      {error && (
        <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm flex items-center justify-center z-10 p-4 transition-opacity duration-300">
          <div className="flex flex-col items-center text-center text-red-200">
            <AlertTriangleIcon className="w-12 h-12 mb-4" />
            <p className="font-bold text-lg">Visual Generation Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Static Darkening Overlay for atmosphere */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <style>{`
        @keyframes fade-in-slow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-slow {
           animation: fade-in-slow 1.5s ease-in-out;
        }
        @keyframes zoom-pan {
          0% { transform: scale(1) translateX(0); }
          100% { transform: scale(1.15) translateX(-5%); }
        }
        .animate-zoom-pan {
           animation: zoom-pan 40s infinite alternate;
        }
        
        /* New loading animation: a pulsing, textured overlay */
        @keyframes subtle-pulse {
            0% { opacity: 0.1; }
            50% { opacity: 0.3; }
            100% { opacity: 0.1; }
        }
        .animate-subtle-pulse-texture {
            background-image: repeating-linear-gradient(
                0deg, 
                transparent, 
                transparent 2px, 
                rgba(0,0,0,0.2) 2px, 
                rgba(0,0,0,0.2) 4px
            );
            animation: subtle-pulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ImageDisplay;
