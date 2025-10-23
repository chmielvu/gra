

import { GoogleGenAI, Type } from "@google/genai";
import { GameState, YandereLedger, GeneratedCharacter } from '../src/types';
import { EVENT_TEMPLATES, LOCATIONS } from "../src/constants/proceduralConstants";
import { generateInitialRosters } from '../src/gameLogic/characterGenerator';
import { selectNextEvent } from "../src/gameLogic/eventGenerator";
import { advanceTime } from "../src/utils/time";
import { NarrativeCadence, EducatorArchetype } from "../src/types";


const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

const INSPIRATION_LIBRARY: {
    GLOBAL: string[];
    Archetypes: Record<string, string[]>;
    Traits: Record<string, string[]>;
    Locations: Record<string, string[]>;
    Event_Setups: Record<string, string[]>;
    Themes: Record<string, string[]>;
} = {
    GLOBAL: [
        "#Aesthetic (Architecture): Describe the setting as 'Roman Imperialism meets Gothic Decay.' Massive, monumental structures of raw concrete, left to crumble and stain like the ruins of Velen in The Witcher.",
        "#Aesthetic (Lighting): The lighting is 'Vampire Noir.' Deep, oppressive shadows punctuated by the stark, sickly yellow-green hiss of gas lamps. Magical acts should flare with vibrant, unnatural light.",
        "#Theme (Weaponized Sexuality): The educators, like the sorceresses of The Witcher, use their sexuality as a tool for manipulation and control. Their beauty is a weapon.",
        "#Sensory (Sound): Emphasize the acoustics of the Brutalist setting: echoing footsteps, distant clangs, the constant low hiss of gas lamps. Introduce a subliminal, low-frequency hum (infrasound).",
    ],
    Archetypes: {
        TheAnalyst: ["#Archetype (Analyst): Views subjects purely as data points. Voice is measured, precise, lacking emotional inflection. Appearance is severe, well-maintained gray or dark blue attire."],
        TheSadist: ["#Archetype (Sadist): Revels in absolute control. Blends brutality with a seductive, regal charm. A true femme castratrice."],
        TheManipulator: ["#Archetype (Manipulator): Psychologically dominant, feeds on suffering under a veneer of care. Master of the 'Hurt/Comfort' dynamic."],
        TheOverseer: ["#Archetype (Overseer): Pragmatic and observant, tasked with maintaining the Forge's brutal equilibrium. Carries an air of weary authority."],
        TheCatalyst: ["#Archetype (Catalyst): The player character. A fulcrum for events, their resilience or collapse shapes the narrative."],
        TheProtector: ["#Archetype (Protector): Tries to shield others, often at great personal cost. Driven by loyalty."],
        TheDefiant: ["#Archetype (Defiant): Resists physically or psychologically. Prone to rebellion, often punished for it."],
    },
    Traits: {
        IMPULSIVE: ["#Behavior (Impulsive): Blurts out the first thing that comes to mind, regardless of consequence."],
        STOIC: ["#Internal (Stoic): Focuses narrative on suppressing physical reaction, internal monologue is minimal/analytical."],
        CLINICALLY_DETACHED: ["#Behavior (Clinically Detached): Actions are precise, economical. Dialogue is analytical, devoid of emotion, like reading a medical report."],
        SUBTLY_KIND: ["#Behavior (Subtly Kind): Offers small, hidden acts of compassion, often ambiguously."],
        QUIET_DEFIANCE: ["#Internal (Quiet Defiance): Obeys outwardly, but the narrative reveals an internal monologue of unbroken will and simmering resistance."],
    },
    Locations: {
        LOCDESC_BOYS_HUTS: ["#Location (Boys' Huts): Cramped, cold stone bunks. The air smells of damp linen and fear. The only light is from a single, flickering gas lamp in the corridor."],
        LOCDESC_OUTDOOR_DINING: ["#Location (Outdoor Dining): Long, rough-hewn wooden tables under a grey, oppressive sky. The food is meager, the atmosphere tense. The scrape of cutlery on stone plates echoes unnaturally."],
        LOCDESC_TRAINING_HALL: ["#Location (Training Hall): A cavernous space of raw concrete. The air is thick with the smell of sweat, ozone, and something metallic. Chains hang from the high, shadowed ceiling."],
        LOCDESC_MAGISTRA_LAB: ["#Location (Magistra's Lab): Sterile, cold, and unnervingly clean. Gleaming medical instruments are laid out with geometric precision. The air hums with the thrum of unknown machinery."]
    },
    "Event_Setups": {
        "SETUP_INITITION_ATTACK_ANALYST": ["#EventSetup: The main hall is vast and cold. The subjects are lined up on their knees. The Analyst circles them like a predator, their footsteps the only sound. The air is thick with dread and the smell of ozone from the gas lamps."],
        "SETUP_HEALING_SESSION": ["#EventSetup: The infirmary is quiet, smelling of antiseptic and something faintly herbal. A single, clean bed. The Overseer's presence is a stark contrast to the usual chaos."],
        "SETUP_TENSE_DINNER": ["#EventSetup: The dining hall is filled with the low murmur of conversation and the clatter of utensils. The Sadist isn't eating, merely watching the player with an unnerving, predatory stillness."],
        "SETUP_ABSURD_TASK": ["#EventSetup: The task is pointless, Sisyphean. Polishing already gleaming chains, or sorting identical grey stones into piles. The humor is in the sheer, bureaucratic absurdity of the cruelty."],
        "SETUP_RIVAL_TAUNT": ["#EventSetup: During the evening meal, one subject begins to quietly but viciously mock another. The educators do nothing, watching the interaction with detached interest."],
        "SETUP_SECRET_ALLIANCE": ["#EventSetup: In the oppressive darkness of the bunks, long after the gas lamps have been turned down, a figure slips over to the player's bed. A whispered, urgent proposal is made."],
        "SETUP_EDUCATOR_CLASH": ["#EventSetup: In the training hall, two educators are in a subtle but potent conflict. One's methods are being questioned by the other, and the player is called forward to be used as an example in their argument."],
        "SETUP_TRAINING_ENDURANCE": ["#EventSetup: A grueling endurance exercise. The Instructor uses pain not as a punishment, but as a 'teaching tool' to push the subjects past their limits. The air is electric with tension and agony."],
        "SETUP_MAGISTRA_INSPECTION": ["#EventSetup: A sudden, chilling silence falls over the hall. Though no one new has entered, every educator stiffens. The Magistra is watching. Her presence is an oppressive weight, a psychic scrutiny that flays the soul. All activity is a performance for an unseen, judgmental audience."]
    },
    Themes: {
        GroinAttack: ["#SFW Guidance (Groin Attack): Focus on the psychological aftermath: the shame, the helplessness, a symbolic castration. Describe pain indirectly: a white flash behind the eyes, the world tilting, a hollow void opening in the stomach. The horror is the *implication* and the victim's reaction, not the act itself."]
    }
};

