
import { EducatorArchetype, SubjectArchetype } from '../types';

const ARCHETYPE_NAMES: Record<EducatorArchetype | SubjectArchetype, string[]> = {
    // Educators
    [EducatorArchetype.TheSadist]: ["Selene", "Lysandra", "Petra"],
    [EducatorArchetype.TheManipulator]: ["Lyra", "Calista"],
    [EducatorArchetype.TheAnalyst]: ["Eleni", "Yala"],
    [EducatorArchetype.TheOverseer]: ["Mara", "Aveena"],
    // Subjects
    [SubjectArchetype.TheCatalyst]: ["Jared", "Kael"], // Player has a smaller pool for distinction
    [SubjectArchetype.TheProtector]: ["Darius", "Gavric", "Roric"],
    [SubjectArchetype.TheDefiant]: ["Torin", "Nico", "Eryndor", "Calen"],
};

/**
 * Generates a random name from a list appropriate for the character's archetype.
 * @param archetype - The character's archetype.
 * @returns A randomly selected name.
 */
export const generateName = (archetype: EducatorArchetype | SubjectArchetype): string => {
    const nameList = ARCHETYPE_NAMES[archetype] || [];
    if (nameList.length === 0) return "Nameless";
    return nameList[Math.floor(Math.random() * nameList.length)];
};
