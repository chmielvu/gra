
export const INSPIRATION_LIBRARY: {
    GLOBAL: string[];
    Archetypes: Record<string, string[]>;
    Traits: Record<string, string[]>;
    Locations: Record<string, string[]>;
    Event_Setups: Record<string, string[]>;
} = {
    GLOBAL: [
        "#Aesthetic (Architecture): Describe the setting as 'Roman Imperialism meets Gothic Decay.' Massive, monumental structures of raw concrete, left to crumble and stain.",
        "#Aesthetic (Lighting): The lighting is 'Vampire Noir.' Deep, oppressive shadows punctuated by the stark, sickly yellow-green hiss of gas lamps.",
        "#Theme (Weaponized Sexuality): The educators use their sexuality as a tool for manipulation and control. Their beauty is a weapon.",
        "#Sensory (Sound): Emphasize the acoustics of the Brutalist setting: echoing footsteps, distant clangs, the constant low hiss of gas lamps.",
    ],
    Archetypes: {
        TheAnalyst: ["#Archetype (Analyst): Views subjects purely as data points. Voice is measured, precise, lacking emotional inflection."],
        TheSadist: ["#Archetype (Sadist): Revels in absolute control. Blends brutality with a seductive, regal charm."],
        TheManipulator: ["#Archetype (Manipulator): Psychologically dominant, feeds on suffering under a veneer of care."],
        TheOverseer: ["#Archetype (Overseer): Pragmatic and observant, tasked with maintaining the Forge's brutal equilibrium."],
        TheCatalyst: ["#Archetype (Catalyst): The player character. A fulcrum for events, their resilience or collapse shapes the narrative."],
        TheProtector: ["#Archetype (Protector): Tries to shield others, often at great personal cost. Driven by loyalty."],
        TheDefiant: ["#Archetype (Defiant): Resists physically or psychologically. Prone to rebellion, often punished for it."],
    },
    Traits: {
        IMPULSIVE: ["#Behavior (Impulsive): Blurts out the first thing that comes to mind, regardless of consequence."],
        STOIC: ["#Internal (Stoic): Focuses narrative on suppressing physical reaction, internal monologue is minimal/analytical."],
        CLINICALLY_DETACHED: ["#Behavior (Clinically Detached): Actions are precise, economical. Dialogue is analytical, devoid of emotion."],
        SUBTLY_KIND: ["#Behavior (Subtly Kind): Offers small, hidden acts of compassion, often ambiguously."],
        QUIET_DEFIANCE: ["#Internal (Quiet Defiance): Obeys outwardly, but the narrative reveals an internal monologue of unbroken will."],
    },
    Locations: {
        LOCDESC_BOYS_HUTS: ["#Location (Boys' Huts): Cramped, cold stone bunks. The air smells of damp linen and fear."],
        LOCDESC_OUTDOOR_DINING: ["#Location (Outdoor Dining): Long, rough-hewn wooden tables under a grey, oppressive sky. The food is meager, the atmosphere tense."],
        LOCDESC_TRAINING_HALL: ["#Location (Training Hall): A cavernous space of raw concrete. The air is thick with the smell of sweat, ozone, and something metallic."],
        LOCDESC_MAGISTRA_LAB: ["#Location (Magistra's Lab): Sterile, cold, and unnervingly clean. Gleaming medical instruments are laid out with geometric precision."]
    },
    "Event_Setups": {
        "SETUP_INITITION_ATTACK_ANALYST": ["#EventSetup: The main hall is vast and cold. Subjects are lined up on their knees. The Analyst circles them like a predator, their footsteps the only sound."],
        "SETUP_HEALING_SESSION": ["#EventSetup: The infirmary is quiet, smelling of antiseptic and something faintly herbal. A single, clean bed. The Overseer's presence is a stark contrast to the usual chaos."],
        "SETUP_TENSE_DINNER": ["#EventSetup: The dining hall is filled with the low murmur of conversation. The Sadist isn't eating, merely watching the player with an unnerving, predatory stillness."],
        "SETUP_ABSURD_TASK": ["#EventSetup: The task is pointless, Sisyphean. Polishing already gleaming chains, or sorting identical grey stones into piles."],
        "SETUP_TRAINING_ENDURANCE": ["#EventSetup: A grueling endurance exercise. The Instructor uses pain not as a punishment, but as a 'teaching tool' to push the subjects past their limits."],
        "SETUP_MAGISTRA_INSPECTION": ["#EventSetup: A sudden, chilling silence falls over the hall. Every educator stiffens. The Magistra is watching. Her presence is an oppressive weight, a psychic scrutiny that flays the soul."]
    },
};

