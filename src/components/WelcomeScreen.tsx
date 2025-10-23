
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-grow flex items-center justify-center w-full">
      <div className="w-full max-w-3xl text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700 animate-fade-in">
        <h2 className="mt-4 text-4xl font-bold font-serif text-red-400">Welcome to The Forge</h2>
        <p className="mt-4 text-slate-300 font-serif text-lg leading-relaxed">
          Here, narratives are not told, but smelted. The Yandere Abyss Alchemist awaits your direction to craft a continuous, evolving tale of psychological annihilation and perverse humor. Your choices will twist the very fabric of this reality.
        </p>
        <p className="mt-2 text-slate-400 font-sans text-sm">
            This is an interactive, AI-driven story. Be warned: the content is intended to be dark, intense, and unsettling.
        </p>
        <div className="mt-8">
          <button
            onClick={onStart}
            className="cursor-pointer bg-red-700 text-white font-bold py-4 px-8 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Begin the Ordeal
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;