
import { create } from 'zustand';
import type { GameState } from '../types';
import { initializeStory, advanceStory, generateImage, generateSpeech } from '../services/storyEngineService';

interface GameStoreState {
  gameState: GameState | null;
  isLoading: boolean; // For primary story progression (AI calls)
  error: string | null;
  finalImageUrl: string;
  finalAudioData: string;
  isAssetLoading: boolean; // For secondary assets (image/audio calls)
}

interface GameStoreActions {
  startStory: () => Promise<void>;
  makeChoice: (choiceId: string) => Promise<void>;
  reset: () => void;
  _fetchAssets: () => Promise<void>;
}

export const useGameStore = create<GameStoreState & GameStoreActions>((set, get) => ({
  gameState: null,
  isLoading: false,
  error: null,
  finalImageUrl: '',
  finalAudioData: '',
  isAssetLoading: false,

  _fetchAssets: async () => {
    const { gameState } = get();
    if (!gameState || !gameState.narrative) return;

    set({ isAssetLoading: true, finalImageUrl: '', finalAudioData: '' });

    try {
      const [imageUrlResult, audioDataResult] = await Promise.allSettled([
        generateImage(gameState.imagePrompt),
        generateSpeech(gameState.ttsText, gameState.speaker, gameState.ttsVocalStyle)
      ]);
      
      if (imageUrlResult.status === 'fulfilled') {
        set({ finalImageUrl: imageUrlResult.value });
      } else {
        console.error("Image generation failed:", imageUrlResult.reason);
      }

      if (audioDataResult.status === 'fulfilled') {
        set({ finalAudioData: audioDataResult.value });
      } else {
        console.error("Speech generation failed:", audioDataResult.reason);
      }
    } catch (e) {
      console.error("Failed to fetch secondary assets", e);
    } finally {
      set({ isAssetLoading: false });
    }
  },

  startStory: async () => {
    set({ isLoading: true, error: null, gameState: null });
    try {
      const initialState = await initializeStory();
      set({ gameState: initialState });
      // Fetch assets after the initial state is set
      get()._fetchAssets();
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : 'An unknown error occurred during initialization.' });
    } finally {
      set({ isLoading: false });
    }
  },

  makeChoice: async (choiceId: string) => {
    const { gameState, _fetchAssets, finalImageUrl } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    const previousGameState = gameState;

    try {
      // Immediately remove choices for better UX while waiting for AI
      set({ gameState: { ...gameState, playerChoices: [] } });
      
      const nextState = await advanceStory(gameState, choiceId, finalImageUrl);
      
      set({ gameState: nextState });
      // Fetch assets for the new state
      _fetchAssets();

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ 
        error: `The story could not proceed. Please try again. Error: ${errorMessage}`,
        gameState: previousGameState // Restore previous state on error to allow retry
      });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      gameState: null,
      isLoading: false,
      error: null,
      finalImageUrl: '',
      finalAudioData: '',
      isAssetLoading: false
    });
  }
}));
