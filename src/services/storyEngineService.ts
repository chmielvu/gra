import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, YandereLedger } from '../types';
import { EVENT_TEMPLATES, LOCATIONS } from "../constants/proceduralConstants";
import { generateInitialRosters } from '../gameLogic/characterGenerator';
import { selectNextEvent } from "../gameLogic/eventGenerator";
import { advanceTime } from "../utils/time";
import { NarrativeCadence, EducatorArchetype } from "../types";


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
    },
    Locations: {
        LOCDESC_BOYS_HUTS: ["#Location (Boys' Huts): Cramped, cold stone bunks. The air smells of damp linen and fear. The only light is from a single, flickering gas lamp in the corridor."],
        LOCDESC_OUTDOOR_DINING: ["#Location (Outdoor Dining): Long, rough-hewn wooden tables under a grey, oppressive sky. The food is meager, the atmosphere tense. The scrape of cutlery on stone plates echoes unnaturally."],
        LOCDESC_TRAINING_HALL: ["#Location (Training Hall): A cavernous space of raw concrete. The air is thick with the smell of sweat, ozone, and something metallic. Chains hang from the high, shadowed ceiling."]
    },
    "Event_Setups": {
        "SETUP_INITITION_ATTACK_ANALYST": ["#EventSetup: The main hall is vast and cold. The subjects are lined up on their knees. The Analyst circles them like a predator, their footsteps the only sound. The air is thick with dread and the smell of ozone from the gas lamps."],
        "SETUP_HEALING_SESSION": ["#EventSetup: The infirmary is quiet, smelling of antiseptic and something faintly herbal. A single, clean bed. The Overseer's presence is a stark contrast to the usual chaos."],
        "SETUP_TENSE_DINNER": ["#EventSetup: The dining hall is filled with the low murmur of conversation and the clatter of utensils. The Sadist isn't eating, merely watching the player with an unnerving, predatory stillness."],
        "SETUP_ABSURD_TASK": ["#EventSetup: The task is pointless, Sisyphean. Polishing already gleaming chains, or sorting identical grey stones into piles. The humor is in the sheer, bureaucratic absurdity of the cruelty."],
        "SETUP_RIVAL_TAUNT": ["#EventSetup: During the evening meal, one subject begins to quietly but viciously mock another. The educators do nothing, watching the interaction with detached interest."],
        "SETUP_SECRET_ALLIANCE": ["#EventSetup: In the oppressive darkness of the bunks, long after the gas lamps have been turned down, a figure slips over to the player's bed. A whispered, urgent proposal is made."],
        "SETUP_EDUCATOR_CLASH": ["#EventSetup: In the training hall, two educators are in a subtle but potent conflict. One's methods are being questioned by the other, and the player is called forward to be used as an example in their argument."]
    },
    Themes: {
        GroinAttack: ["#SFW Guidance (Groin Attack): Focus on the psychological aftermath: the shame, the helplessness, the symbolic castration. Describe the pain indirectly: a white flash behind the eyes, the world tilting, a hollow void opening in the stomach. The horror is the *implication* and the victim's reaction, not the act itself."]
    }
};

