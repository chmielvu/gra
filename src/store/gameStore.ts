
import { create } from 'zustand';
// FIX: Corrected module import path for types to point to 'src/types/index' which contains the correct definitions.
import { GameState, CreativeOutput, TurnContext } from 'src/types/index';
import { initializeGameState, processPlayerChoice } from 'src/game/engine';
import { generateImage, generateSpeech } from 'src/services/geminiService';

type GamePhase = 'Welcome' | 'Loading' | 'Playing' | 'Error';

interface GameStoreState {
  phase: GamePhase;
  error: string | null;
  gameState: GameState | null;
  currentTurn: (CreativeOutput & { vocalStyle: string }) | null;
  turnContext: TurnContext | null; // Holds context needed for the *next* choice
  assets: {
    currentImageUrl: string;
    isImageLoading: boolean;
    audioData: string;
    isAudioLoading: boolean;
  };
}

interface GameStoreActions {
  startStory: () => Promise<void>;
  makeChoice: (choiceId: string) => Promise<void>;
  reset: () => void;
}

const initialState: GameStoreState = {
    phase: 'Welcome',
    error: null,
    gameState: null,
    currentTurn: null,
    turnContext: null,
    assets: {
        currentImageUrl: '',
        isImageLoading: false,
        audioData: '',
        isAudioLoading: false,
    },
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set, get) => {
  const fetchAssets = async (turn: CreativeOutput & { vocalStyle: string }) => {
    if (!turn) return;

    set(state => ({
        ...state,
        assets: { ...state.assets, isImageLoading: true, isAudioLoading: true, audioData: '' }
    }));

    const [imageResult, audioResult] = await Promise.allSettled([
        generateImage(turn.imagePrompt),
        generateSpeech(turn.ttsText, turn.speaker, turn.vocalStyle),
    ]);
    
    const assetUpdates: Partial<GameStoreState['assets']> = {};
    // FIX: Correctly check for rejected promise status before accessing 'reason' property.
    if (imageResult.status === 'fulfilled' && imageResult.value) {
        assetUpdates.currentImageUrl = imageResult.value;
    } else if (imageResult.status === 'rejected') {
        console.error("Image generation failed:", imageResult.reason);
    }
    
    // FIX: Correctly check for rejected promise status before accessing 'reason' property.
    if (audioResult.status === 'fulfilled' && audioResult.value) {
        assetUpdates.audioData = audioResult.value;
    } else if (audioResult.status === 'rejected') {
        console.error("Speech generation failed:", audioResult.reason);
    }

    set(state => ({
        ...state,
        assets: { ...state.assets, ...assetUpdates, isImageLoading: false, isAudioLoading: false }
    }));
  };

  return {
    ...initialState,

    startStory: async () => {
      set({ phase: 'Loading', error: null });
      try {
        const { initialGameState, initialTurn, initialTurnContext } = await initializeGameState();
        set({
            gameState: initialGameState,
            currentTurn: initialTurn,
            turnContext: initialTurnContext,
            phase: 'Playing',
        });
        fetchAssets(initialTurn);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        set({ phase: 'Error', error: message });
      }
    },

    makeChoice: async (choiceId: string) => {
      const { gameState, turnContext, assets } = get();
      if (!gameState || !turnContext) return;

      const previousState = { gameState, currentTurn: get().currentTurn };
      set({ phase: 'Loading', error: null, currentTurn: { ...get().currentTurn!, playerChoices: [] } });
      
      try {
        const { nextGameState, nextTurn, nextTurnContext } = await processPlayerChoice(
            gameState,
            choiceId,
            turnContext,
            assets.currentImageUrl
        );
        set({
            gameState: nextGameState,
            currentTurn: nextTurn,
            turnContext: nextTurnContext,
            phase: 'Playing'
        });
        fetchAssets(nextTurn);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        set({
            phase: 'Error',
            error: `The story could not proceed. Error: ${message}`,
            gameState: previousState.gameState,
            currentTurn: previousState.currentTurn, // Restore previous turn to allow retry
        });
      }
    },

    reset: () => {
      set(initialState);
    }
  };
});
