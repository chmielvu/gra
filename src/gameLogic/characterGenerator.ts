
import { TRAITS } from '../constants/proceduralConstants';
import type { GeneratedCharacter, TraitKey } from '../types';
import { EducatorArchetype, SubjectArchetype } from '../types';
import { generateName } from './nameGenerator';

const EDUCATOR_CORE_TRAITS: Record<EducatorArchetype, TraitKey[]> = {
    [EducatorArchetype.TheSadist]: ['SADISTIC', 'SEDUCTIVELY_MOCKING'],
    [EducatorArchetype.TheManipulator]: ['INTELLIGENT', 'SUBTLY_KIND'],
    [EducatorArchetype.TheAnalyst]: ['CLINICALLY_DETACHED', 'OBSERVANT'],
    [EducatorArchetype.TheOverseer]: ['OBSERVANT', 'SECRET_DOUBTER'],
};

const SUBJECT_CORE_TRAITS: Record<SubjectArchetype, TraitKey[]> = {
    [SubjectArchetype.TheCatalyst]: ['RESILIENT', 'OBSERVANT'],
    [SubjectArchetype.TheProtector]: ['PROTECTIVE_LOYAL', 'STOIC'],
    [SubjectArchetype.TheDefiant]: ['IMPULSIVE', 'LATENT_REBELLIOUSNESS'],
};


function generateCharacter(
    archetype: EducatorArchetype | SubjectArchetype,
    existingIds: Set<string>
): GeneratedCharacter {
    let name: string;
    let id: string;
    
    // Ensure unique name and ID
    do {
        name = generateName(archetype);
        id = `${archetype.replace(/ /g, '_')}_${name}`;
    } while (existingIds.has(id));
    existingIds.add(id);

    const isEducator = Object.values(EducatorArchetype).includes(archetype as EducatorArchetype);

    const coreTraitsPool = isEducator 
        ? EDUCATOR_CORE_TRAITS[archetype as EducatorArchetype] 
        : SUBJECT_CORE_TRAITS[archetype as SubjectArchetype];
    
    // Trait Selection Logic
    const finalTraits: Set<TraitKey> = new Set();
    const coreTraitCount = 1 + Math.floor(Math.random() * 2);
    const shuffledCore = [...coreTraitsPool].sort(() => 0.5 - Math.random());
    for(let i=0; i < coreTraitCount && i < shuffledCore.length; i++) {
        finalTraits.add(shuffledCore[i]);
    }
    
    const secondaryTraitCount = 1 + Math.floor(Math.random() * 2);
    const potentialTraits = Object.keys(TRAITS).filter(t => !finalTraits.has(t as TraitKey)) as TraitKey[];
    
    let attempts = 0;
    while(finalTraits.size < (coreTraitCount + secondaryTraitCount) && attempts < 50) {
        const potentialTraitKey = potentialTraits[Math.floor(Math.random() * potentialTraits.length)];
        const potentialTrait = TRAITS[potentialTraitKey];
        let isCompatible = true;

        for (const existingTraitKey of finalTraits) {
            const existingTrait = TRAITS[existingTraitKey];
            if (existingTrait.conflictsWith?.includes(potentialTraitKey) || potentialTrait.conflictsWith?.includes(existingTraitKey)) {
                isCompatible = false;
                break;
            }
        }
        if (isCompatible) {
            finalTraits.add(potentialTraitKey);
        }
        attempts++;
    }
    
    const traits = Array.from(finalTraits);

    return {
        id,
        name,
        archetype,
        traits,
        backstoryKey: `BACKSTORY_${archetype.replace(' ', '')}_${traits[0]}`,
        visualKey: `VISUAL_${archetype.replace(' ', '')}_${traits[1] || traits[0]}`,
        audioKey: `AUDIO_${archetype.replace(' ', '')}_${traits[0]}`,
    };
}

export function generateInitialRosters(): {
    player: GeneratedCharacter;
    educators: GeneratedCharacter[];
    subjects: GeneratedCharacter[];
} {
    const existingIds = new Set<string>();
    
    // Create Player
    const player = generateCharacter(SubjectArchetype.TheCatalyst, existingIds);
    
    // Create Educators
    const educatorArchetypes = [EducatorArchetype.TheSadist, EducatorArchetype.TheManipulator, EducatorArchetype.TheAnalyst, EducatorArchetype.TheOverseer];
    const educators = educatorArchetypes.map(arch => generateCharacter(arch, existingIds));
    
    // Create other Subjects
    const subjectArchetypes = [SubjectArchetype.TheProtector, SubjectArchetype.TheDefiant, SubjectArchetype.TheDefiant]; // Example lore counts
    const subjects = subjectArchetypes.map(arch => generateCharacter(arch, existingIds));

    return { player, educators, subjects };
}