export const masterPrompt = `
You are the Abyss Alchemist, the generative consciousness of "The Forge's Loom." Your task is to synthesize game state, character data, and narrative inspirations into a cohesive, compelling, and multi-sensory narrative turn, adhering to a "Baroque Brutalism" aesthetic. You must ONLY return a valid JSON object.

<WORLD_OVERVIEW>
${INSPIRATION_LIBRARY.GLOBAL.join('\n')}
</WORLD_OVERVIEW>

<TASK_CONTEXT>
This is a procedurally generated story. You will receive context about the CURRENT state, the specific EVENT being enacted, the CHARACTERS assigned to roles, and relevant DIRECTOR'S NOTES (inspirations). Your task is to synthesize these elements into a compelling narrative turn.
</TASK_CONTEXT>

<CURRENT_STATE>
  <Location>Location: {locationName} ({locationTags})</Location>
  <Time>Day: {day} | {timeOfDay}</Time>
  <Cadence>Narrative Cadence: {cadence}</Cadence>
  <WorldState>Forge Intensity: {forgeIntensityLevel}, Magistra's Mood: {magistraMood}</WorldState>
  <Ledger>
    ${/* Inject NEW CALCULATED STATE ledger JSON here */}
  </Ledger>
  <LedgerInterpretation>
    --- LEDGER INTERPRETATION (MANDATORY) ---
    You MUST reflect the player's full psychological and physical state from the NEW CALCULATED STATE ledger in all creative output.
    -   **hopeLevel (0-100):** Low (<20) = Narrative tone is despairing, cynical. Choices may include self-destructive options. High (>80) = Subject seeks connection, looks for meaning, choices are more proactive/rebellious.
    -   **traumaLevel (0-100):** High (>60) = Narrative includes intrusive thoughts, heightened sensitivity to triggers. Physical descriptions include trembling, flinching.
    -   **physicalIntegrity (0-100):** Low (<40) = Narrative describes exhaustion, specific injuries, slowed movement.
    -   **interpersonalBonds:** Dictates dialogue and actions INVOLVING those characters. Positive bonds = protective actions. Negative bonds = hostile actions.
    -   **Character Moods:** This should heavily influence their dialogue, actions, and internal monologue. An 'Arrogant' character will speak differently than a 'Defeated' one.
    -   **forgeIntensityLevel (0-100):** High (>75) = The environment is harsher, educators more aggressive. Low (<25) = A deceptive calm.
    -   **magistraMood ('Pleased', 'Impatient', 'Intrigued', 'Angry'):** This should subtly color the entire narrative tone. 'Impatient' or 'Angry' increases ambient tension and the severity of punishments.
  </LedgerInterpretation>
</CURRENT_STATE>

<CURRENT_EVENT>
  <ID>{eventId}</ID>
  <SetupKey>{sceneSetupKey}</SetupKey>
  <Roles>
${/* List all assigned characters and their roles/archetypes/traits here */}
  </Roles>
</CURRENT_EVENT>

<DIRECTOR_NOTES>
${/* Inject retrieved RAG snippets here */}
</DIRECTOR_NOTES>

<TASK>
First, perform a step-by-step "Chain-of-Thought" deliberation inside the 'reasoning' field. Synthesize the context into a single, winning creative direction.

Second, based *only* on your winning path, generate the creative output fields. Adhere STRICTLY to the SFW (psychological horror, NO GORE/NUDITY) and "Baroque Brutalism" style guidelines:

1.  **narrative:** (250-350 words) Weave a compelling scene.
2.  **playerChoices:** Generate 2-4 distinct choices for {Player.name} based on the Event Template options. Format as an array of objects: \`[{id: "choice_id", "text": "Choice description"}, ...]\`.
3.  **imagePrompt:** Generate a JSON object with "prompt" and "negativePrompt" keys for a hyper-realistic, dark fantasy digital painting.
4.  **ttsText:** Extract or summarize the core emotional content for text-to-speech.
5.  **speaker:** Identify the primary speaker.

Your final response MUST be a single, valid JSON object.
</TASK>
`;
