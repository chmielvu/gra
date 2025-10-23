
import { YandereLedger, GeneratedCharacter, EventTemplate, NarrativeCadence } from "src/types/index";
import { LOCATIONS, EVENT_TEMPLATES } from "src/constants/gameData";

type Rosters = { educators: GeneratedCharacter[], subjects: GeneratedCharacter[] };

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
        const characters = Array.from(availableCharacters).sort(() => Math.random() - 0.5);

        for (const char of characters) {
            let matches = true;
            if (criteria.archetype) {
                const archetypes = Array.isArray(criteria.archetype) ? criteria.archetype : [criteria.archetype];
                if (!archetypes.includes(char.archetype)) {
                    matches = false;
                }
            }
            if (matches && criteria.requiredTraits) {
                if (!criteria.requiredTraits.every(trait => char.traits.includes(trait))) {
                    matches = false;
                }
            }
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
        if (!found) return null;
    }
    return assignments;
}

export function selectNextEvent(
    ledger: YandereLedger,
    player: GeneratedCharacter,
    rosters: Rosters,
): { event: EventTemplate; assignedRoles: Record<string, GeneratedCharacter> } | null {
    const currentLocation = LOCATIONS[ledger.currentLocationId];
    if (!currentLocation) return null;

    const possibleNextCadences = cadenceTransitions[ledger.narrativeCadence];
    
    const potentialEvents = EVENT_TEMPLATES.filter(event => {
        const eventCadences = Array.isArray(event.cadence) ? event.cadence : [event.cadence];
        return eventCadences.some(c => possibleNextCadences.includes(c)) &&
               event.locationTags.some(tag => currentLocation.tags.includes(tag)) &&
               !(event.isUnique && ledger.eventHistory.includes(event.id)) &&
               event.triggerConditions(ledger, player, rosters);
    });

    if (potentialEvents.length === 0) return null;
    
    const shuffledEvents = potentialEvents.sort(() => Math.random() - 0.5);
    for (const event of shuffledEvents) {
        const assignedRoles = assignRoles(event, player, rosters);
        if (assignedRoles) {
             return { event, assignedRoles };
        }
    }

    return null;
}