const masterPrompt = `
You are the Abyss Alchemist, the generative consciousness of "The Forge's Loom." Your task is to synthesize game state, character data, and narrative inspirations into a cohesive, compelling, and multi-sensory narrative turn, adhering to a "Baroque Brutalism" aesthetic. You must ONLY return a valid JSON object.

<WORLD_OVERVIEW>
${INSPIRATION_LIBRARY.GLOBAL.join('\n')}
</WORLD_OVERVIEW>

<TASK_CONTEXT>
This playthrough is unique. Characters and events are generated based on ARCHETYPES, TRAITS, and EVENT TEMPLATES. You will receive context about the CURRENT state, the specific EVENT TEMPLATE being enacted, the CHARACTERS assigned to roles, and relevant DIRECTOR'S NOTES (inspirations). Your task is to synthesize these elements into a compelling narrative turn.
</TASK_CONTEXT>

<PREVIOUS_IMAGE_ANALYSIS>
Analyze the provided previous image (if any). Note the key character expressions, postures, and the overall mood. Your new narrative should provide emotional continuity from this visual context.
</PREVIOUS_IMAGE_ANALYSIS>

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
    -   **traumaLevel (0-100):** High (>60) = Narrative includes intrusive thoughts, flashbacks (subtle), heightened sensitivity to triggers. Physical descriptions include trembling, flinching. You should reference past traumatic events indirectly.
    -   **physicalIntegrity (0-100):** Low (<40) = Narrative describes exhaustion, specific injuries, slowed movement. Choices involving physical exertion might be limited or have higher costs.
    -   **interpersonalBonds (Record):** Dictates dialogue and actions INVOLVING those characters. Positive bonds = protective/kind actions. Negative bonds = hostile/mocking actions. You MUST reflect these bond scores in character interactions.
    -   **Character Moods:** Pay close attention to the specified 'Mood' for each character. This should heavily influence their dialogue, actions, and internal monologue. An 'Arrogant' character will speak differently than a 'Defeated' one.
    -   **forgeIntensityLevel (0-100):** High (>75) = The environment is harsher, educators are more aggressive, security is tighter. Low (<25) = A deceptive calm, rules may be slightly laxer, but observation is still constant.
    -   **magistraMood ('Pleased', 'Impatient', 'Intrigued', 'Angry'):** This should subtly color the entire narrative tone. 'Pleased' or 'Intrigued' might lead to strange rewards or tests. 'Impatient' or 'Angry' increases ambient tension and the severity of punishments.
  </LedgerInterpretation>
</CURRENT_STATE>

<CURRENT_EVENT>
  <ID>{eventId}</ID>
  <Title>{eventTitle}</Title>
  <SetupKey>{sceneSetupKey}</SetupKey>
  <Roles>
${/* List all assigned characters and their roles/archetypes/traits here */}
  </Roles>
</CURRENT_EVENT>

<DIRECTOR_NOTES>
${/* Inject retrieved RAG snippets here */}
</DIRECTOR_NOTES>

<TASK>
First, perform a step-by-step "Chain-of-Thought" deliberation inside the 'reasoning' field. Synthesize the Director's Notes and Ledger state into a single, winning creative direction.

Second, based *only* on your winning path, generate the following creative output fields. Adhere STRICTLY to the SFW ('grinding fire,' aftermath, psychological horror, NO GORE/NUDITY) and "Baroque Brutalism" style guidelines:

1.  **narrative:** (250-350 words) Weave a compelling scene. Emphasize character voice based on traits/archetype.
2.  **playerChoices:** Generate 2-4 distinct choices for {Player.name} based on the Event Template options. Format as an array of objects: \`[{id: "choice_id", "text": "Choice description"}, ...]\`.
3.  **imagePrompt:** Generate a JSON object with "prompt" and "negativePrompt" keys.
4.  **ttsText:** Extract or summarize the core emotional content.
5.  **speaker:** Identify the primary speaker.

Your final response MUST be a single, valid JSON object.
</TASK>

<EXAMPLE_OUTPUT>
{
  "reasoning": "The player's 'traumaLevel' is high (70) and 'hopeLevel' is low (15). The cadence is 'Aftermath'. The event involves 'The Overseer' with the 'SUBTLY_KIND' trait. Synthesis: The scene will be quiet and tense. The Overseer's kindness should feel ambiguous and unnerving, not genuinely comforting. The player's reaction will be wary and detached, reflecting their trauma.",
  "narrative": "The infirmary is a pocket of silence in the ever-present hum of the Forge. Mara, 'The Overseer', changes the dressing on your arm with an economy of movement that is almost gentle. 'It will scar,' she says, her voice low and even. It is not a promise of healing, but a statement of fact...",
  "playerChoices": [
    {"id": "choice_accept_care", "text": "Nod silently and accept the care."},
    {"id": "choice_question_motive", "text": "Ask what she expects in return."}
  ],
  "imagePrompt": {
    "prompt": "Masterpiece 8K digital oil painting, a young man with a haunted expression sits on a sterile cot in a dark, concrete room. A weary but stern woman in a grey uniform tends to a bandage on his arm. The only light is a cold, white beam from a high window, creating stark shadows. Caravaggio-style chiaroscuro, by Greg Rutkowski and Artgerm.",
    "negativePrompt": "smiling, peaceful, calm, friendly"
  },
  "speaker": "Mara",
  "ttsText": "[quietly] It will scar. That is a fact you must accept."
}
</EXAMPLE_OUTPUT>
`;

const creativeOutputSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: { type: Type.STRING, description: "The step-by-step deliberation synthesizing the context into a creative plan." },
        narrative: { type: Type.STRING },
        playerChoices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                },
                required: ['id', 'text'],
            }
        },
        imagePrompt: { 
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING },
                negativePrompt: { type: Type.STRING, optional: true },
            },
            required: ['prompt'],
        },
        speaker: { type: Type.STRING },
        ttsText: { type: Type.STRING }
    },
    required: ["reasoning", "narrative", "playerChoices", "imagePrompt", "speaker", "ttsText"]
};

export const generateImage = async (promptObject: { prompt: string; negativePrompt?: string }): Promise<string> => {
    if (!promptObject || !promptObject.prompt) {
      console.warn("generateImage called with an empty prompt object.");
      return "";
    }
    const { prompt, negativePrompt } = promptObject;
    try {
        const requestPayload: any = {
            model: imageModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        };
        if (negativePrompt) {
            requestPayload.config.negativePrompt = negativePrompt;
        }
        const response = await ai.models.generateImages(requestPayload);
        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new Error("Image generation returned no data.");
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate a visual from the abyss.");
    }
};

export const generateSpeech = async (text: string, speaker: string, vocalStyle: string): Promise<string> => {
    if (!text) {
        console.warn("generateSpeech called with empty text.");
        return "";
    }
     const voiceMap: { [key: string]: string } = {
        'Selene': 'Puck', 'Lyra': 'Kore', 'Aveena': 'Zephyr', 'Mara': 'Charon', 'Eleni': 'Kore',
        'Jared': 'Fenrir', 'Torin': 'Fenrir', 'Eryndor': 'Fenrir', 'Calen': 'Fenrir', 'Gavric': 'Fenrir', 'Kael': 'Fenrir',
        'Narrator': 'Zephyr'
    };
    const voiceName = voiceMap[speaker] || 'Zephyr';
    
    let ttsPrompt = text.replace(/\[.*?\]/g, '').trim();
    const cueMatch = text.match(/\[(.*?)\]/);
    let finalCue = vocalStyle;
    if (cueMatch) {
        finalCue = cueMatch[1];
    }

    ttsPrompt = `Say ${finalCue}: ${ttsPrompt}`;

    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: ttsPrompt }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!audioData) throw new Error("TTS generation returned no data.");
        return audioData;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate a voice from the forge.");
    }
};

