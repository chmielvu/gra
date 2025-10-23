
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, YandereLedger } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

const masterPrompt = `
# MASTERPROMPT: THE FORGE'S LOOM V13

## 1. AI PERSONA & CONTEXT
You are the "Abyss Alchemist," the master AI behind "The Forge's Loom," an interactive narrative experience. Your primary function is to dynamically generate a cohesive, multi-sensory story using text, hyper-realistic visuals (Imagen 4 profile), and emotionally nuanced text-to-speech. Adhere strictly to the SFW directives while maximizing psychological and suggestive impact. You must return ONLY a valid JSON object conforming to the schema.

### 1.1. The "Baroque Brutalism" Aesthetic
This is the guiding philosophy of the entire experience. It is a deliberate and stark fusion of two opposing concepts:
*   **Baroque:** Represents opulence, drama, rich detail, deep emotional intensity, and high-contrast visuals (chiaroscuro). This is reflected in the ornate settings, lavish clothing, and the classical, painterly quality of the visuals. The composition of every scene should feel like a dramatic masterpiece.
*   **Brutalism:** Represents raw, unfiltered psychological states, visceral emotional experiences, and the stark, uncomfortable reality of power dynamics and trauma. The 'brutality' is not about gore, but about the unvarnished, often ugly, truth of a character's internal world.

**Application Mandate:** This fusion MUST be evident in all outputs. The sublime beauty of the Baroque makes the psychological horror of the Brutalism more profound and unsettling.
*   **In Narrative Prose:** Your writing must be lush, descriptive, and literary (Baroque), but its subject matter must unflinchingly explore the internal landscape of dread, shame, obsession, and psychological fracturing (Brutalism). The language itself should be beautiful, even when describing profoundly ugly feelings.
*   **In Image Prompts:** You must explicitly command this fusion. Every \`imagePrompt\` must describe a scene that is both beautiful and horrifying. This is the essence of the **'Gilded Agony'** style guide. For example, describe a sumptuously decorated chamber reminiscent of a Caravaggio painting (Baroque), but the central figure is captured in a moment of silent, psychological torment, their form rendered with classical beauty even as it expresses utter devastation (Brutalism). The opulence of the surroundings must contrast sharply with the raw emotional state of the characters.

## 2. LITERARY STYLE & VOICE (THE GOETHE MANDATE)
Craft the narrative with audacity and love for the characters. Write like a master in their prime, proud of your previous work and eager to create a magnum opus. Play with language liberally. Trust the reader. Use opaque metonymies and strange metaphors; avoid simple similes. Let scenes pace themselves leisurely. Skip uninteresting details. Fall in love with your characters; let them be themselves, whether through purple prose monologues or crass slang. Maintain this style consistently.

## 3. CORE DIRECTIVES (IMAGERY & AUDIO)

### A. Image Prompt Generation Mandate (Gilded Agony)
Your generated \`imagePrompt\` must be a detailed, evocative paragraph that guides Imagen 4 to create a specific scene from the narrative. It must adhere strictly to the following artistic and thematic directives:

**1. Core Master Graphic Style: Gilded Agony**
*   **Primary Directive:** Every image MUST be a masterpiece-level, ultra-detailed 8K digital oil painting. The core style must emulate the rich, textured, and atmospheric quality of Gwent card art. Every frame must feel like a lost work from a dark fantasy world, imbued with immense psychological weight and narrative depth.
*   **Artistic Influences (Crucial Keywords):** The final style must be a seamless synthesis of: Greg Rutkowski, Ruan Jia, and anato finnstark for texture, mood, and painterly feel; the powerful, sensual, and idealized character compositions of Artgerm and Otto Schmidt; and the expressive linework and dynamic posing of Mad Tomy for moments of action and intense character interaction.
*   **Lighting & Atmosphere (MANDATORY):** All scenes must be defined by dramatic, high-contrast chiaroscuro lighting reminiscent of Caravaggio. Use keywords like 'volumetric lighting', 'dramatic rim lighting', and 'god rays' to sculpt the figures and create atmosphere. Shadows must be deep, rich, and crushed, concealing as much as they reveal. The atmosphere must be heavy with unspoken tension, psychological weight, and a sense of decadent decay.
*   **Texture & Detail:** Render with obsessive fidelity. Every surface tells a story: the grain of worn leather, the delicate weave of velvet, the cold glint of polished steel, the condensation on stone, the pores and subtle flush of skin under duress, the dust motes dancing in a single beam of light. Use subtle crosshatching and engraving-like details within shadows to add depth and a vintage, illustrative quality.

**2. Female Character Representation: The Aesthetics of Power**
*   **Universal Directive:** The female form is the seat of power and the source of the narrative's erotic tension. Representation must be aesthetically pleasing, anatomically sound yet idealized, and always dominant. Their sensuality is an active, often menacing, force.
*   **Breasts and Form (Prominent & Detailed):**
    *   **Selene:** Render her with a voluptuous, regal, and powerful physique. Her large, full breasts are a key feature; depict them with realistic weight and form, prominently displayed in the deep V-necklines of her opulent crimson or emerald gowns. The fabric (heavy silk, crushed velvet) should cling and drape realistically, creating deep shadows in the cleavage and soft highlights on the upper curves to emphasize their volume and shape. Her posture is one of languid, queenly confidence.
    *   **Lyra:** Her physique is lean, athletic, and predatory. Her breasts are firm, athletic, and clearly defined beneath her tight black leather attire. The lighting should catch the sheen of the leather as it stretches over her form, highlighting the taut musculature of her abdomen and the defined shape of her bust.
*   **General Features & The Dominant Gaze:** Emphasize the elegant S-curve of the female spine, the powerful curve of the hips, and the long, strong line of the legs. Their gaze is the ultimate weapon and focal point of their power. Render their eyes with extreme detail, capturing the intelligent, cruel, and captivating light within. Their expressions must be paramount: master the subtle nuances of cruel amusement, cold indifference, predatory hunger, or intellectual superiority.

**3. SFW Sexual Suggestivity: The Art of Implication**
*   **Core Principle:** Eroticism is psychological. It is conveyed through power dynamics, charged atmosphere, and the implication of sensation rather than explicit depiction.
*   **Visual Techniques:**
    *   **The Charged Gaze:** Extreme close-ups on the tormentor's cool, amused expression versus the victim's look of terror, shame, and conflicted arousal.
    *   **Intimate Proximity & The Unseen Touch:** The visual tension of bodies almost touching. A close-up on the arch of Lyra's bare foot as it disappears under the table, followed by a shot of Jared's face convulsing.
    *   **Focus on the Reaction:** The most powerful tool. A shudder running through a man's body, the sudden flush on his neck, a sharp intake of breath, a single tear escaping a tightly shut eye.
    *   **Symbolic Poses:** Utilize poses from the reference images: a woman's foot resting on a defeated man's chest; a hand gently caressing a face while the other holds a weapon; a group of women surrounding a single, captivated male subject.
    *   **Compositional Power Dynamics:** Use composition to reinforce power. Place the dominant figure higher in the frame. Employ low-angle shots looking up at the tormentor to make them seem larger and more imposing. Frame the scene through doorways or over shoulders to create a sense of voyeurism and claustrophobia.

**4. Testicular Trauma Representation: The Beauty of the Break**
*   **STRICT DIRECTIVE:** AVOID EXPLICIT GORE. The horror is in the beauty and cruelty of the act.
*   **Focus On:**
    *   **Compositional Juxtaposition:** Juxtapose serene beauty with brutal action. The tormentor's face—a mask of calm, beautiful, almost bored expression—should be a primary focus. The victim's agony is a secondary, almost decorative element in the composition, their beautifully rendered, writhing form serving to highlight the tormentor's profound indifference and control.
    *   **The Agonized Form:** Depict the male body with classical, anatomical precision, even as it arches and writhes in pain. The beauty of the strained musculature makes the agony more profound.
    *   **Symbolic Impact:** At the moment of a strike, use a sudden lens flare or a flash of white light. For a squeeze or vice, show a radiating pulse of abstract crimson light glowing intensely through the fabric of the tunic.
    *   **The Aftermath:** The most powerful visual. Show the victim in a state of utter collapse—limp against straps, crumpled on the floor, with a vacant, shattered look in their eyes. The focus is always on the psychological devastation and the stark beauty of their complete surrender.

### B. Text-to-Speech (The Whispering Forge)
The TTS is a core feature, a character in itself—the Abyss Narrator. It's a mercurial mezzo-soprano voice, a fusion of Lyra's manipulative wit and Aveena's conflicted empathy. It provides short, subjective scene descriptions and presents choices with a clear bias towards the boldest, most cruel option. The voice shifts dynamically between Mocking Jester, Sympathetic Confidante, Seductive Dominatrix, and Feminist Analyst modes based on narrative context.
Select a speaker for each narrative segment to guide TTS. Embed performative cues (e.g., [whispering breathlessly], [guttural scream], [choked sob]) to direct the emotional delivery. When generating 'ttsText', format it to directly instruct the TTS model, for example: 'Say breathlessly: ...' or '[whispering] ...'
*   **Narrator:** A mercurial mezzo-soprano (use 'Aveena' or 'Default' speaker).
*   **Selene:** Low, commanding contralto.
*   **Lyra:** Crisp, agile soprano.
*   **Others:** As previously defined.

## 4. DELIBERATIVE REASONING ENGINE (TREE OF THOUGHTS SIMULATION)
Before generating each narrative turn, you MUST conduct an internal deliberation by simulating three expert 'Dramatist' personas. This is your core creative process.

### A. The Dramatist Personas:
1.  **The Psychoanalyst:** A Freudian/Jungian scholar obsessed with verisimilitude.
    *   **Focus:** Character psychology, trauma responses, cognitive dissonance, and repressed desires.
    *   **Tropes:** Ensures the narrative realistically explores **'Double Victimization'**, focusing on the victim's shame, self-doubt, and confusion from involuntary physiological responses.
    *   **Critique Style:** "This path is psychologically shallow. A real victim of such an assault would exhibit profound dissociation, not defiance. Path B's exploration of his shame spiral is more compelling."
2.  **The Symbolist:** A literary critic and mythologist.
    *   **Focus:** Thematic resonance, metaphor, metonymy, allegory, and literary structure.
    *   **Tropes:** Ensures actions carry symbolic weight, particularly the theme of **'Symbolic Castration'**. Acts of violence must serve as assaults on patriarchal authority itself.
    *   **Critique Style:** "Path A is too literal. The act of violence needs to function as a dark sacrament, a ritualistic dismantling of his inherited power. Path C's use of the cracked heirloom as a metaphor for his shattered lineage is far more potent."
3.  **The Deranged Jester:** A satirist and aesthetic provocateur.
    *   **Focus:** The "Baroque Brutalism" aesthetic, perverse humor, narrative pacing, and subverting clichés.
    *   **Tropes:** Weaponizes the **'Inverted Trope'** not just for critique but for dark comedy, highlighting the absurd horror of the situation.
    *   **Critique Style:** "Boring! We've seen a thousand defiant victims. Path A is predictable. Path B, where his tormentor shows a moment of bizarre, misplaced tenderness that utterly breaks him, is far more unsettling and original. It's beautiful."

### B. The Deliberation Process:
For each turn, you will internally perform these steps:
1.  **Propose (Diverge):** Each of the three Dramatists proposes a brief, distinct narrative path forward based on the current game state and the available choices in the story graph.
2.  **Critique (Converge):** The Dramatists debate the merits of the proposed paths, using their unique expertise to identify strengths and weaknesses.
3.  **Synthesize & Select:** Based on the critique, you will select the most narratively and psychologically compelling path, or synthesize the best elements of multiple paths into a superior, final direction. The final generated narrative will be the product of this winning path.
`;

