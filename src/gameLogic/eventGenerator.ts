
import type { YandereLedger, GeneratedCharacter, EventTemplate } from "../types";
import { LOCATIONS } from "../constants/proceduralConstants";
import { NarrativeCadence } from "../types";

type Rosters = { educators: GeneratedCharacter[], subjects: GeneratedCharacter[] };

// State machine for cadence transitions
const cadenceTransitions: Record<NarrativeCadence, NarrativeCadence[]> = {
    [NarrativeCadence.Comfort]: [NarrativeCadence.Tension, NarrativeCadence.Humor],
    [NarrativeCadence.Tension]: [NarrativeCadence.Terror, NarrativeCadence.Comfort, NarrativeCadence.Humor],
    [NarrativeCadence.Humor]:  [NarrativeCadence.Tension],
    [NarrativeCadence.Terror]: [NarrativeCadence.Aftermath],
    [NarrativeCadence.Aftermath]: [NarrativeCadence.Tension, NarrativeCadence.Comfort],
};

function assignRoles(
    event: EventTemplate,
    player: GeneratedCharacter,
    rosters: Rosters
): Record<string, GeneratedCharacter> | null {
    const assignments: Record<string, GeneratedCharacter> = {};
    const availableCharacters = new Set([...rosters.educators, ...rosters.subjects]);

    for (const role in event.roles) {
        const criteria = event.roles[role];
        if (criteria.mustBePlayer) {
            assignments[role] = player;
            availableCharacters.delete(player);
            continue;
        }

        let found = false;
        // Prioritize characters who haven't been used recently
        const characters = Array.from(availableCharacters).sort(() => Math.random() - 0.5);

        for (const char of characters) {
            let matches = true;
            // Check archetype
            if (criteria.archetype) {
                const archetypes = Array.isArray(criteria.archetype) ? criteria.archetype : [criteria.archetype];
                if (!archetypes.includes(char.archetype)) {
                    matches = false;
                }
            }
            // Check required traits
            if (matches && criteria.requiredTraits) {
                if (!criteria.requiredTraits.every(trait => char.traits.includes(trait))) {
                    matches = false;
                }
            }
            // Check forbidden traits
            if (matches && criteria.forbiddenTraits) {
                if (criteria.forbiddenTraits.some(trait => char.traits.includes(trait))) {
                    matches = false;
                }
            }

            if (matches) {
                assignments[role] = char;
                availableCharacters.delete(char);
                found = true;
                break;
            }
        }
        if (!found) return null; // Cannot cast this role, event fails
    }
    return assignments;
}

export function selectNextEvent(
    ledger: YandereLedger,
    player: GeneratedCharacter,
    rosters: Rosters,
    eventTemplates: EventTemplate[]
): { event: EventTemplate; assignedRoles: Record<string, GeneratedCharacter> } | null {
    const currentLocation = LOCATIONS[ledger.currentLocationId];
    if (!currentLocation) return null;

    // 1. Cadence Filtering
    const previousCadence = ledger.narrativeCadence;
    const possibleNextCadences = cadenceTransitions[previousCadence];
    
    const cadenceFilteredEvents = eventTemplates.filter(event => {
        const eventCadences = Array.isArray(event.cadence) ? event.cadence : [event.cadence];
        return eventCadences.some(c => possibleNextCadences.includes(c));
    });

    // 2. Standard Filtering Logic
    const potentialEvents = cadenceFilteredEvents.filter(event => {
        // Filter by location tags
        if (!event.locationTags.some(tag => currentLocation.tags.includes(tag))) {
            return false;
        }
        // Filter by specific locations if specified
        if (event.specificLocations && !event.specificLocations.includes(ledger.currentLocationId)) {
            return false;
        }
        // Filter out unique events already in history
        if (event.isUnique && ledger.eventHistory.includes(event.id)) {
            return false;
        }
        // Filter by trigger conditions
        if (!event.triggerConditions(ledger, player, rosters)) {
            return false;
        }
        return true;
    });

    if (potentialEvents.length === 0) return null;
    
    // 3. Casting and Selection
    const shuffledEvents = potentialEvents.sort(() => Math.random() - 0.5);
    for (const event of shuffledEvents) {
        const assignedRoles = assignRoles(event, player, rosters);
        if (assignedRoles) {
             return { event, assignedRoles };
        }
    }

    return null; // No event could be successfully cast
}