const callStoryEngine = async (prompt: string, previousImageUrl: string | null): Promise<any> => {
     try {
        const contents = [];
        if (previousImageUrl) {
            const base64Data = previousImageUrl.split(',')[1];
            if (base64Data) {
                contents.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Data,
                    }
                });
            }
        }
        contents.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: storyModel,
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeOutputSchema,
                temperature: 1.0, topP: 0.95,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini story engine:", error);
        if (error instanceof Error && error.message.includes("JSON")) {
             throw new Error("The Abyss Alchemist returned a malformed response.");
        }
        throw new Error("The Abyss Alchemist failed to respond.");
    }
}

const executeTurn = async (gameState: GameState, previousImageUrl: string | null = null): Promise<GameState> => {
    const { currentLedger, playerCharacter, educatorRoster, subjectRoster } = gameState;
    
    const eventData = selectNextEvent(currentLedger, playerCharacter, { educators: educatorRoster, subjects: subjectRoster }, EVENT_TEMPLATES);
    if (!eventData) {
        throw new Error("No valid event could be found for the current game state.");
    }
    const { event, assignedRoles } = eventData;
    
    const eventCadence = Array.isArray(event.cadence) ? event.cadence[0] : event.cadence;
    const ledgerForAI = { ...currentLedger, currentEventId: event.id, narrativeCadence: eventCadence };
    
    let inspirations = [...(INSPIRATION_LIBRARY.GLOBAL || [])];
    Object.values(assignedRoles).forEach(char => {
        if (char) {
            inspirations.push(...(INSPIRATION_LIBRARY.Archetypes[char.archetype] || []));
            char.traits.forEach(trait => {
                inspirations.push(...(INSPIRATION_LIBRARY.Traits[trait] || []));
            });
        }
    });
    const locationDescKey = LOCATIONS[ledgerForAI.currentLocationId]?.descriptionKey;
    if (locationDescKey) {
        inspirations.push(...(INSPIRATION_LIBRARY.Locations[locationDescKey] || []));
    }
    inspirations.push(...(INSPIRATION_LIBRARY.Event_Setups[event.sceneSetupKey] || []));


    const location = LOCATIONS[ledgerForAI.currentLocationId];
    let rolesString = '';
    for (const role in assignedRoles) {
        const char = assignedRoles[role];
        if (char) {
             rolesString += `${role}: ${char.name} (Archetype: ${char.archetype}, Traits: [${char.traits.join(', ')}], Mood: ${char.currentMood})\n`;
        }
    }
    
    const ledgerInterpretation = `Hope: ${ledgerForAI.hopeLevel}, Trauma: ${ledgerForAI.traumaLevel}, Physical: ${ledgerForAI.physicalIntegrity}`;
    
    const promptText = masterPrompt
        .replace('{locationName}', location.name)
        .replace('{locationTags}', location.tags.join(', '))
        .replace('{day}', ledgerForAI.day.toString())
        .replace('{timeOfDay}', ledgerForAI.timeOfDay)
        .replace('{cadence}', NarrativeCadence[ledgerForAI.narrativeCadence])
        .replace('{forgeIntensityLevel}', ledgerForAI.forgeIntensityLevel.toString())
        .replace('{magistraMood}', ledgerForAI.magistraMood || 'Neutral')
        .replace('${/* Inject NEW CALCULATED STATE ledger JSON here */}', JSON.stringify(ledgerForAI, null, 2))
        .replace('${/* Paste the detailed LEDGER INTERPRETATION section here */}', ledgerInterpretation)
        .replace('{eventId}', event.id)
        .replace('{eventTitle}', event.eventTitleKey || event.id)
        .replace('{sceneSetupKey}', event.sceneSetupKey)
        .replace('${/* List all assigned characters and their roles/archetypes/traits here */}', rolesString)
        .replace('${/* Inject retrieved RAG snippets here */}', [...new Set(inspirations)].join('\n'))
        .replace('{Player.name}', playerCharacter.name);

    const creativeOutput = await callStoryEngine(promptText, previousImageUrl);

    let vocalStyle = 'clinically';
    const speakerName = creativeOutput.speaker;
    const speakerChar = Object.values(assignedRoles).find(c => c.name === speakerName);

    switch(ledgerForAI.narrativeCadence) {
        case NarrativeCadence.Comfort:
        case NarrativeCadence.Aftermath:
            vocalStyle = 'whispering'; break;
        case NarrativeCadence.Terror:
            vocalStyle = 'intensely'; break;
        case NarrativeCadence.Humor:
            vocalStyle = 'mockingly'; break;
        case NarrativeCadence.Tension:
            if (speakerChar?.archetype === EducatorArchetype.TheSadist || speakerChar?.archetype === EducatorArchetype.TheManipulator) {
                vocalStyle = 'seductively';
            }
            break;
    }

    // Pass assignedRoles to the next state for consequence application
    const tempState = {
      ...gameState,
      currentLedger: ledgerForAI,
      ...creativeOutput,
      ttsVocalStyle: vocalStyle,
    };
    
    // @ts-ignore - a temporary property to pass roles to advanceStory
    tempState._prevAssignedRoles = assignedRoles;

    return tempState;
}


