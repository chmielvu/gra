import { create } from 'zustand';
import { GameState, CreativeOutput, GamePhase, TurnContext } from '../../shared/types/index';

interface GameStoreState {
  phase: GamePhase;
  gameState: GameState | null;
  currentTurn: CreativeOutput | null;
  turnContext: TurnContext | null;
  assets: {
    imageData: string;
    audioData: string;
  };
  error: string | null;
}

interface GameStoreActions {
  setPhase: (phase: GamePhase) => void;
  setGameState: (state: GameState) => void;
  setCurrentTurn: (turn: CreativeOutput) => void;
  setTurnContext: (context: TurnContext) => void;
  setAssets: (assets: { imageData?: string; audioData?: string }) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: GameStoreState = {
  phase: GamePhase.Welcome,
  gameState: null,
  currentTurn: null,
  turnContext: null,
  assets: {
    imageData: '',
    audioData: '',
  },
  error: null,
};

export const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase, error: null }), // Clear error on phase change
  setGameState: (gameState) => set({ gameState }),
  setCurrentTurn: (currentTurn) => set({ currentTurn }),
  setTurnContext: (turnContext) => set({ turnContext }),
  setAssets: ({ imageData, audioData }) => set((state) => ({
    assets: {
      imageData: imageData ?? state.assets.imageData,
      audioData: audioData ?? state.assets.audioData,
    }
  })),
  setError: (error) => set({ error, phase: GamePhase.Error }),
  reset: () => set(initialState),
}));