// This file is the single source of truth for all application types.

// --- ENUMS & CORE TYPES ---

export enum GamePhase {
  Welcome = 'Welcome',
  Loading = 'Loading',
  Playing = 'Playing',
  Error = 'Error',
}

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

// --- DATA DEFINITIONS ---

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

// --- STATE MANAGEMENT ---

/**
 * The core, persistent state of the game world.
 * This is managed by Zustand and represents the synchronous, client-side state.
 */
export interface GameState {
  playerCharacter: GeneratedCharacter;
  educatorRoster: GeneratedCharacter[];
  subjectRoster: GeneratedCharacter[];
  currentLedger: YandereLedger;
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
 * The creative output from the AI for a single turn.
 * This represents asynchronous "server state" fetched via TanStack Query.
 */
export interface CreativeOutput {
  reasoning: string;
  narrative: string;
  playerChoices: {id: string; text: string}[];
  imagePrompt: { prompt: string; negativePrompt?: string; };
  ttsText: string;
  speaker: string;
  vocalStyle: string;
}

/**
 * Context required to process the *next* turn, including the roles
 * assigned in the current turn.
 */
export interface TurnContext {
    eventId: string;
    cadence: NarrativeCadence;
    assignedRoles: Record<string, GeneratedCharacter>;
}

// --- EVENT & GAME LOGIC ---

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
