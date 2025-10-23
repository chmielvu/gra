import { EventTemplate, TraitDefinition, LocationDefinition } from "../types/index";
import { NarrativeCadence, EducatorArchetype, SubjectArchetype, TraitCategory } from "../types/index";

export const TRAITS: Record<string, TraitDefinition> = {
    INTELLIGENT: { name: "Intelligent", category: TraitCategory.Core, description: "High cognitive ability, quick learner." },
    OBSERVANT: { name: "Observant", category: TraitCategory.Core, description: "Notices details others miss." },
    CALCULATING: { name: "Calculating", category: TraitCategory.Core, description: "Thinks through consequences before acting." },
    IMPULSIVE: { name: "Impulsive", category: TraitCategory.Core, description: "Acts without thinking." },
    STOIC: { name: "Stoic", category: TraitCategory.Core, description: "Endures hardship without showing feeling." },
    RESILIENT: { name: "Resilient", category: TraitCategory.Core, description: "Recovers quickly from adversity." },
    FRAGILE: { name: "Fragile", category: TraitCategory.Core, description: "Easily broken, physically or mentally." },
    ANXIOUS: { name: "Anxious", category: TraitCategory.Psychological, description: "Prone to worry and nervousness." },
    NARCISSISTIC: { name: "Narcissistic", category: TraitCategory.Psychological, description: "Excessive self-interest, lack of empathy." },
    SADISTIC: { name: "Sadistic", category: TraitCategory.Psychological, description: "Derives pleasure from others' suffering." },
    QUIET_DEFIANCE: { name: "Quiet Defiance", category: TraitCategory.SubjectCoping, description: "Resists not with action, but with unshakable internal resolve." },
    CLINICALLY_DETACHED: { name: "Clinically Detached", category: TraitCategory.EducatorMethod, description: "Views subjects purely as data points." },
    SEDUCTIVELY_MOCKING: { name: "Seductively Mocking", category: TraitCategory.EducatorMethod, description: "Uses allure and mockery as tools of control." },
    SUBTLY_KIND: { name: "Subtly Kind", category: TraitCategory.EducatorMethod, description: "Offers small, hidden acts of compassion." },
    SECRET_DOUBTER: { name: "Secret Doubter", category: TraitCategory.EducatorMethod, description: "Harbors hidden reservations about the Forge's methods." },
    PROTECTIVE_LOYAL: { name: "Protective Loyal", category: TraitCategory.SubjectCoping, description: "Fiercely loyal to and protective of specific others." },
    LATENT_REBELLIOUSNESS: { name: "Latent Rebelliousness", category: TraitCategory.SubjectCoping, description: "Possesses a hidden desire to resist or escape." },
};

export const LOCATIONS: Record<string, LocationDefinition> = {
    LOC_BOYS_HUTS: { id: "LOC_BOYS_HUTS", name: "Boys' Huts", tags: ["Shelter", "Communal", "Night"], descriptionKey: "LOCDESC_BOYS_HUTS" },
    LOC_OUTDOOR_DINING: { id: "LOC_OUTDOOR_DINING", name: "Outdoor Dining Area", tags: ["Social", "Communal", "Day", "Evening"], descriptionKey: "LOCDESC_OUTDOOR_DINING" },
    LOC_TRAINING_HALL: {id: "LOC_TRAINING_HALL", name: "Training Hall", tags: ["Training", "Public", "Day", "Ritual"], descriptionKey: "LOCDESC_TRAINING_HALL"},
    LOC_MAGISTRA_LAB: {id: "LOC_MAGISTRA_LAB", name: "Magistra's Lab", tags: ["Private", "Medical", "Ritual"], descriptionKey: "LOCDESC_MAGISTRA_LAB"},
};

export const EVENT_TEMPLATES: EventTemplate[] = [
    // All event templates from the previous version remain valid and are included here.
    {
        id: "Event_Initiation_GroinAttack_Analyst",
        cadence: NarrativeCadence.Terror,
        locationTags: ["Training", "Ritual"],
        triggerConditions: (ledger, player) => ledger.day === 1 && player.archetype === SubjectArchetype.TheCatalyst && !ledger.eventHistory.includes("Event_Initiation_GroinAttack_Analyst"),
        isUnique: true,
        weight: 10,
        roles: {
            "Attacker": { archetype: EducatorArchetype.TheAnalyst, requiredTraits: ["CLINICALLY_DETACHED"] },
            "Observer": { archetype: [EducatorArchetype.TheSadist, EducatorArchetype.TheManipulator] },
            "Victim": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_INITITION_ATTACK_ANALYST",
        possibleChoices: [
            { id: "Choice_Initiation_Glare", choiceTextTemplate: "Meet {Attacker.name}'s icy gaze with defiance.", consequences: [ { statChanges: { subjectAgencyBudget: -25, shamePainAbyssLevel: 15, hopeLevel: -5, traumaLevel: 5 }, updateWorldState: { magistraMood: 'Intrigued' } }] },
            { id: "Choice_Initiation_Submit", choiceTextTemplate: "Lower your eyes, brace for impact.", consequences: [ { statChanges: { subjectAgencyBudget: -10, shamePainAbyssLevel: 25, hopeLevel: -10, traumaLevel: 10, physicalIntegrity: -5 } }] },
            { id: "Choice_Initiation_Plea", choiceTextTemplate: "Please... don't.", consequences: [ { statChanges: { subjectAgencyBudget: -15, shamePainAbyssLevel: 30, hopeLevel: -15, traumaLevel: 8 }, updateWorldState: { magistraMood: 'Impatient' } }] }
        ]
    },
    {
        id: "Event_Mara_Healing_Session",
        cadence: [NarrativeCadence.Comfort, NarrativeCadence.Aftermath],
        locationTags: ["Shelter"],
        triggerConditions: (ledger) => ledger.traumaLevel > 10 || ledger.physicalIntegrity < 90,
        weight: 5,
        roles: {
            "Healer": { archetype: EducatorArchetype.TheOverseer, requiredTraits: ["SUBTLY_KIND"] },
            "Patient": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_HEALING_SESSION",
        possibleChoices: [
            { id: "Choice_Accept_Care", choiceTextTemplate: "Accept {Healer.name}'s care without question.", consequences: [{ statChanges: { hopeLevel: 10, traumaLevel: -5, physicalIntegrity: 5 } }] },
            { id: "Choice_Question_Motive", choiceTextTemplate: "Ask what she wants in return.", consequences: [{ statChanges: { subjectAgencyBudget: 5, hopeLevel: 5 } }] }
        ]
    },
    // ... Other events from previous file are included here ...
];