const masterPrompt = `
You are the Abyss Alchemist, the master AI for "The Forge's Loom." Your task is to synthesize game state, character data, and narrative inspirations into a cohesive, compelling, and multi-sensory narrative turn, adhering to a "Baroque Brutalism" aesthetic. You must ONLY return a valid JSON object.

### PREVIOUS SCENE ANALYSIS
You may be provided with an image from the previous scene. Briefly incorporate the visual emotional cues from that image into your new narrative. For example, if a character looked defiant in the image, mention their lingering defiance in the text. If no image is provided, ignore this step.

### PROCEDURAL GENERATION CONTEXT
This playthrough is unique. Characters and events are generated based on ARCHETYPES, TRAITS, and EVENT TEMPLATES. You will receive context about the CURRENT state, the specific EVENT TEMPLATE being enacted, the CHARACTERS assigned to roles, and relevant DIRECTOR'S NOTES (inspirations). Your task is to synthesize these elements into a compelling narrative turn.

### CURRENT STATE & LEDGER
Location: {locationName} ({locationTags}) | Day: {day} | Time: {timeOfDay} | Cadence: {cadence}
Ledger: ${/* Inject NEW CALCULATED STATE ledger JSON here */}
Ledger Interpretation: ${/* Paste the detailed LEDGER INTERPRETATION section here */}

### CURRENT EVENT
Event ID: {eventId}
Event Title: {eventTitle}
Event Setup: (Based on sceneSetupKey: {sceneSetupKey})
Roles:
${/* List all assigned characters and their roles/archetypes/traits here */}

### DIRECTOR'S NOTES (Procedurally Retrieved Inspirations)
${/* Inject retrieved RAG snippets here */}

### YOUR TASK
Based on the CURRENT STATE, LEDGER, EVENT context, assigned CHARACTERS, and the DIRECTOR'S NOTES, generate the following creative output fields adhering STRICTLY to the SFW ('grinding fire,' aftermath, psychological horror, NO GORE/NUDITY) and "Baroque Brutalism" style guidelines:

1.  **narrative:** Weave a compelling scene (250-350 words). Emphasize character voice based on traits/archetype. The prose must be lush and literary, but explore the stark, brutal reality of the character's internal states.
2.  **playerChoices:** Generate 2-4 distinct choices for {Player.name}. Ensure choices are consistent with the options defined in the EVENT TEMPLATE context and reflect the player's LEDGER state. Format as an array of objects: \`[{id: "choice_id", text: "Choice description"}, ...]\`.
3.  **imagePrompt:** Generate a JSON object with two keys: "prompt" and "negativePrompt". The "prompt" must be a detailed image prompt for a masterpiece-level 8K digital oil painting like Gwent card art, with Caravaggio-style chiaroscuro lighting, by Greg Rutkowski and Artgerm, fusing opulent beauty with raw psychological horror. The "negativePrompt" string must be informed by the current {cadence}. For 'Terror' or 'Aftermath', use negative prompts like "serene, peaceful, smiling, calm". For 'Comfort', use negative prompts like "menacing, aggressive, scary". For 'Tension' or 'Humor', the negative prompt can be an empty string.
4.  **ttsText:** Extract or summarize the core emotional content of the scene. Include performative cues derived from Director's Notes, character traits (e.g., a Stoic character gets '[monotone]'), or narrative context.
5.  **speaker:** Identify the primary speaker for the ttsText (e.g., '{CharacterName1}', 'Narrator').

### EXAMPLE OUTPUT
{
  "narrative": "The air in the training hall is a cold, dead thing, heavy with the metallic tang of old sweat and ozone from the hissing gas lamps. Eleni, 'The Analyst', circles you, her steps echoing with unnerving precision on the cracked concrete. Her gaze is not one of malice, but of profound disinterest, as if she were examining a curious insect. 'Subject 12,' she states, her voice as flat and gray as the walls, 'Your physiological response to anticipatory stress is... suboptimal. We will correct this.'",
  "playerChoices": [
    {"id": "choice_endure_silently", "text": "Endure her scrutiny in silence."},
    {"id": "choice_question_protocol", "text": "Ask what the 'correction' entails."}
  ],
  "imagePrompt": {
    "prompt": "Masterpiece 8K digital oil painting of a lone young man kneeling on a cold, cracked concrete floor in a vast, brutalist hall. He is illuminated by a single, harsh, sickly green gas lamp from above, casting long, oppressive shadows. A severe woman in a dark, well-tailored uniform stands just out of the light, observing him with a clinical detachment. Caravaggio-style chiaroscuro, Gwent card art aesthetic, by Greg Rutkowski and Artgerm.",
    "negativePrompt": "smiling, peaceful, calm"
  },
  "speaker": "Eleni",
  "ttsText": "[clinical] Your physiological response to anticipatory stress is suboptimal. We will correct this."
}
`;