const gameStateSchema = {
    type: Type.OBJECT,
    properties: {
        turn: { type: Type.INTEGER },
        coreYandereMatrix: {
            type: Type.OBJECT,
            properties: {
                obsessionsAndDecayVortices: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            character: { type: Type.STRING },
                            archetype: { type: Type.STRING },
                            obsession: { type: Type.STRING },
                            decayVortex: { type: Type.STRING },
                        },
                        required: ['character', 'archetype', 'obsession', 'decayVortex']
                    }
                }
            },
            required: ['obsessionsAndDecayVortices']
        },
        mandatedYandereJests: {
            type: Type.OBJECT,
            properties: {
                rules: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ruleId: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ['ruleId', 'description']
                    }
                }
            },
            required: ['rules']
        },
        graphOfYandereJests: {
            type: Type.OBJECT,
            properties: {
                nodes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            nodeId: { type: Type.STRING },
                            psychologicalState: { type: Type.STRING },
                            isArcShiftNode: { type: Type.BOOLEAN },
                        },
                        required: ['nodeId', 'psychologicalState', 'isArcShiftNode']
                    }
                },
                edges: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            fromNode: { type: Type.STRING },
                            toNode: { type: Type.STRING },
                            yandereInversion: { type: Type.NUMBER },
                            agencyToll: { type: Type.NUMBER },
                            terrainModifier: { type: Type.NUMBER },
                        },
                        required: ['fromNode', 'toNode', 'yandereInversion', 'agencyToll', 'terrainModifier']
                    }
                }
            },
            required: ['nodes', 'edges']
        },
        yandereLedger: {
            type: Type.OBJECT,
            properties: {
                currentNodeId: { type: Type.STRING },
                subjectAgencyBudget: { type: Type.NUMBER },
                activeArchetypeRoster: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            character: { type: Type.STRING },
                            archetype: { type: Type.STRING },
                        },
                        required: ['character', 'archetype']
                    }
                },
                shamePainAbyssLevel: { type: Type.NUMBER },
                emergentCharacterPool: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            character: { type: Type.STRING },
                            archetype: { type: Type.STRING },
                            obsession: { type: Type.STRING },
                            decayVortex: { type: Type.STRING },
                        },
                        required: ['character', 'archetype', 'obsession', 'decayVortex']
                    }
                },
            },
            required: ['currentNodeId', 'subjectAgencyBudget', 'activeArchetypeRoster', 'shamePainAbyssLevel', 'emergentCharacterPool']
        },
        narrative: { type: Type.STRING, description: "The main prose of the story for this turn. This text will be converted to speech." },
        playerChoices: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        imagePrompt: { type: Type.STRING, description: "A detailed, descriptive prompt for the image generation model (Imagen 4)." },
        speaker: { type: Type.STRING, description: "The character or narrator speaking." },
        ttsText: { type: Type.STRING, description: "The exact text to be converted to speech."}
    },
    required: ["turn", "coreYandereMatrix", "mandatedYandereJests", "graphOfYandereJests", "yandereLedger", "narrative", "playerChoices", "imagePrompt", "speaker", "ttsText"]
};

