
import React from 'react';

interface StoryDisplayProps {
  narrative: string;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ narrative }) => {
  return (
    // Main container for the text box. Brutalist: heavy borders, dark bg. Baroque: ornate corners.
    <div className="relative bg-slate-900/70 backdrop-blur-md border-t-2 border-b-2 border-red-900/60 shadow-2xl shadow-black/50 mb-8 animate-fade-in story-display-container">
      {/* Ornate corners - Decorative elements */}
      <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-red-700/80"></div>
      <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-red-700/80"></div>
      <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-red-700/80"></div>
      <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-red-700/80"></div>

      {/* Inner content area with padding */}
      <div className="p-6">
        <div className="text-slate-200 font-serif text-lg leading-relaxed max-h-[12rem] overflow-y-auto pr-4">
          {narrative.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryDisplay;