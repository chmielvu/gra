
export interface CoreYandereMatrix {
  obsessionsAndDecayVortices: {
    character: string;
    archetype: string;
    obsession: string;
    decayVortex: string;
  }[];
}

export interface MandatedYandereJests {
  rules: {
    ruleId: string;
    description: string;
  }[];
}

export interface GoYJNode {
  nodeId: string;
  psychologicalState: string;
  isArcShiftNode: boolean;
}

export interface GoYJEdge {
  fromNode: string;
  toNode: string;
  yandereInversion: number;
  agencyToll: number;
  terrainModifier: number;
  // --- v5.0 Expansion ---
  edgeType?: 'standard' | 'falseHope' | 'traumaBond' | 'symbolicDefiance';
}

// FIX: Added missing interface definition for the story graph structure.
export interface GraphOfYandereJests {
  nodes: GoYJNode[];
  edges: GoYJEdge[];
}

export interface YandereLedger {
  currentNodeId: string;
  subjectAgencyBudget: number;
  activeArchetypeRoster: { character: string; archetype: string }[];
  shamePainAbyssLevel: number;
  emergentCharacterPool: {
    character: string;
    archetype: string;
    obsession: string;
    decayVortex: string;
  }[];
  // --- v5.0 Expansion ---
  traumaLevel: number;
  hopeLevel: number;
  physicalIntegrity: number;
  interpersonalBonds: { [characterName: string]: number };
}

export interface GameState {
  turn: number;
  coreYandereMatrix: CoreYandereMatrix;
  mandatedYandereJests: MandatedYandereJests;
  graphOfYandereJests: GraphOfYandereJests;
  yandereLedger: YandereLedger;
  narrative: string;
  playerChoices: string[];
  // New fields for multi-sensory output
  imageUrl: string;
  ttsAudioBase64: string;
  speaker: string;
}