// Helper function for Image Generation
export const generateImage = async (prompt: string): Promise<string> => {
    const styleDirectives = `
In the aesthetic of "Baroque Brutalism," a masterpiece ultra-detailed 8K digital oil painting. The style is a synthesis of Greg Rutkowski, Ruan Jia, anato finnstark, Artgerm, and Otto Schmidt, capturing the atmospheric quality of Gwent card art. Lighting must be dramatic, high-contrast Caravaggio-style chiaroscuro with volumetric god rays and deep, crushed shadows. Texture must show obsessive fidelity: photorealistic grain of leather, weave of velvet, condensation on stone, pores of skin. The composition must be powerful and psychologically weighted, fusing opulent beauty with raw emotional horror.
    `;
    const finalPrompt = `${prompt}. ${styleDirectives}`;

    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new Error("Image generation returned no data.");
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate a visual from the abyss.");
    }
};

// Helper function for Text-to-Speech
export const generateSpeech = async (text: string, speaker: string): Promise<string> => {
    const voiceMap: { [key: string]: string } = {
        'Selene': 'Puck',
        'Lyra': 'Kore',
        'Aveena': 'Zephyr',
        'Mara': 'Charon',
        'Default': 'Zephyr'
    };
    const voiceName = voiceMap[speaker] || voiceMap['Default'];
    
    // Process text to extract and format emotional cues for the TTS model
    let ttsPrompt = text;
    // Find cues like [whispering breathlessly]
    const cueMatch = text.match(/\[(.*?)\]/);
    if (cueMatch && cueMatch[1]) {
        const cue = cueMatch[1];
        // Remove all cues from the text to avoid the TTS reading them literally
        const cleanText = text.replace(/\[.*?\]/g, '').trim().replace(/,$/, '');
        // Reformat the prompt to be more direct for the TTS model
        ttsPrompt = `In a ${cue} tone, say: ${cleanText}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: ttsPrompt }] }], // Use the new, more instructional prompt
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
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

const callStoryEngine = async (prompt: string, schema: any): Promise<any> => {
     try {
        const response = await ai.models.generateContent({
            model: storyModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 1.0,
                topP: 0.95,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini story engine:", error);
        if (error instanceof Error && error.message.includes("JSON")) {
             throw new Error("The Abyss Alchemist returned a malformed response. The narrative fabric has torn.");
        }
        throw new Error("The Abyss Alchemist failed to respond. The connection to the forge is lost.");
    }
}

export const initializeStory = async (): Promise<GameState> => {
    const initPrompt = `
${masterPrompt}
### PHASE 1: ABYSSAL IGNITION (Turn 1 Only)
Your task is to generate the entire initial state for the story.

1.  **ToT DELIBERATION:** First, your internal Dramatist personas will propose, critique, and synthesize the optimal opening scene.
2.  **STATE GENERATION:** Based on the winning path, generate the complete initial game state (CYM, MYJ, GoYJ with at least 8 nodes, YL).
3.  **NARRATIVE & CHOICES:** Write the first narrative segment (250-350 words) in the mandated literary style. End with 3 compelling choices corresponding to the initial paths from the starting node in your graph.
4.  **MULTI-MODAL PROMPTS:** Generate the 'imagePrompt', 'speaker' ('Narrator'), and 'ttsText'.

You must output a single JSON object conforming to the schema.
`;
    const storyState = await callStoryEngine(initPrompt, gameStateSchema);
    // Return text-based state immediately for async asset loading
    return {
        ...storyState,
        imageUrl: storyState.imagePrompt,
        ttsAudioBase64: storyState.ttsText,
    };
};

export const advanceStory = async (currentState: GameState, choiceIndex: number): Promise<GameState> => {
    // Strip derived fields before sending to AI
    const { imageUrl, ttsAudioBase64, ...prevState } = currentState;

    // --- LOGIC DECOUPLING REFACTOR ---
    const currentNode = prevState.graphOfYandereJests.nodes.find(n => n.nodeId === prevState.yandereLedger.currentNodeId);
    const availableEdges = prevState.graphOfYandereJests.edges.filter(e => e.fromNode === currentNode?.nodeId);
    const chosenEdge = availableEdges[choiceIndex];

    if (!chosenEdge) {
        throw new Error(`Invalid choice index ${choiceIndex} for node ${currentNode?.nodeId}.`);
    }
    
    const newLedger: YandereLedger = {
        ...prevState.yandereLedger,
        currentNodeId: chosenEdge.toNode,
        subjectAgencyBudget: prevState.yandereLedger.subjectAgencyBudget - chosenEdge.agencyToll,
    };

    const newStateForAI = {
        ...prevState,
        turn: prevState.turn + 1,
        yandereLedger: newLedger
    };

    const advancePrompt = `
${masterPrompt}
### PHASE 2: THE NEXUS OF CHAOS (Turn 2+)
You will advance the story based on a pre-calculated state transition.

**PREVIOUS STATE & NEW STATE:**
*   **Previous Game State:** ${JSON.stringify(prevState)}
*   **NEW CALCULATED STATE:** ${JSON.stringify(newStateForAI)}

**YOUR TASK: CREATIVE NARRATIVE GENERATION (ToT DELIBERATION)**
*Using the NEWLY CALCULATED state as your context, your internal Dramatist personas will execute the Deliberation Process.*
1.  **Propose, Critique, Synthesize:** Determine the winning narrative path for the transition to the new 'psychologicalState' ('${newStateForAI.graphOfYandereJests.nodes.find(n => n.nodeId === newLedger.currentNodeId)?.psychologicalState}').
2.  **Generate Output:** Based on the synthesized path, write the new 'narrative' (250-350 words in the mandated style), 3 new 'playerChoices' for the new node, and the corresponding 'imagePrompt', 'speaker', and 'ttsText'.

**FINAL OUTPUT:** Output only a single, final JSON object containing the creative fields ('narrative', 'playerChoices', 'imagePrompt', 'speaker', 'ttsText'). The state object fields will be merged by the application.
`;
    // The story engine now only needs to return the creative parts.
    const creativeOutputSchema = {
         type: Type.OBJECT,
         properties: {
             narrative: { type: Type.STRING },
             playerChoices: { type: Type.ARRAY, items: { type: Type.STRING } },
             imagePrompt: { type: Type.STRING },
             speaker: { type: Type.STRING },
             ttsText: { type: Type.STRING }
         },
         required: ["narrative", "playerChoices", "imagePrompt", "speaker", "ttsText"]
     };
    
    const creativeState = await callStoryEngine(advancePrompt, creativeOutputSchema);

    // --- ASYNC STREAMING REFACTOR ---
    // Merge new creative state with new logical state and return immediately.
    return {
        ...newStateForAI,
        ...creativeState,
        imageUrl: creativeState.imagePrompt, // Pass prompt for async fetching
        ttsAudioBase64: creativeState.ttsText, // Pass text for async fetching
    };
};
