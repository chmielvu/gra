import React, { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider } from './features/game-manager/GameProvider';
import { useGameStore } from './features/game-manager/game.store';
import { useGameLoop } from './features/game-manager/useGameLoop.hook';
import { playAudio } from './shared/utils/audio';
import { LOCATIONS } from './shared/constants/gameData';

import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import GameLayout from './features/shell/components/GameLayout';

const queryClient = new QueryClient();

const TheForge: React.FC = () => {
  const { phase, error, gameState, currentTurn, assets, reset } = useGameStore();
  const { advanceTurn, isAdvancing } = useGameLoop();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (assets.audioData && audioContextRef.current) {
      playAudio(assets.audioData, audioContextRef.current, audioSourceRef);
    }
  }, [assets.audioData]);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { /* ignore */ }
      audioSourceRef.current = null;
    }
  };
  
  const handleStart = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // `advanceTurn` with no args starts the story
    advanceTurn();
  };

  const handleChoiceClick = (choiceId: string) => {
    stopCurrentAudio();
    advanceTurn(choiceId);
  };
  
  const handleResetClick = () => {
    stopCurrentAudio();
    reset();
  };
  
  const isLoading = phase === 'Loading' || isAdvancing;
  const locationName = gameState ? LOCATIONS[gameState.currentLedger.currentLocationId]?.name : "The Forge";

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header 
        onReset={gameState ? handleResetClick : undefined} 
        ledger={gameState?.currentLedger}
        locationName={locationName}
      />
      <main className="flex-grow container mx-auto p-4 lg:p-6 flex flex-col">
        {phase === 'Welcome' && <WelcomeScreen onStart={handleStart} />}
        {isLoading && !gameState && <Loader message="The Forge's Loom is weaving..." />}
        {phase === 'Error' && !currentTurn && <ErrorMessage message={error!} />}
        
        {gameState && currentTurn && (
          <GameLayout 
            isLoading={isLoading}
            error={error}
            gameState={gameState}
            currentTurn={currentTurn}
            assets={assets}
            onChoice={handleChoiceClick}
          />
        )}
      </main>
    </div>
  );
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
       <TheForge />
    </GameProvider>
  </QueryClientProvider>
);

export default App;
