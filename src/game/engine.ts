

// FIX: Corrected module import path for types to point to 'src/types/index' which contains the correct definitions.
import { GameState, YandereLedger, NarrativeCadence, TurnContext, EventChoice, CreativeOutput, GeneratedCharacter } from 'src/types/index';
import { generateInitialRosters } from './characterSystem';
import { selectNextEvent } from './eventSystem';
import { advanceTime } from './timeSystem';
import { applyConsequences } from './consequenceSystem';
import { generateStoryTurn } from 'src/services/geminiService';
import { EVENT_TEMPLATES, LOCATIONS } from 'src/constants/gameData';
import { INSPIRATION_LIBRARY, masterPrompt } from 'src/constants/prompts';
import { EducatorArchetype } from 'src/types/index';

/**
 * Builds the complete prompt string for the AI based on the current game state and event.
 */
function buildPrompt(gameState: GameState, turnContext: TurnContext): string {
    const { currentLedger, playerCharacter } = gameState;
    const { eventId, assignedRoles } = turnContext;
    const event = EVENT_TEMPLATES.find(e => e.id === eventId)!;

    let inspirations = [...INSPIRATION_LIBRARY.GLOBAL];
    Object.values(assignedRoles).forEach(char => {
        if (char) {
            inspirations.push(...(INSPIRATION_LIBRARY.Archetypes[char.archetype] || []));
            char.traits.forEach(trait => {
                inspirations.push(...(INSPIRATION_LIBRARY.Traits[trait] || []));
            });
        }
    });
    const locationDescKey = LOCATIONS[currentLedger.currentLocationId]?.descriptionKey;
    if (locationDescKey) {
        inspirations.push(...(INSPIRATION_LIBRARY.Locations[locationDescKey] || []));
    }
    inspirations.push(...(INSPIRATION_LIBRARY.Event_Setups[event.sceneSetupKey] || []));
    
    const location = LOCATIONS[currentLedger.currentLocationId];
    const rolesString = Object.entries(assignedRoles)
        .map(([role, char]) =>
            char ? `${role}: ${char.name} (Archetype: ${char.archetype}, Mood: ${char.currentMood})` : ''
        )
        .join('\n');

    return masterPrompt
        .replace('{locationName}', location.name)
        .replace('{locationTags}', location.tags.join(', '))
        .replace('{day}', currentLedger.day.toString())
        .replace('{timeOfDay}', currentLedger.timeOfDay)
        .replace('{cadence}', NarrativeCadence[currentLedger.narrativeCadence])
        .replace('{forgeIntensityLevel}', currentLedger.forgeIntensityLevel.toString())
        .replace('{magistraMood}', currentLedger.magistraMood)
        .replace('${/* Inject NEW CALCULATED STATE ledger JSON here */}', JSON.stringify(currentLedger, null, 2))
        .replace('{eventId}', event.id)
        .replace('{sceneSetupKey}', event.sceneSetupKey)
        .replace('${/* List all assigned characters and their roles/archetypes/traits here */}', rolesString)
        .replace('${/* Inject retrieved RAG snippets here */}', [...new Set(inspirations)].join('\n'))
        .replace('{Player.name}', playerCharacter.name);
}

/**
 * Determines the vocal style for TTS based on the narrative context.
 */
function determineVocalStyle(cadence: NarrativeCadence, speakerName: string, turnContext: TurnContext): string {
    const speakerChar = Object.values(turnContext.assignedRoles).find((c: GeneratedCharacter) => c.name === speakerName);
    switch (cadence) {
        case NarrativeCadence.Comfort:
        case NarrativeCadence.Aftermath:
            return 'whispering';
        case NarrativeCadence.Terror:
            return 'intensely';
        case NarrativeCadence.Humor:
            return 'mockingly';
        case NarrativeCadence.Tension:
            if (speakerChar?.archetype === EducatorArchetype.TheSadist || speakerChar?.archetype === EducatorArchetype.TheManipulator) {
                return 'seductively';
            }
            return 'clinically';
        default:
            return 'clinically';
    }
}

/**
 * Processes the game logic for a single turn to generate the next creative output.
 */
async function progressStory(gameState: GameState, previousImageUrl: string | null) {
    const eventData = selectNextEvent(gameState.currentLedger, gameState.playerCharacter, { educators: gameState.educatorRoster, subjects: gameState.subjectRoster });
    if (!eventData) {
        throw new Error("No valid event could be found for the current game state.");
    }
    const { event, assignedRoles } = eventData;
    
    const cadence = Array.isArray(event.cadence) ? event.cadence[0] : event.cadence;
    const ledgerForAI = { ...gameState.currentLedger, currentEventId: event.id, narrativeCadence: cadence };
    const stateForAI = { ...gameState, currentLedger: ledgerForAI };

    const turnContext: TurnContext = { eventId: event.id, assignedRoles, cadence, vocalStyle: '' };
    
    const prompt = buildPrompt(stateForAI, turnContext);
    const creativeOutput = await generateStoryTurn(prompt, previousImageUrl);

    const vocalStyle = determineVocalStyle(cadence, creativeOutput.speaker, turnContext);
    const finalTurn: CreativeOutput & { vocalStyle: string } = { ...creativeOutput, vocalStyle };
    const finalTurnContext: TurnContext = { ...turnContext, vocalStyle };

    return { updatedGameState: stateForAI, turn: finalTurn, turnContext: finalTurnContext };
}

/**
 * Sets up the initial state for a new game.
 */
export async function initializeGameState() {
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

    const { updatedGameState, turn, turnContext } = await progressStory(initialGameState, null);

    return {
        initialGameState: updatedGameState,
        initialTurn: turn,
        initialTurnContext: turnContext
    };
}

/**
 * Processes a player's choice, updates the state, and generates the next turn.
 */
export async function processPlayerChoice(
    currentState: GameState,
    choiceId: string,
    turnContext: TurnContext,
    previousImageUrl: string | null
) {
    const prevEvent = EVENT_TEMPLATES.find(e => e.id === turnContext.eventId);
    const choice = prevEvent?.possibleChoices.find(c => c.id === choiceId);

    if (!prevEvent || !choice) {
        throw new Error(`Could not find event or choice context for: ${turnContext.eventId} / ${choiceId}`);
    }

    // 1. Apply consequences of the choice
    let stateAfterConsequences = applyConsequences(currentState, choice, turnContext.assignedRoles);

    // 2. Advance time
    const { day, timeOfDay } = advanceTime(stateAfterConsequences.currentLedger.day, stateAfterConsequences.currentLedger.timeOfDay);
    stateAfterConsequences.currentLedger.day = day;
    stateAfterConsequences.currentLedger.timeOfDay = timeOfDay;
    stateAfterConsequences.currentLedger.turn += 1;

    // 3. Generate the next story beat
    const { updatedGameState, turn, turnContext: nextTurnContext } = await progressStory(stateAfterConsequences, previousImageUrl);

    return {
        nextGameState: updatedGameState,
        nextTurn: turn,
        nextTurnContext
    };
}
