import { useMutation } from '@tanstack/react-query';
import { useGameStore } from './game.store';
import { engine } from '../../game/engine';
import { api } from '../../services/gemini.service';
import { GameState, TurnContext } from '../../shared/types/index';

interface AdvanceTurnPayload {
    gameState: GameState;
    choiceId: string;
    turnContext: TurnContext;
}

export const useGameLoop = () => {
    const { 
        setPhase, 
        setError, 
        setGameState, 
        setCurrentTurn, 
        setTurnContext, 
        setAssets,
        gameState,
        turnContext,
    } = useGameStore();

    const mutation = useMutation({
        mutationFn: async (choiceId?: string) => {
            if (choiceId && gameState && turnContext) {
                 return await engine.processPlayerChoice(gameState, choiceId, turnContext);
            } else {
                 return await engine.initializeGameState();
            }
        },
        onMutate: () => {
            setPhase('Loading');
        },
        onSuccess: async (data) => {
            const { nextGameState, nextTurn, nextTurnContext, initialGameState, initialTurn, initialTurnContext } = data as any;
            
            const newGameState = nextGameState || initialGameState;
            const newTurn = nextTurn || initialTurn;
            const newTurnContext = nextTurnContext || initialTurnContext;

            setGameState(newGameState);
            setCurrentTurn(newTurn);
            setTurnContext(newTurnContext);
            
            // Fetch assets in parallel
            const [imageResult, speechResult] = await Promise.allSettled([
                api.generateImage(newTurn.imagePrompt),
                api.generateSpeech(newTurn.ttsText, newTurn.speaker, newTurn.vocalStyle),
            ]);

            const imageData = imageResult.status === 'fulfilled' ? imageResult.value : '';
            const audioData = speechResult.status === 'fulfilled' ? speechResult.value : '';
            
            if (imageResult.status === 'rejected') console.error("Image generation failed:", imageResult.reason);
            if (speechResult.status === 'rejected') console.error("Speech generation failed:", speechResult.reason);

            setAssets({ imageData, audioData });
            setPhase('Playing');
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    return {
        advanceTurn: mutation.mutate,
        isAdvancing: mutation.isPending,
    };
};