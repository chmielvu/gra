import { YandereLedger, GeneratedCharacter, EventTemplate, NarrativeCadence } from "../shared/types/index";
import { LOCATIONS, EVENT_TEMPLATES } from "../shared/constants/gameData";

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
    const availableCharacters = new Set([...rosters.educators, ...rosters.subjects, player]);
    const assignedIds = new Set<string>();

    // Handle mustBePlayer first
    for (const role in event.roles) {
        if (event.roles[role].mustBePlayer) {
            assignments[role] = player;
            assignedIds.add(player.id);
        }
    }

    for (const role in event.roles) {
        if (assignments[role]) continue; // Already assigned (e.g., player)

        const criteria = event.roles[role];
        let found = false;
        
        const characters = Array.from(availableCharacters).sort(() => Math.random() - 0.5);
        for (const char of characters) {
             if (assignedIds.has(char.id)) continue;

             let matches = true;
            if (criteria.archetype) {
                const archetypes = Array.isArray(criteria.archetype) ? criteria.archetype : [criteria.archetype];
                if (!archetypes.includes(char.archetype)) {
                    matches = false;
                }
            }
            if (matches) {
                assignments[role] = char;
                assignedIds.add(char.id);
                found = true;
                break;
            }
        }
        if (!found) return null; // Cannot fulfill this role, so the event cannot be cast
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

    const possibleNextCadences = cadenceTransitions[ledger.narrativeCadence] || [NarrativeCadence.Tension];
    
    const potentialEvents = EVENT_TEMPLATES.filter(event => {
        if (!event.cadence || !event.locationTags || !event.triggerConditions) return false;
        
        const eventCadences = Array.isArray(event.cadence) ? event.cadence : [event.cadence];
        
        return eventCadences.some(c => possibleNextCadences.includes(c)) &&
               event.locationTags.some(tag => currentLocation.tags.includes(tag)) &&
               !(event.isUnique && ledger.eventHistory.includes(event.id)) &&
               event.triggerConditions(ledger, player, rosters);
    });

    if (potentialEvents.length === 0) return null;
    
    // Shuffle and attempt to cast
    const shuffledEvents = potentialEvents.sort(() => Math.random() - 0.5);
    for (const event of shuffledEvents) {
        const assignedRoles = assignRoles(event, player, rosters);
        if (assignedRoles) {
             return { event, assignedRoles };
        }
    }

    return null;
}
