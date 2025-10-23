
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from './types';
import { initializeStory, advanceStory, generateImage, generateSpeech } from './services/storyEngineService';
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

  // State for final, generated assets
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [finalAudioData, setFinalAudioData] = useState<string>('');
  const [isAssetLoading, setIsAssetLoading] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Effect to play audio when final audio data is available
  useEffect(() => {
    if (finalAudioData) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      playAudio(finalAudioData, audioContextRef.current, audioSourceRef);
    }
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, [finalAudioData]);

  // Effect to fetch assets when the text-based game state updates
  useEffect(() => {
    if (!gameState || !gameState.narrative) return;

    const fetchAssets = async () => {
      setIsAssetLoading(true);
      // Reset previous assets to ensure UI updates correctly
      setFinalImageUrl('');
      setFinalAudioData('');

      try {
        // gameState.imageUrl is the prompt, gameState.ttsAudioBase64 is the text
        const [imageUrlResult, audioDataResult] = await Promise.allSettled([
          generateImage(gameState.imageUrl),
          generateSpeech(gameState.ttsAudioBase64, gameState.speaker)
        ]);
        
        if (imageUrlResult.status === 'fulfilled') {
            setFinalImageUrl(imageUrlResult.value);
        } else {
            console.error("Image generation failed:", imageUrlResult.reason);
            setError("The visual for this scene failed to generate.");
        }

        if (audioDataResult.status === 'fulfilled') {
            setFinalAudioData(audioDataResult.value);
        } else {
             console.error("Speech generation failed:", audioDataResult.reason);
             // This error is less critical; we can proceed without audio.
        }

      } catch (e) {
        console.error("Failed to fetch secondary assets", e);
        setError(e instanceof Error ? e.message : 'Failed to load visual or audio assets.');
      } finally {
        setIsAssetLoading(false);
      }
    };
    
    fetchAssets();
  }, [gameState?.narrative]);

  const stopCurrentAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { /* ignore */ }
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
    
    const previousGameState = gameState;

    try {
      setGameState(prev => prev ? { ...prev, playerChoices: [] } : null);
      const nextState = await advanceStory(gameState, choiceIndex);
      setGameState(nextState);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`The story could not proceed. Please try again. Error: ${errorMessage}`);
      setGameState(previousGameState);
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);
  
  const handleReset = () => {
    stopCurrentAudio();
    setGameState(null);
    setError(null);
    setIsLoading(false);
    setFinalImageUrl('');
    setFinalAudioData('');
  }

  const isTransitioning = isLoading || (gameState != null && isAssetLoading);

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header onReset={gameState ? handleReset : undefined} />
      
      <main className="flex-grow relative">
        {isLoading && !gameState && <Loader message="The Forge's Loom is weaving..." />}
        {error && !isLoading && <div className="p-4"><ErrorMessage message={error} /></div>}

        {!gameState && !isLoading && !error && (
          <div className="h-full flex items-center justify-center">
            <WelcomeScreen onStart={handleStartStory} />
          </div>
        )}
        
        {gameState && (
          <>
            <ImageDisplay imageUrl={finalImageUrl} />
            
            <div className={`absolute z-10 bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-500 ${isTransitioning ? 'is-pacing' : ''}`}>
              <div className="container mx-auto max-w-4xl w-full">
                <StoryDisplay narrative={gameState.narrative} />
                <ChoicePanel choices={gameState.playerChoices} onChoice={handleChoice} disabled={isTransitioning} />
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
