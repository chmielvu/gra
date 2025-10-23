
import { GameState, EventChoice, GeneratedCharacter, YandereLedger, NarrativeCadence } from 'src/types/index';

/**
 * Applies the consequences of a player's choice to the game state.
 * This function mutates the provided state objects for performance.
 * @returns The updated game state components.
 */
export function applyConsequences(
    currentState: GameState,
    choice: EventChoice,
    assignedRoles: Record<string, GeneratedCharacter>
): GameState {
    const newLedger = { ...currentState.currentLedger };
    const newPlayerCharacter = { ...currentState.playerCharacter };
    const newEducatorRoster = [...currentState.educatorRoster];
    const newSubjectRoster = [...currentState.subjectRoster];

    choice.consequences.forEach(con => {
        // Apply stat changes
        if (con.statChanges) {
            const modifiedStats: Partial<YandereLedger> = { ...con.statChanges };
            // Example of cadence-based modifier
            if (newLedger.narrativeCadence === NarrativeCadence.Comfort) {
                if (modifiedStats.hopeLevel && modifiedStats.hopeLevel < 0) {
                    modifiedStats.hopeLevel = Math.round(modifiedStats.hopeLevel * 1.5);
                }
            }
            Object.assign(newLedger, modifiedStats);
        }

        // Change location
        if (con.changeLocation) {
            newLedger.currentLocationId = con.changeLocation;
        }

        // Update world state
        if (con.updateWorldState) {
            Object.assign(newLedger, con.updateWorldState);
        }

        // Apply bond changes
        if (con.bondChanges) {
            con.bondChanges.forEach(bc => {
                const targetChar = assignedRoles[bc.targetRole];
                if (targetChar) {
                    const currentBond = newLedger.interpersonalBonds[targetChar.id] || 0;
                    newLedger.interpersonalBonds[targetChar.id] = currentBond + bc.change;
                }
            });
        }
        
        // Set character mood
        if (con.setMood) {
            const targetChar = assignedRoles[con.setMood.role];
            if (!targetChar) return;

            const updateMood = (char: GeneratedCharacter) => ({ ...char, currentMood: con.setMood!.mood });

            if (targetChar.id === newPlayerCharacter.id) {
                Object.assign(newPlayerCharacter, updateMood(newPlayerCharacter));
            } else {
                const eduIdx = newEducatorRoster.findIndex(e => e.id === targetChar.id);
                if (eduIdx > -1) newEducatorRoster[eduIdx] = updateMood(newEducatorRoster[eduIdx]);
                
                const subIdx = newSubjectRoster.findIndex(s => s.id === targetChar.id);
                if (subIdx > -1) newSubjectRoster[subIdx] = updateMood(newSubjectRoster[subIdx]);
            }
        }
    });
    
    newLedger.eventHistory.push(newLedger.currentEventId!);

    return {
        ...currentState,
        currentLedger: newLedger,
        playerCharacter: newPlayerCharacter,
        educatorRoster: newEducatorRoster,
        subjectRoster: newSubjectRoster,
    };
}