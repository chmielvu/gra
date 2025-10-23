
export enum NarrativeCadence {
    Comfort,
    Tension,
    Humor,
    Terror,
    Aftermath
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
    Psychological = "Psychological", 
    EducatorMethod = "Educator Method",
    SubjectCoping = "Subject Coping",
}

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
  currentMood: string;
  backstoryKey: string;
  visualKey: string;
  audioKey: string;
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
  magistraMood: 'Pleased' | 'Impatient' | 'Intrigued' | 'Angry' | 'Neutral';
  eventHistory: string[];
  narrativeCadence: NarrativeCadence;
}

/**
 * The core, persistent state of the game world.
 */
export interface GameState {
  playerCharacter: GeneratedCharacter;
  educatorRoster: GeneratedCharacter[];
  subjectRoster: GeneratedCharacter[];
  currentLedger: YandereLedger;
}

/**
 * The creative output from the AI for a single turn.
 */
export interface CreativeOutput {
  reasoning: string;
  narrative: string;
  playerChoices: {id: string; text: string}[];
  imagePrompt: { prompt: string; negativePrompt?: string; };
  ttsText: string;
  speaker: string;
}

/**
 * Context required to process the *next* turn, including the roles
 * assigned in the current turn. This eliminates the need for type hacks.
 */
export interface TurnContext {
    eventId: string;
    cadence: NarrativeCadence;
    assignedRoles: Record<string, GeneratedCharacter>;
    vocalStyle: string;
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
  }>;
  sceneSetupKey: string;
  eventTitleKey?: string;
  possibleChoices: EventChoice[];
}

export interface EventChoice {
  id: string;
  choiceTextTemplate: string;
  consequences: EventConsequence[];
}

export interface EventConsequence {
  statChanges?: Partial<Omit<YandereLedger, 'turn' | 'currentLocationId' | 'currentEventId' | 'day' | 'timeOfDay' | 'interpersonalBonds' | 'eventHistory' | 'narrativeCadence'>>;
  bondChanges?: { targetRole: string; change: number }[];
  addTrait?: TraitKey;
  removeTrait?: TraitKey;
  setMood?: { role: string; mood: string };
  changeLocation?: LocationKey;
  updateWorldState?: Partial<Pick<YandereLedger, 'forgeIntensityLevel' | 'magistraMood'>>;
}
