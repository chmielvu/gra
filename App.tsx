
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from './types';
import { initializeStory, advanceStory } from './services/storyEngineService';
import { playAudio } from './utils/audio';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import StoryDisplay from './components/StoryDisplay';
import ChoicePanel from './components/ChoicePanel';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Effect to play audio when game state updates with new TTS data
  useEffect(() => {
    if (gameState?.ttsAudioBase64) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      playAudio(gameState.ttsAudioBase64, audioContextRef.current, audioSourceRef);
    }
    // Cleanup function to stop audio if component unmounts or state changes
    return () => {
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (e) {
          // May throw if already stopped
        }
      }
    };
  }, [gameState?.ttsAudioBase64]);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
         // May throw if already stopped
      }
      audioSourceRef.current = null;
    }
  };


  const handleStartStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGameState(null);
    try {
      const initialState = await initializeStory();
      setGameState(initialState);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during initialization.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChoice = useCallback(async (choiceIndex: number) => {
    if (!gameState) return;
    setIsLoading(true);
    setError(null);
    stopCurrentAudio();
    try {
      // Temporarily remove choices to prevent multiple clicks while processing
      setGameState(prev => prev ? { ...prev, playerChoices: [] } : null);
      const nextState = await advanceStory(gameState, choiceIndex);
      setGameState(nextState);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      
      let userFriendlyError = `An unexpected error occurred while advancing the story. Please try again. Details: ${errorMessage}`;
      
      // Differentiate errors to provide more specific and accurate user feedback.
      if (errorMessage.includes("The Abyss Alchemist")) {
          // This is a core failure from the story engine model itself.
          userFriendlyError = `A core narrative error occurred. The story engine reported: "${errorMessage}" Please try making the choice again.`;
      } else if (errorMessage.includes("visual from the abyss")) {
          // The story text was likely generated, but the image failed. The UI state is reverted.
          // The message now accurately reflects that the story could not proceed.
          userFriendlyError = `The story could not proceed because the new scene's visual failed to generate. Please try your choice again. Error: ${errorMessage}`;
      } else if (errorMessage.includes("voice from the forge")) {
          // The story text was likely generated, but the audio failed. The UI state is reverted.
          userFriendlyError = `The story could not proceed because the new scene's audio failed to generate. Please try your choice again. Error: ${errorMessage}`;
      }

      setError(userFriendlyError);
      
      // Restore choices on error to allow the user to try the same choice again.
      // The rest of the gameState is implicitly kept from the previous state because setGameState was not called with a new state.
      setGameState(prev => prev ? { ...prev, playerChoices: gameState.playerChoices } : gameState);
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);
  
  const handleReset = () => {
    stopCurrentAudio();
    setGameState(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header onReset={gameState ? handleReset : undefined} />
      
      <main className="flex-grow relative">
        {isLoading && !gameState && <Loader message="The Forge's Loom is weaving..." />}
        {error && <ErrorMessage message={error} />}

        {!gameState && !isLoading && !error && (
          <div className="h-full flex items-center justify-center">
            <WelcomeScreen onStart={handleStartStory} />
          </div>
        )}
        
        {gameState && !error && (
          <>
            <ImageDisplay imageUrl={gameState.imageUrl} />
            
            <div className={`absolute z-10 bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-500 ${isLoading ? 'is-pacing' : ''}`}>
              <div className="container mx-auto max-w-4xl w-full">
                <StoryDisplay narrative={gameState.narrative} />
                <ChoicePanel choices={gameState.playerChoices} onChoice={handleChoice} disabled={isLoading} />
              </div>
            </div>
          </>
        )}
      </main>
      <style>{`
        @keyframes narrative-pulse-border {
          0% { border-color: rgba(153, 27, 27, 0.6); } /* border-red-900/60 */
          50% { border-color: rgba(220, 38, 38, 0.9); } /* border-red-600/90 */
          100% { border-color: rgba(153, 27, 27, 0.6); }
        }

        .is-pacing .story-display-container {
          animation: narrative-pulse-border 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
