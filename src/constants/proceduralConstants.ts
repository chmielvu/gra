
import { EventTemplate, TraitDefinition, LocationDefinition, TraitKey } from "../types";
import { NarrativeCadence, EducatorArchetype, SubjectArchetype, TraitCategory } from "../types";

export const TRAITS: Record<string, TraitDefinition> = {
    // Core
    INTELLIGENT: { name: "Intelligent", category: TraitCategory.Core, description: "High cognitive ability, quick learner.", synergiesWith: ["OBSERVANT", "CALCULATING"] },
    OBSERVANT: { name: "Observant", category: TraitCategory.Core, description: "Notices details others miss." },
    CALCULATING: { name: "Calculating", category: TraitCategory.Core, description: "Thinks through consequences before acting." },
    IMPULSIVE: { name: "Impulsive", category: TraitCategory.Core, description: "Acts without thinking.", conflictsWith: ["STOIC", "CALCULATING"] },
    STOIC: { name: "Stoic", category: TraitCategory.Core, description: "Endures hardship without showing feeling." },
    RESILIENT: { name: "Resilient", category: TraitCategory.Core, description: "Recovers quickly from adversity." },
    FRAGILE: { name: "Fragile", category: TraitCategory.Core, description: "Easily broken, physically or mentally.", conflictsWith: ["RESILIENT", "STOIC"] },
    // Psychological
    ANXIOUS: { name: "Anxious", category: TraitCategory.Psychological, description: "Prone to worry and nervousness." },
    DEEPLY_GUILTY: { name: "Deeply Guilty", category: TraitCategory.Psychological, description: "Haunted by past actions or perceived failures." },
    NARCISSISTIC: { name: "Narcissistic", category: TraitCategory.Psychological, description: "Excessive self-interest, lack of empathy." },
    SADISTIC: { name: "Sadistic", category: TraitCategory.Psychological, description: "Derives pleasure from others' suffering." },
    MASOCHISTIC: { name: "Masochistic", category: TraitCategory.Psychological, description: "Derives pleasure from own suffering/humiliation." },
    DISSOCIATIVE: { name: "Dissociative", category: TraitCategory.Psychological, description: "Detaches from reality under stress." },
    QUIET_DEFIANCE: { name: "Quiet Defiance", category: TraitCategory.SubjectCoping, description: "Resists not with action, but with unshakable internal resolve." },
    // Educator Methods
    CLINICALLY_DETACHED: { name: "Clinically Detached", category: TraitCategory.EducatorMethod, description: "Views subjects purely as data points." },
    CASUALLY_CRUEL: { name: "Casually Cruel", category: TraitCategory.EducatorMethod, description: "Inflicts pain/humiliation without apparent malice, almost carelessly." },
    SEDUCTIVELY_MOCKING: { name: "Seductively Mocking", category: TraitCategory.EducatorMethod, description: "Uses allure and mockery as tools of control." },
    SUBTLY_KIND: { name: "Subtly Kind", category: TraitCategory.EducatorMethod, description: "Offers small, hidden acts of compassion." },
    INSECURE_BULLY: { name: "Insecure Bully", category: TraitCategory.EducatorMethod, description: "Aggression stems from a need for validation/dominance." },
    ZEALOUS_BELIEVER: { name: "Zealous Believer", category: TraitCategory.EducatorMethod, description: "Truly believes in the Magistra's/Yala's hypothesis." },
    SECRET_DOUBTER: { name: "Secret Doubter", category: TraitCategory.EducatorMethod, description: "Harbors hidden reservations about the Forge's methods." },
    // Subject Coping
    PROTECTIVE_LOYAL: { name: "Protective Loyal", category: TraitCategory.SubjectCoping, description: "Fiercely loyal to and protective of specific others." },
    SEETHING_RESENTMENT: { name: "Seething Resentment", category: TraitCategory.SubjectCoping, description: "Harbors deep anger beneath the surface." },
    SURVIVAL_FOCUSED: { name: "Survival Focused", category: TraitCategory.SubjectCoping, description: "Prioritizes self-preservation above all." },
    SEEKS_MEANING: { name: "Seeks Meaning", category: TraitCategory.SubjectCoping, description: "Tries to find purpose or justification in suffering." },
    LATENT_REBELLIOUSNESS: { name: "Latent Rebelliousness", category: TraitCategory.SubjectCoping, description: "Possesses a hidden desire to resist or escape." },
};