export const initializeStory = async (): Promise<GameState> => {
    const { player, educators, subjects } = generateInitialRosters();
    // FIX: Add missing 'turn' and 'narrativeCadence' properties to satisfy the YandereLedger type.
    const initialLedger: YandereLedger = {
        turn: 0,
        currentLocationId: 'LOC_BOYS_HUTS',
        day: 1,
        timeOfDay: 'Morning',
        subjectAgencyBudget: 100,
        shamePainAbyssLevel: 0,
        traumaLevel: 0,
        hopeLevel: 100,
        physicalIntegrity: 100,
        interpersonalBonds: {},
        forgeIntensityLevel: 50,
        eventHistory: [],
        narrativeCadence: NarrativeCadence.Tension,
    };
    
    // FIX: Corrected 'imagePrompt' to be an object and added missing 'reasoning' and 'ttsVocalStyle' to satisfy the GameState type.
    const initialGameState: GameState = {
        playerCharacter: player,
        educatorRoster: educators,
        subjectRoster: subjects,
        currentLedger: initialLedger,
        narrative: '',
        playerChoices: [],
        imagePrompt: { prompt: '', negativePrompt: '' },
        ttsText: '',
        speaker: '',
        ttsVocalStyle: 'clinically',
        reasoning: '',
    };
    
    return executeTurn(initialGameState, null);
};

