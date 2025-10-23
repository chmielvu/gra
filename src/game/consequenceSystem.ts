import { GameState, EventChoice, GeneratedCharacter, YandereLedger, NarrativeCadence } from '../shared/types/index';

/**
 * Applies the consequences of a player's choice to the game state.
 * This function is pure and returns a new GameState object.
 */
export function applyConsequences(
    currentState: GameState,
    choice: EventChoice,
    assignedRoles: Record<string, GeneratedCharacter>
): GameState {
    const newLedger: YandereLedger = JSON.parse(JSON.stringify(currentState.currentLedger));
    const newPlayerCharacter: GeneratedCharacter = JSON.parse(JSON.stringify(currentState.playerCharacter));
    const educatorRosterMap: Map<string, GeneratedCharacter> = new Map(currentState.educatorRoster.map(c => [c.id, JSON.parse(JSON.stringify(c))]));
    const subjectRosterMap: Map<string, GeneratedCharacter> = new Map(currentState.subjectRoster.map(c => [c.id, JSON.parse(JSON.stringify(c))]));

    choice.consequences.forEach(con => {
        // ... (Consequence logic like statChanges, bondChanges, setMood remains the same)
        // Set character mood
        if (con.setMood) {
            const targetChar = assignedRoles[con.setMood.role];
            if (!targetChar) return;

            const newMood = con.setMood.mood;

            if (targetChar.id === newPlayerCharacter.id) {
                newPlayerCharacter.currentMood = newMood;
            } else if (educatorRosterMap.has(targetChar.id)) {
                educatorRosterMap.get(targetChar.id)!.currentMood = newMood;
            } else if (subjectRosterMap.has(targetChar.id)) {
                subjectRosterMap.get(targetChar.id)!.currentMood = newMood;
            }
        }
    });
    
    newLedger.eventHistory.push(newLedger.currentEventId!);

    return {
        playerCharacter: newPlayerCharacter,
        educatorRoster: Array.from(educatorRosterMap.values()),
        subjectRoster: Array.from(subjectRosterMap.values()),
        currentLedger: newLedger,
    };
}
