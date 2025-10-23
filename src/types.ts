
export enum NarrativeCadence {
    Comfort,       // Scenes of respite, false hope, minor kindness
    Tension,       // The default state. Atmosphere of dread, observation
    Humor,         // Rare scenes of dark, mocking humor
    Terror,        // Direct psychological or physical torment
    Aftermath      // Quiet, reflective scenes following Terror
}

export enum EducatorArchetype {
    TheAnalyst = "The Analyst",
    TheSadist = "The Sadist",
    TheManipulator = "The Manipulator",
    TheOverseer = "The Overseer",
}

export enum SubjectArchetype {
    TheCatalyst = "The Catalyst",
    TheProtector = "The Protector",
    TheDefiant = "The Defiant",
}

export enum TraitCategory { 
    Core = "Core", 
    Social = "Social", 
    Psychological = "Psychological", 
    Combat = "Combat", 
    EducatorMethod = "Educator Method",
    SubjectCoping = "Subject Coping",
}


// These are now generic strings. The strong typing is enforced by the Record<string, ...> definitions
// in proceduralConstants.ts which use these types. This breaks the circular dependency.
export type TraitKey = string;
export type LocationKey = string;

export interface TraitDefinition {
    name: string;
    category: TraitCategory;
    description: string;
    conflictsWith?: TraitKey[];
    synergiesWith?: TraitKey[];
}

export interface LocationDefinition {
    id: string;
    name: string;
    tags: string[];
    descriptionKey: string;
}

export interface GeneratedCharacter {
  id: string; 
  name: string;
  archetype: EducatorArchetype | SubjectArchetype;
  traits: TraitKey[];
  backstoryKey: string;
  visualKey: string;
  audioKey: string;
  currentMood?: string;
  currentGoal?: string;
}

export interface YandereLedger {
  turn: number;
  currentLocationId: LocationKey;
  currentEventId?: string;
  day: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  subjectAgencyBudget: number;
  shamePainAbyssLevel: number;
  traumaLevel: number;
  hopeLevel: number;
  physicalIntegrity: number;
  interpersonalBonds: Record<string, number>;
  forgeIntensityLevel: number;
  magistraMood?: 'Pleased' | 'Impatient' | 'Intrigued' | 'Angry';
  eventHistory: string[];
  narrativeCadence: NarrativeCadence;
}

export interface GameState {
  playerCharacter: GeneratedCharacter;
  educatorRoster: GeneratedCharacter[];
  subjectRoster: GeneratedCharacter[];
  currentLedger: YandereLedger;
  narrative: string;
  playerChoices: {id: string; text: string}[];
  imagePrompt: { prompt: string; negativePrompt?: string; };
  ttsText: string;
  speaker: string;
  ttsVocalStyle: string;
}

export interface EventTemplate {
  id: string;
  cadence: NarrativeCadence | NarrativeCadence[];
  locationTags: string[];
  specificLocations?: LocationKey[];
  triggerConditions: (ledger: YandereLedger, player: GeneratedCharacter, rosters: {educators: GeneratedCharacter[], subjects: GeneratedCharacter[]}) => boolean;
  weight?: number;
  isUnique?: boolean;
  roles: Record<string, {
    archetype?: (EducatorArchetype | SubjectArchetype) | (EducatorArchetype | SubjectArchetype)[];
    requiredTraits?: TraitKey[];
    forbiddenTraits?: TraitKey[];
    mustBePlayer?: boolean;
    relationshipWith?: { role: string; minBond?: number; maxBond?: number; };
  }>;
  sceneSetupKey: string;
  eventTitleKey?: string;
  possibleChoices: EventChoice[];
  followUpEvents?: { eventId: string; probability: number; delay?: number; }[];
}

export interface EventChoice {
  id: string;
  choiceTextTemplate: string;
  statCheck?: { stat: keyof Pick<YandereLedger, 'subjectAgencyBudget' | 'hopeLevel' | 'traumaLevel' | 'physicalIntegrity'>; difficulty: number; checkType: 'gte' | 'lte' };
  traitCheck?: { trait: TraitKey; required: boolean };
  bondCheck?: { role: string; minBond?: number; maxBond?: number };
  consequences: EventConsequence[];
}

export interface EventConsequence {
  target: 'player' | string;
  statChanges?: Partial<Omit<YandereLedger, 'turn' | 'currentLocationId' | 'currentEventId' | 'day' | 'timeOfDay' | 'interpersonalBonds' | 'eventHistory' | 'narrativeCadence'>>;
  bondChanges?: { targetRole: string; change: number }[];
  addTrait?: TraitKey;
  removeTrait?: TraitKey;
  setMood?: { role: string; mood: string };
  setGoal?: { role: string; goal: string };
  forceFollowUpEventId?: string;
  changeLocation?: LocationKey;
  updateWorldState?: Partial<Pick<YandereLedger, 'forgeIntensityLevel' | 'magistraMood'>>;
}
