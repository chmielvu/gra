
import React from 'react';

interface ChoicePanelProps {
  choices: string[];
  onChoice: (choiceIndex: number) => void;
  disabled: boolean;
}

const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onChoice, disabled }) => {
  if (!Array.isArray(choices) || choices.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in space-y-3 pt-4">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onChoice(index)}
          disabled={disabled}
          className="group w-full text-center p-4 
                     bg-black/30 backdrop-blur-sm 
                     border border-red-800/80 
                     rounded-lg 
                     shadow-[0_0_8px_rgba(153,27,27,0.5)] 
                     hover:bg-red-950/40 
                     hover:border-red-600 
                     hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] 
                     transition-all duration-300 
                     disabled:bg-slate-800 disabled:shadow-none disabled:border-slate-600 disabled:text-slate-500 disabled:cursor-not-allowed 
                     focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <span className="font-serif text-lg font-bold uppercase tracking-wider text-red-300 group-hover:text-red-100 group-disabled:text-slate-500 transition-colors duration-300">{choice}</span>
        </button>
      ))}
    </div>
  );
};

export default ChoicePanel;
