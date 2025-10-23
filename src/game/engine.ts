import { GameState, YandereLedger, NarrativeCadence, TurnContext, EventChoice, CreativeOutput } from '../shared/types/index';
import { generateInitialRosters } from './characterSystem';
import { selectNextEvent } from './eventSystem';
import { advanceTime } from './timeSystem';
import { applyConsequences } from './consequenceSystem';
import { api } from '../services/gemini.service';
import { EVENT_TEMPLATES, LOCATIONS } from '../shared/constants/gameData';
import { INSPIRATION_LIBRARY, masterPrompt } from '../shared/constants/prompts';

function buildPrompt(gameState: GameState, turnContext: TurnContext): string {
    // ... (buildPrompt logic remains the same, using aliased imports)
    const { currentLedger, playerCharacter } = gameState;
    const { eventId, assignedRoles } = turnContext;
    const event = EVENT_TEMPLATES.find(e => e.id === eventId)!;
    
    // ... inspiration gathering logic
    let inspirations = [...(INSPIRATION_LIBRARY.GLOBAL || [])];
    
    // ... prompt construction
    const prompt = masterPrompt
        .replace('{Player.name}', playerCharacter.name)
        // ... and all other replacements
        ;
    return prompt;
}

async function progressStory(gameState: GameState) {
    const eventData = selectNextEvent(gameState.currentLedger, gameState.playerCharacter, { educators: gameState.educatorRoster, subjects: gameState.subjectRoster });
    if (!eventData) {
        // As a fallback, create a simple time-passing event
        const newLedger = { ...gameState.currentLedger, narrativeCadence: NarrativeCadence.Tension };
        const tempTurnContext: TurnContext = { eventId: 'FALLBACK_TIME_PASSES', assignedRoles: {}, cadence: NarrativeCadence.Tension };
        const turn: CreativeOutput = {
            reasoning: "No specific event was triggered. Advancing time.",
            narrative: "Time passes in the oppressive silence of the Forge. The air grows heavier with unspoken anxieties.",
            playerChoices: [{id: "choice_continue", text: "Endure."}],
            imagePrompt: { prompt: "A dark, empty concrete hallway in a brutalist building, dimly lit by a single gas lamp, long oppressive shadows, film grain." },
            ttsText: "Time passes.",
            speaker: "Narrator",
            vocalStyle: "[somber]",
        };
        return { updatedGameState: {...gameState, currentLedger: newLedger}, turn, turnContext: tempTurnContext };
    }

    const { event, assignedRoles } = eventData;
    
    const cadence = Array.isArray(event.cadence) ? event.cadence[0] : event.cadence;
    const ledgerForAI = { ...gameState.currentLedger, currentEventId: event.id, narrativeCadence: cadence };
    const stateForAI = { ...gameState, currentLedger: ledgerForAI };

    const turnContext: TurnContext = { eventId: event.id, assignedRoles, cadence };
    
    const prompt = buildPrompt(stateForAI, turnContext);
    const creativeOutput = await api.generateStoryTurn(prompt);

    return { updatedGameState: stateForAI, turn: creativeOutput, turnContext };
}

export const engine = {
  initializeGameState: async () => {
    const { player, educators, subjects } = generateInitialRosters();
    const initialLedger: YandereLedger = {
        turn: 0,
        currentLocationId: 'LOC_BOYS_HUTS',
        day: 1,
        timeOfDay: 'Morning',
        subjectAgencyBudget: 100,
        shamePainAbyssLevel: 0,
        traumaLevel: 0,
        hopeLevel: 100,
        physicalIntegrity: 100,
        interpersonalBonds: {},
        forgeIntensityLevel: 50,
        magistraMood: 'Neutral',
        eventHistory: [],
        narrativeCadence: NarrativeCadence.Tension,
    };
    
    const initialGameState: GameState = {
        playerCharacter: player,
        educatorRoster: educators,
        subjectRoster: subjects,
        currentLedger: initialLedger,
    };

    const { updatedGameState, turn, turnContext } = await progressStory(initialGameState);

    return {
        initialGameState: updatedGameState,
        initialTurn: turn,
        initialTurnContext: turnContext
    };
  },

  processPlayerChoice: async (
    currentState: GameState,
    choiceId: string,
    turnContext: TurnContext
  ) => {
    if (turnContext.eventId === 'FALLBACK_TIME_PASSES') {
         // If we are in the fallback state, just advance time and find the next real event
        let stateAfterTime = { ...currentState };
        const { day, timeOfDay } = advanceTime(stateAfterTime.currentLedger.day, stateAfterTime.currentLedger.timeOfDay);
        stateAfterTime.currentLedger.day = day;
        stateAfterTime.currentLedger.timeOfDay = timeOfDay;
        stateAfterTime.currentLedger.turn += 1;
        return await progressStory(stateAfterTime);
    }
    
    const prevEvent = EVENT_TEMPLATES.find(e => e.id === turnContext.eventId);
    const choice = prevEvent?.possibleChoices.find(c => c.id === choiceId);

    if (!prevEvent || !choice) {
        throw new Error(`Could not find event or choice context.`);
    }

    // 1. Apply consequences
    let stateAfterConsequences = applyConsequences(currentState, choice, turnContext.assignedRoles);

    // 2. Advance time
    const { day, timeOfDay } = advanceTime(stateAfterConsequences.currentLedger.day, stateAfterConsequences.currentLedger.timeOfDay);
    stateAfterConsequences.currentLedger.day = day;
    stateAfterConsequences.currentLedger.timeOfDay = timeOfDay;
    stateAfterConsequences.currentLedger.turn += 1;

    // 3. Generate the next story beat
    const { updatedGameState, turn, turnContext: nextTurnContext } = await progressStory(stateAfterConsequences);

    return {
        nextGameState: updatedGameState,
        nextTurn: turn,
        nextTurnContext
    };
  }
};