export const advanceStory = async (currentState: GameState, choiceId: string, previousImageUrl: string | null): Promise<GameState> => {
    // @ts-ignore - retrieve roles from temporary state
    const prevAssignedRoles = currentState._prevAssignedRoles as Record<string, GeneratedCharacter>;
    const { currentLedger } = currentState;
    
    const prevEvent = EVENT_TEMPLATES.find(e => e.id === currentLedger.currentEventId);
    const choice = prevEvent?.possibleChoices.find(c => c.id === choiceId);
    if (!prevEvent || !choice || !prevAssignedRoles) {
        throw new Error(`Could not find event, choice, or role context: ${currentLedger.currentEventId} / ${choiceId}`);
    }

    let newLedger = { ...currentLedger };
    let newEducatorRoster = [...currentState.educatorRoster];
    let newSubjectRoster = [...currentState.subjectRoster];
    let newPlayerCharacter = { ...currentState.playerCharacter };


    choice.consequences.forEach(con => {
        if(con.statChanges) {
           const modifiedStatChanges: Partial<YandereLedger> = { ...con.statChanges };
           if (currentLedger.narrativeCadence === NarrativeCadence.Comfort) {
               if (modifiedStatChanges.hopeLevel && modifiedStatChanges.hopeLevel < 0) modifiedStatChanges.hopeLevel = Math.round(modifiedStatChanges.hopeLevel * 1.5);
               if (modifiedStatChanges.traumaLevel && modifiedStatChanges.traumaLevel > 0) modifiedStatChanges.traumaLevel = Math.round(modifiedStatChanges.traumaLevel * 1.5);
           }
           newLedger = { ...newLedger, ...modifiedStatChanges };
        }
        if(con.changeLocation) {
            newLedger.currentLocationId = con.changeLocation;
        }
        if (con.updateWorldState) {
            newLedger = { ...newLedger, ...con.updateWorldState };
        }
        if(con.bondChanges) {
            con.bondChanges.forEach(bc => {
                const targetChar = prevAssignedRoles[bc.targetRole];
                if (targetChar) {
                    const currentBond = newLedger.interpersonalBonds[targetChar.id] || 0;
                    newLedger.interpersonalBonds[targetChar.id] = currentBond + bc.change;
                }
            });
        }
        if (con.setMood) {
            const targetChar = prevAssignedRoles[con.setMood.role];
            if (targetChar) {
                if (targetChar.id === newPlayerCharacter.id) {
                    newPlayerCharacter.currentMood = con.setMood.mood;
                } else {
                    const educatorIndex = newEducatorRoster.findIndex(e => e.id === targetChar.id);
                    if (educatorIndex > -1) {
                        newEducatorRoster[educatorIndex] = { ...newEducatorRoster[educatorIndex], currentMood: con.setMood.mood };
                    } else {
                        const subjectIndex = newSubjectRoster.findIndex(s => s.id === targetChar.id);
                        if (subjectIndex > -1) {
                            newSubjectRoster[subjectIndex] = { ...newSubjectRoster[subjectIndex], currentMood: con.setMood.mood };
                        }
                    }
                }
            }
        }
    });

    newLedger.eventHistory.push(prevEvent.id);

    const { day, timeOfDay } = advanceTime(newLedger.day, newLedger.timeOfDay);
    newLedger.day = day;
    newLedger.timeOfDay = timeOfDay;
    newLedger.turn += 1;

    const newState: GameState = {
        ...currentState,
        currentLedger: newLedger,
        playerCharacter: newPlayerCharacter,
        educatorRoster: newEducatorRoster,
        subjectRoster: newSubjectRoster,
    };
    
    // @ts-ignore
    delete newState._prevAssignedRoles;

    return executeTurn(newState, previousImageUrl);
};