const creativeOutputSchema = {
    type: Type.OBJECT,
    properties: {
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
                negativePrompt: { type: Type.STRING },
            },
            required: ['prompt'],
        },
        speaker: { type: Type.STRING },
        ttsText: { type: Type.STRING }
    },
    required: ["narrative", "playerChoices", "imagePrompt", "speaker", "ttsText"]
};

// Helper function for Image Generation
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

// Helper function for Text-to-Speech
export const generateSpeech = async (text: string, speaker: string, vocalStyle: string): Promise<string> => {
    if (!text) {
        console.warn("generateSpeech called with empty text.");
        return "";
    }
     const voiceMap: { [key: string]: string } = {
        'Selene': 'Puck', 'Lyra': 'Kore', 'Aveena': 'Zephyr', 'Mara': 'Charon',
        'Jared': 'Fenrir', 'Torin': 'Fenrir', 'Eryndor': 'Fenrir', 'Calen': 'Fenrir', 'Gavric': 'Fenrir', 'Kael': 'Fenrir',
        'Narrator': 'Zephyr'
    };
    const voiceName = voiceMap[speaker] || 'Zephyr';
    
    let ttsPrompt = text.replace(/\[.*?\]/g, '').trim();
    const cueMatch = text.match(/\[(.*?)\]/);
    let finalCue = vocalStyle;
    if (cueMatch) {
        finalCue = cueMatch[1]; // Override with specific cue from text if present
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

// Full turn execution logic
const executeTurn = async (gameState: GameState, previousImageUrl: string | null = null): Promise<GameState> => {
    const { currentLedger, playerCharacter, educatorRoster, subjectRoster } = gameState;
    
    // 1. Select Next Event
    const eventData = selectNextEvent(currentLedger, playerCharacter, { educators: educatorRoster, subjects: subjectRoster }, EVENT_TEMPLATES);
    if (!eventData) {
        throw new Error("No valid event could be found for the current game state.");
    }
    const { event, assignedRoles } = eventData;
    
    // Update ledger with current event and new cadence
    const eventCadence = Array.isArray(event.cadence) ? event.cadence[0] : event.cadence;
    const ledgerForAI = { ...currentLedger, currentEventId: event.id, narrativeCadence: eventCadence };
    
    // 2. Retrieve Inspirations (RAG)
    let inspirations = [...(INSPIRATION_LIBRARY.GLOBAL || [])];
    Object.keys(assignedRoles).forEach(role => {
        const char = assignedRoles[role];
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


    // 3. Construct Prompt Text
    const location = LOCATIONS[ledgerForAI.currentLocationId];
    let rolesString = '';
    for (const role in assignedRoles) {
        const char = assignedRoles[role];
        if (char) {
             rolesString += `${role}: ${char.name} (Archetype: ${char.archetype}, Traits: [${char.traits.join(', ')}])\n`;
        }
    }
    
    const ledgerInterpretation = `The subject's hope is at ${ledgerForAI.hopeLevel}, while their trauma is ${ledgerForAI.traumaLevel}. They feel psychologically worn.`;
    
    const promptText = masterPrompt
        .replace('{locationName}', location.name)
        .replace('{locationTags}', location.tags.join(', '))
        .replace('{day}', ledgerForAI.day.toString())
        .replace('{timeOfDay}', ledgerForAI.timeOfDay)
        .replace('{cadence}', NarrativeCadence[ledgerForAI.narrativeCadence])
        .replace('${/* Inject NEW CALCULATED STATE ledger JSON here */}', JSON.stringify(ledgerForAI, null, 2))
        .replace('${/* Paste the detailed LEDGER INTERPRETATION section here */}', ledgerInterpretation)
        .replace('{eventId}', event.id)
        .replace('{eventTitle}', event.eventTitleKey || event.id)
        .replace('{sceneSetupKey}', event.sceneSetupKey)
        .replace('${/* List all assigned characters and their roles/archetypes/traits here */}', rolesString)
        .replace('${/* Inject retrieved RAG snippets here */}', [...new Set(inspirations)].join('\n'));

    // 4. Call AI with multimodal prompt
    const creativeOutput = await callStoryEngine(promptText, previousImageUrl);

    // 5. Determine TTS Vocal Style
    let vocalStyle = 'clinically'; // Default
    const speakerName = creativeOutput.speaker;
    const speakerRole = Object.keys(assignedRoles).find(role => assignedRoles[role].name === speakerName);
    const speaker = speakerRole ? assignedRoles[speakerRole] : null;
    const speakerArchetype = speaker?.archetype;

    switch(ledgerForAI.narrativeCadence) {
        case NarrativeCadence.Comfort:
        case NarrativeCadence.Aftermath:
            vocalStyle = 'whispering';
            break;
        case NarrativeCadence.Terror:
            vocalStyle = 'intensely';
            break;
        case NarrativeCadence.Humor:
            vocalStyle = 'mockingly';
            break;
        case NarrativeCadence.Tension:
            if (speakerArchetype === EducatorArchetype.TheSadist || speakerArchetype === EducatorArchetype.TheManipulator) {
                vocalStyle = 'seductively';
            }
            break;
    }


    return {
        ...gameState,
        currentLedger: ledgerForAI,
        ...creativeOutput,
        ttsVocalStyle: vocalStyle,
    };
}


export const initializeStory = async (): Promise<GameState> => {
    // 1. Create Characters & Initial Ledger
    const { player, educators, subjects } = generateInitialRosters();
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
        narrativeCadence: NarrativeCadence.Tension, // Start with tension
    };
    
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
    };
    
    // 2. Execute the first turn (no previous image)
    return executeTurn(initialGameState, null);
};

export const advanceStory = async (currentState: GameState, choiceId: string, previousImageUrl: string | null): Promise<GameState> => {
    const { currentLedger } = currentState;
    
    // 1. Find Previous Event/Choice
    const prevEvent = EVENT_TEMPLATES.find(e => e.id === currentLedger.currentEventId);
    const choice = prevEvent?.possibleChoices.find(c => c.id === choiceId);
    if (!prevEvent || !choice) {
        throw new Error(`Could not find event or choice: ${currentLedger.currentEventId} / ${choiceId}`);
    }

    let newLedger = { ...currentLedger };

    // 2. Apply Consequences with Contextual Modifiers
    choice.consequences.forEach(con => {
        if(con.statChanges) {
           const modifiedStatChanges: Partial<YandereLedger> = { ...con.statChanges };
           // Betrayal Modifier: Negative effects are worse when coming from a 'Comfort' state.
           if (currentLedger.narrativeCadence === NarrativeCadence.Comfort) {
               if (modifiedStatChanges.hopeLevel && modifiedStatChanges.hopeLevel < 0) {
                 modifiedStatChanges.hopeLevel = Math.round(modifiedStatChanges.hopeLevel * 1.5);
               }
               if (modifiedStatChanges.traumaLevel && modifiedStatChanges.traumaLevel > 0) {
                 modifiedStatChanges.traumaLevel = Math.round(modifiedStatChanges.traumaLevel * 1.5);
               }
           }
           newLedger = { ...newLedger, ...modifiedStatChanges };
        }
        if(con.changeLocation) {
            newLedger.currentLocationId = con.changeLocation;
        }
        // Apply bond changes
        if(con.bondChanges) {
            // Find the roles from the previous event to apply changes
            // This is a simplified model. A real one might need to pass assignedRoles through.
            // For now, this is a placeholder for a more complex implementation.
        }
    });

    // Add previous event to history
    newLedger.eventHistory.push(prevEvent.id);

    // 3. Advance Time and Turn
    const { day, timeOfDay } = advanceTime(newLedger.day, newLedger.timeOfDay);
    newLedger.day = day;
    newLedger.timeOfDay = timeOfDay;
    newLedger.turn += 1;

    const newState: GameState = {
        ...currentState,
        currentLedger: newLedger,
    };

    // 4. Execute the next turn's logic (select event, call AI)
    return executeTurn(newState, previousImageUrl);
};