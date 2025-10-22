import React from 'react';

interface HeaderProps {
  onReset?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-100 tracking-tight">
            The Forge's Loom
          </h1>
          <p className="text-sm text-slate-400 font-sans">
            A Baroque Brutalism Narrative
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="font-sans bg-red-800/70 text-red-200 font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Start Anew
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;