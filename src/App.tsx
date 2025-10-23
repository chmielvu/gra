
import React, { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { playAudio } from './utils/audio';
import { LOCATIONS } from './constants/proceduralConstants';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import StoryDisplay from './components/StoryDisplay';
import ChoicePanel from './components/ChoicePanel';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import ImageDisplay from './components/ImageDisplay';
import LedgerDisplay from './components/LedgerDisplay';

const App: React.FC = () => {
  const { 
    gameState, isLoading, error, finalImageUrl, finalAudioData, 
    isAssetLoading, startStory, makeChoice, reset 
  } = useGameStore();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Effect to play audio when new data arrives from the store
    if (finalAudioData && audioContextRef.current) {
      playAudio(finalAudioData, audioContextRef.current, audioSourceRef);
    }
  }, [finalAudioData]);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { /* ignore */ }
      audioSourceRef.current = null;
    }
  };
  
  const handleStart = () => {
    // AudioContext must be initialized by a user action
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    startStory();
  };

  const handleChoiceClick = (choiceId: string) => {
    stopCurrentAudio();
    makeChoice(choiceId);
  };
  
  const handleResetClick = () => {
    stopCurrentAudio();
    reset();
  };

  const isTransitioning = isLoading || isAssetLoading;
  const locationName = gameState ? LOCATIONS[gameState.currentLedger.currentLocationId]?.name : "The Forge";

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header 
        onReset={gameState ? handleResetClick : undefined} 
        ledger={gameState?.currentLedger}
        locationName={locationName}
      />
      
      <div className="flex-grow container mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:space-x-6 h-full">
          
          <main className="flex-grow lg:w-2/3 relative min-h-[75vh] flex flex-col bg-black rounded-lg shadow-2xl overflow-hidden">
             {isLoading && !gameState && <Loader message="The Forge's Loom is weaving..." />}
             {error && !isLoading && !gameState && <div className="p-4"><ErrorMessage message={error} /></div>}
            
            {!gameState && !isLoading && !error && (
              <div className="h-full flex items-center justify-center">
                <WelcomeScreen onStart={handleStart} />
              </div>
            )}

            {gameState && (
              <>
                <ImageDisplay imageUrl={finalImageUrl} />
                
                <div className={`absolute z-10 bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-500`}>
                  <div className="container mx-auto max-w-4xl w-full">
                    {error && <ErrorMessage message={error}/>}
                    <StoryDisplay narrative={gameState.narrative} />
                    <ChoicePanel choices={gameState.playerChoices} onChoice={handleChoiceClick} disabled={isTransitioning} />
                  </div>
                </div>
              </>
            )}
          </main>

          {gameState && (
            <aside className="lg:w-1/3 mt-6 lg:mt-0 flex-shrink-0">
               <LedgerDisplay 
                  ledger={gameState.currentLedger} 
                  player={gameState.playerCharacter}
                  rosters={{educators: gameState.educatorRoster, subjects: gameState.subjectRoster}}
                />
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
