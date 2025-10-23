
import { TRAITS } from 'src/constants/gameData';
import { GeneratedCharacter, TraitKey, EducatorArchetype, SubjectArchetype } from 'src/types/index';

const ARCHETYPE_NAMES: Record<EducatorArchetype | SubjectArchetype, string[]> = {
    [EducatorArchetype.TheSadist]: ["Selene", "Lysandra"],
    [EducatorArchetype.TheManipulator]: ["Lyra", "Calista"],
    [EducatorArchetype.TheAnalyst]: ["Eleni", "Yala"],
    [EducatorArchetype.TheOverseer]: ["Mara", "Aveena"],
    [SubjectArchetype.TheCatalyst]: ["Jared", "Kael"],
    [SubjectArchetype.TheProtector]: ["Gavric", "Roric"],
    [SubjectArchetype.TheDefiant]: ["Torin", "Eryndor"],
};

const CORE_TRAITS_BY_ARCHETYPE: Partial<Record<EducatorArchetype | SubjectArchetype, TraitKey[]>> = {
    [EducatorArchetype.TheSadist]: ['SADISTIC', 'SEDUCTIVELY_MOCKING'],
    [EducatorArchetype.TheManipulator]: ['INTELLIGENT', 'SUBTLY_KIND'],
    [EducatorArchetype.TheAnalyst]: ['CLINICALLY_DETACHED', 'OBSERVANT'],
    [EducatorArchetype.TheOverseer]: ['OBSERVANT', 'SECRET_DOUBTER'],
    [SubjectArchetype.TheCatalyst]: ['RESILIENT', 'OBSERVANT'],
    [SubjectArchetype.TheProtector]: ['PROTECTIVE_LOYAL', 'STOIC'],
    [SubjectArchetype.TheDefiant]: ['IMPULSIVE', 'LATENT_REBELLIOUSNESS'],
};

const MOODS_BY_ARCHETYPE: Partial<Record<EducatorArchetype | SubjectArchetype, string[]>> = {
    [EducatorArchetype.TheSadist]: ['Arrogant', 'Contemptuous', 'Amused'],
    [EducatorArchetype.TheManipulator]: ['Charming', 'Faux-Concerned', 'Calculating'],
    [EducatorArchetype.TheAnalyst]: ['Detached', 'Impatient', 'Curious'],
    [EducatorArchetype.TheOverseer]: ['Weary', 'Vigilant', 'Resigned'],
    [SubjectArchetype.TheCatalyst]: ['Wary', 'Hopeful', 'Afraid'],
    [SubjectArchetype.TheProtector]: ['Protective', 'Grim', 'Determined'],
    [SubjectArchetype.TheDefiant]: ['Angry', 'Sullen', 'Scornful'],
};

const generateName = (archetype: EducatorArchetype | SubjectArchetype): string => {
    const nameList = ARCHETYPE_NAMES[archetype] || [];
    if (nameList.length === 0) return "Nameless";
    return nameList[Math.floor(Math.random() * nameList.length)];
};

function generateCharacter(
    archetype: EducatorArchetype | SubjectArchetype,
    existingIds: Set<string>
): GeneratedCharacter {
    let name: string;
    let id: string;
    
    do {
        name = generateName(archetype);
        id = `${archetype.replace(/ /g, '_')}_${name}`;
    } while (existingIds.has(id));
    existingIds.add(id);

    const coreTraits = CORE_TRAITS_BY_ARCHETYPE[archetype] || [];
    const traits = [...new Set(coreTraits)];
    
    const possibleMoods = MOODS_BY_ARCHETYPE[archetype] || ['Neutral'];
    const currentMood = possibleMoods[Math.floor(Math.random() * possibleMoods.length)];

    return {
        id,
        name,
        archetype,
        traits,
        currentMood,
        backstoryKey: `BACKSTORY_${id}`,
        visualKey: `VISUAL_${id}`,
        audioKey: `AUDIO_${id}`,
    };
}

export function generateInitialRosters(): {
    player: GeneratedCharacter;
    educators: GeneratedCharacter[];
    subjects: GeneratedCharacter[];
} {
    const existingIds = new Set<string>();
    
    const player = generateCharacter(SubjectArchetype.TheCatalyst, existingIds);
    
    const educatorArchetypes = [EducatorArchetype.TheSadist, EducatorArchetype.TheManipulator, EducatorArchetype.TheAnalyst, EducatorArchetype.TheOverseer];
    const educators = educatorArchetypes.map(arch => generateCharacter(arch, existingIds));
    
    const subjectArchetypes = [SubjectArchetype.TheProtector, SubjectArchetype.TheDefiant];
    const subjects = subjectArchetypes.map(arch => generateCharacter(arch, existingIds));

    return { player, educators, subjects };
}