export const LOCATIONS: Record<string, LocationDefinition> = {
    LOC_BOYS_HUTS: { id: "LOC_BOYS_HUTS", name: "Boys' Huts", tags: ["Shelter", "Communal", "Night"], descriptionKey: "LOCDESC_BOYS_HUTS" },
    LOC_OUTDOOR_DINING: { id: "LOC_OUTDOOR_DINING", name: "Outdoor Dining Area", tags: ["Social", "Communal", "Day", "Evening"], descriptionKey: "LOCDESC_OUTDOOR_DINING" },
    LOC_TRAINING_HALL: {id: "LOC_TRAINING_HALL", name: "Training Hall", tags: ["Training", "Public", "Day", "Ritual"], descriptionKey: "LOCDESC_TRAINING_HALL"},
    LOC_MAGISTRA_LAB: {id: "LOC_MAGISTRA_LAB", name: "Magistra's Lab", tags: ["Private", "Medical", "Ritual"], descriptionKey: "LOCDESC_MAGISTRA_LAB"},
};

export const EVENT_TEMPLATES: EventTemplate[] = [
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
        eventTitleKey: "TITLE_INITIATION_RITE",
        possibleChoices: [
            { id: "Choice_Initiation_Glare", choiceTextTemplate: "Meet {Attacker.name}'s icy gaze with defiance.", consequences: [ { target: 'player', statChanges: { subjectAgencyBudget: -25, shamePainAbyssLevel: 15, hopeLevel: -5, traumaLevel: 5 }, updateWorldState: { magistraMood: 'Intrigued' } }] },
            { id: "Choice_Initiation_Submit", choiceTextTemplate: "Lower your eyes, brace for impact.", consequences: [ { target: 'player', statChanges: { subjectAgencyBudget: -10, shamePainAbyssLevel: 25, hopeLevel: -10, traumaLevel: 10, physicalIntegrity: -5 } }] },
            { id: "Choice_Initiation_Plea", choiceTextTemplate: "Please... don't.", consequences: [ { target: 'player', statChanges: { subjectAgencyBudget: -15, shamePainAbyssLevel: 30, hopeLevel: -15, traumaLevel: 8 }, updateWorldState: { magistraMood: 'Impatient' } }] }
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
        eventTitleKey: "TITLE_A_Moment_of_Respite",
        possibleChoices: [
            { id: "Choice_Accept_Care", choiceTextTemplate: "Accept {Healer.name}'s care without question.", consequences: [{ target: 'player', statChanges: { hopeLevel: 10, traumaLevel: -5, physicalIntegrity: 5 } }] },
            { id: "Choice_Question_Motive", choiceTextTemplate: "Ask what she wants in return.", consequences: [{ target: 'player', statChanges: { subjectAgencyBudget: 5, hopeLevel: 5 } }] }
        ]
    },
    {
        id: "Event_Tense_Dinner",
        cadence: NarrativeCadence.Tension,
        locationTags: ["Social"],
        triggerConditions: () => true, // Can happen anytime
        weight: 1,
        roles: {
            "Observer": { archetype: EducatorArchetype.TheSadist },
            "Observed": { mustBePlayer: true },
            "Peer": { archetype: SubjectArchetype.TheDefiant },
        },
        sceneSetupKey: "SETUP_TENSE_DINNER",
        eventTitleKey: "TITLE_Under_Her_Gaze",
        possibleChoices: [
            { id: "Choice_Eat_Quickly", choiceTextTemplate: "Eat quickly and avoid eye contact.", consequences: [{ target: 'player', statChanges: { traumaLevel: 2 } }] },
            { 
                id: "Choice_Stare_Back", 
                choiceTextTemplate: "Meet {Observer.name}'s gaze.", 
                consequences: [
                    { target: 'player', statChanges: { subjectAgencyBudget: 5 }, bondChanges: [{targetRole: 'Observer', change: 1}] },
                    { target: 'player', setMood: { role: 'Observer', mood: 'Amused' } }
                ] 
            },
            { id: "Choice_Talk_To_Peer", choiceTextTemplate: "Try to make small talk with {Peer.name}.", consequences: [{ target: 'player', bondChanges: [{targetRole: 'Peer', change: 2}] }] }
        ]
    },
    {
        id: "Event_Absurd_Task",
        cadence: NarrativeCadence.Humor,
        locationTags: ["Training"],
        triggerConditions: (ledger) => ledger.day > 2,
        weight: 1,
        roles: {
            "Assigner": { archetype: EducatorArchetype.TheAnalyst },
            "Worker": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_ABSURD_TASK",
        eventTitleKey: "TITLE_Pointless_Labor",
        possibleChoices: [
            { id: "Choice_Comply_Silently", choiceTextTemplate: "Perform the pointless task with grim determination.", consequences: [{ target: 'player', statChanges: { subjectAgencyBudget: -2 } }] },
            { id: "Choice_Question_Task", choiceTextTemplate: "Ask about the purpose of this task.", consequences: [{ target: 'player', statChanges: { subjectAgencyBudget: 5, shamePainAbyssLevel: 5 } }] },
        ]
    },
    {
        id: "Event_Rival_Taunt_At_Dinner",
        cadence: NarrativeCadence.Tension,
        locationTags: ["Social", "Evening"],
        triggerConditions: (ledger, player, rosters) => {
            const defiant = rosters.subjects.find(s => s.archetype === SubjectArchetype.TheDefiant);
            const protector = rosters.subjects.find(s => s.archetype === SubjectArchetype.TheProtector);
            return !!defiant && !!protector;
        },
        weight: 2,
        roles: {
            "Taunter": { archetype: SubjectArchetype.TheDefiant },
            "Target": { archetype: SubjectArchetype.TheProtector },
            "PlayerObserver": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_RIVAL_TAUNT",
        eventTitleKey: "TITLE_Dinner_Tensions",
        possibleChoices: [
            {
                id: "Choice_Defend_Target",
                choiceTextTemplate: "Tell {Taunter.name} to back off.",
                consequences: [
                    { target: 'player', statChanges: { subjectAgencyBudget: 5 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Target', change: 3 }, { targetRole: 'Taunter', change: -3 }] }
                ]
            },
            {
                id: "Choice_Side_With_Taunter",
                choiceTextTemplate: "Join in with a mocking comment.",
                consequences: [
                    { target: 'player', statChanges: { hopeLevel: -5, shamePainAbyssLevel: 5 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Target', change: -4 }, { targetRole: 'Taunter', change: 2 }] }
                ]
            },
            {
                id: "Choice_Stay_Silent",
                choiceTextTemplate: "Keep your head down and eat.",
                consequences: [
                    { target: 'player', statChanges: { traumaLevel: 3, hopeLevel: -2 } }
                ]
            }
        ]
    },
    {
        id: "Event_Secret_Alliance_Offer",
        cadence: NarrativeCadence.Comfort,
        locationTags: ["Shelter", "Night"],
        triggerConditions: (ledger, player, rosters) => {
            const protector = rosters.subjects.find(s => s.archetype === SubjectArchetype.TheProtector);
            if (!protector) return false;
            const bondWithProtector = ledger.interpersonalBonds[protector.id] ?? 0;
            return ledger.hopeLevel < 50 && bondWithProtector >= 0;
        },
        weight: 3,
        roles: {
            "Ally": { archetype: SubjectArchetype.TheProtector },
            "Player": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_SECRET_ALLIANCE",
        eventTitleKey: "TITLE_A_Whisper_In_The_Dark",
        possibleChoices: [
            {
                id: "Choice_Accept_Alliance",
                choiceTextTemplate: "Agree. You need to look out for each other.",
                consequences: [
                    { target: 'player', statChanges: { hopeLevel: 15 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Ally', change: 10 }] }
                ]
            },
            {
                id: "Choice_Refuse_Alliance",
                choiceTextTemplate: "Refuse. It's too dangerous to trust anyone.",
                consequences: [
                    { target: 'player', statChanges: { subjectAgencyBudget: 5, hopeLevel: -5 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Ally', change: -5 }] }
                ]
            }
        ]
    },
    {
        id: "Event_Educator_Confrontation",
        cadence: NarrativeCadence.Tension,
        locationTags: ["Training", "Public"],
        triggerConditions: (ledger, player, rosters) => {
            const manipulator = rosters.educators.find(e => e.archetype === EducatorArchetype.TheManipulator);
            const analyst = rosters.educators.find(e => e.archetype === EducatorArchetype.TheAnalyst);
            return !!manipulator && !!analyst;
        },
        weight: 2,
        roles: {
            "Instigator": { archetype: EducatorArchetype.TheManipulator },
            "TargetEducator": { archetype: EducatorArchetype.TheAnalyst },
            "Pawn": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_EDUCATOR_CLASH",
        eventTitleKey: "TITLE_Caught_In_The_Crossfire",
        possibleChoices: [
            {
                id: "Choice_Appeal_To_Instigator",
                choiceTextTemplate: "Try to placate {Instigator.name}.",
                bondCheck: { role: "Instigator", minBond: 1 },
                consequences: [
                    { target: 'player', statChanges: { hopeLevel: -5 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Instigator', change: 2 }, { targetRole: 'TargetEducator', change: -2 }] }
                ]
            },
            {
                id: "Choice_Appeal_To_Target",
                choiceTextTemplate: "Look to {TargetEducator.name} for guidance.",
                bondCheck: { role: "TargetEducator", minBond: 1 },
                consequences: [
                    { target: 'player', statChanges: { subjectAgencyBudget: -5 } },
                    { target: 'player', bondChanges: [{ targetRole: 'Instigator', change: -2 }, { targetRole: 'TargetEducator', change: 2 }] }
                ]
            },
            {
                id: "Choice_Remain_Neutral",
                choiceTextTemplate: "Endure it without taking a side.",
                statCheck: { stat: 'hopeLevel', difficulty: 40, checkType: 'gte' },
                consequences: [
                    { target: 'player', statChanges: { traumaLevel: 10, shamePainAbyssLevel: 5 } }
                ]
            }
        ]
    },
    {
        id: "Event_Training_Endurance",
        cadence: NarrativeCadence.Terror,
        locationTags: ["Training"],
        triggerConditions: (ledger) => ledger.physicalIntegrity > 50,
        weight: 2,
        roles: {
            "Instructor": { archetype: EducatorArchetype.TheSadist },
            "Subject": { mustBePlayer: true },
            "Rival": { archetype: SubjectArchetype.TheDefiant }
        },
        sceneSetupKey: "SETUP_TRAINING_ENDURANCE",
        eventTitleKey: "TITLE_Lesson_In_Pain",
        possibleChoices: [
            {
                id: "Choice_Endure",
                choiceTextTemplate: "Brace and endure the 'lesson'.",
                consequences: [
                    { target: 'player', statChanges: { physicalIntegrity: -15, traumaLevel: 10, hopeLevel: -5 } },
                    { target: 'player', addTrait: 'STOIC' },
                    { target: 'player', updateWorldState: { forgeIntensityLevel: 52, magistraMood: 'Pleased' } }
                ]
            },
            {
                id: "Choice_Resist",
                choiceTextTemplate: "Try to resist the instructor.",
                consequences: [
                    { target: 'player', statChanges: { physicalIntegrity: -25, traumaLevel: 15, subjectAgencyBudget: 10 } },
                    { target: 'player', updateWorldState: { forgeIntensityLevel: 60, magistraMood: 'Angry' } }
                ]
            }
        ]
    },
    {
        id: "Event_Magistra_Inspection",
        cadence: NarrativeCadence.Terror,
        locationTags: ["Public"],
        triggerConditions: (ledger) => ledger.magistraMood === 'Angry' && ledger.day > 3,
        isUnique: false,
        weight: 10, // High weight when conditions met
        roles: {
            "Observer": { archetype: EducatorArchetype.TheSadist },
            "Target": { mustBePlayer: true },
        },
        sceneSetupKey: "SETUP_MAGISTRA_INSPECTION",
        eventTitleKey: "TITLE_The_Unseen_Gaze",
        possibleChoices: [
            { id: "Choice_Inspection_Endure", choiceTextTemplate: "Endure the suffocating scrutiny.", consequences: [{ target: 'player', statChanges: { traumaLevel: 15, subjectAgencyBudget: -10 }, updateWorldState: { magistraMood: 'Impatient' } }] },
            { id: "Choice_Inspection_Defy", choiceTextTemplate: "Meet the unseen gaze with a flicker of defiance.", consequences: [{ target: 'player', statChanges: { traumaLevel: 10, subjectAgencyBudget: 5 }, updateWorldState: { magistraMood: 'Intrigued' } }] },
        ]
    }
];
