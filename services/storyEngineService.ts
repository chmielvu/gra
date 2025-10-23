
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, YandereLedger, GoYJEdge } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

// --- FORGE v5.0: INSPIRATION_LIBRARY (Simulated RAG Knowledge Base) ---
// This constant translates the project's research bible into a prompt-injectable format.
const INSPIRATION_LIBRARY: { [key: string]: string[] } = {
  // 1.1 Psychology & Power Dynamics
  "PSYCHOLOGY_GENERAL": [
    "#Psychology (Castration Anxiety): Frame torment not just as physical pain, but as a symbolic threat to the subject's identity, power, and status. The goal is emasculation. Reference the fear of the 'castrating woman' (femme castratrice).",
    "#Psychology (Hurt/Comfort): Enact Lyra's methodology. Position her as both the source of a subject's suffering and their only source of relief. This is a non-consensual trauma bonding dynamic.",
    "#Psychology (Male Submission): In moments of breaking, a subject may find a perverse sense of release in relinquishing the pressure to be 'alpha.' This is not consent, but a trauma response that mimics the 'subspace' of consensual BDSM.",
    "#Psychology (Shame & Identity Loss): The core psychological goal is to instill a deep, isolating shame, leading to an annihilation of former identity.",
    "#Theme (Covenant of Vulnerability): Frame the Forge's rituals as a deliberate, perverse inversion of the ancient Roman oath where men held testicles as a sign of mutual trust. Here, vulnerability is imposed, not offered.",
    "#Theme (Weaponized Sexuality): The educators, like the sorceresses of The Witcher, use their sexuality as a tool for manipulation and control. Their beauty is a weapon."
  ],
  // 1.2 Character Archetypes & Visual Templates
  "CHARACTER_SELENE": [
    "#Character (Selene - Core): Sadistic tyrant, revels in absolute control. Blends brutality with a seductive, regal charm.",
    "#Character (Selene - Visuals): Evoke the fiery, destructive power of Image 1 (Fire Sorceress) and the cool, confident cruelty of Image 1 (Cersei). Attire is revealing crimson, presence is commanding."
  ],
  "CHARACTER_LYRA": [
    "#Character (Lyra - Core): Psychologically dominant, feeds on suffering under a veneer of care. Master of the 'Hurt/Comfort' dynamic.",
    "#Character (Lyra - Visuals): Her aesthetic is Vampire Noir. Emulate the quiet, intellectual dominance of Image 10 (Yennefer reading) and the predatory sensuality of Image 3 (Dornish seduction) and Image 8 (B&W Sorceress)."
  ],
  "CHARACTER_AVEENA": [
    "#Character (Aveena - Core): Balances cruelty with guilt. Seeks redemption but is drawn to the thrill of power. Often awkward.",
    "#Character (Aveena - Visuals): Her look is practical and athletic. Image 4 (Triss Merigold) captures her potential for warmth, contrasted with the consequences of her actions."
  ],
  "CHARACTER_SUBJECT": [
    "#Character (The Subjects - Core): Their journey is one of identity annihilation, mirroring Theon Greyjoy's transformation into 'Reek.' They are defined by their trauma.",
    "#Character (The Subjects - Visuals): Image 5 (Ciri/Geralt shadow) is the key visual metaphor: a character defined and overshadowed by a powerful, dark presence (their trauma, their tormentor)."
  ],
  // 1.3 Aesthetic & Sensory Directives
  "AESTHETIC_GENERAL": [
    "#Aesthetic (Architecture): Describe the setting as 'Roman Imperialism meets Gothic Decay.' Massive, monumental structures of raw concrete, left to crumble and stain like the ruins of Velen in The Witcher.",
    "#Aesthetic (Lighting): The lighting is 'Vampire Noir.' Deep, oppressive shadows punctuated by the stark, sickly yellow-green hiss of gas lamps. Magical acts should flare with vibrant, unnatural light.",
    "#Aesthetic (Ritual): Frame scenes of torment as dark rituals. Composition is a 'classical tableau of dominance,' inspired by Image 2/5 (Gaslamp BDSM). Mood is methodical, clinical control, not chaotic violence.",
    "#Aesthetic (Symbolic Violence): Moments of direct threat or attack should emulate the energy of Image 6 (knife threat) and Image 7 (Roman victory). The focus is on the implication of violence and total dominance."
  ],
  "SENSORY_GENERAL": [
    "#Sensory (Pain - The Groin Strike): Use a multi-stage description: 1) The initial sharp, electric shock. 2) The 'referred pain' blooming into a deep, sickening ache in the stomach. 3) The systemic shock: nausea, dizziness, the world tilting. It is a 'full-body crisis.'",
    "#Sensory (Sound): Emphasize the acoustics of the Brutalist setting: echoing footsteps, distant clangs, the constant low hiss of gas lamps. Introduce a subliminal, low-frequency hum (infrasound)."
  ],
  // Node-specific inspirations for the expanded graph
  "THE_CLEANSING_BATHHOUSE": [
    "#Aesthetic (Location): A node inspired by Roman baths, but with the decaying aesthetic of the Forge. A place for scenes of forced intimacy, vulnerability, and psychological games.",
    "#Aesthetic (Visuals): Evoke the sensuality and danger of Image 2, 3, 6 (Witcher bath/seduction scenes)."
  ],
  "THE_RECALIBRATION_CHAMBER": [
    "#Aesthetic (Location): A clinical, terrifying space for direct, ritualistic torment.",
    "#Aesthetic (Visuals): The aesthetic is pure Gaslamp BDSM, as seen in Image 2/5."
  ],
  "THE_SCHOLARLY_VIVISECTION": [
      "#Aesthetic (Location): Mara's study. A place for more clinical, psychological observation, contrasting with the overt brutality elsewhere."
  ]
};


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
                            // --- v5.0 Expansion ---
                            edgeType: { type: Type.STRING, description: "Type of choice: 'standard', 'falseHope', 'traumaBond', 'symbolicDefiance'" },
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
                 // --- v5.0 Expansion ---
                traumaLevel: { type: Type.NUMBER },
                hopeLevel: { type: Type.NUMBER },
                physicalIntegrity: { type: Type.NUMBER },
                interpersonalBonds: { 
                    type: Type.OBJECT,
                    properties: {}, // Allows any string key
                },
            },
            required: [
                'currentNodeId', 'subjectAgencyBudget', 'activeArchetypeRoster', 
                'shamePainAbyssLevel', 'emergentCharacterPool', 'traumaLevel',
                'hopeLevel', 'physicalIntegrity', 'interpersonalBonds'
            ]
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
    if (!prompt) {
      console.warn("generateImage called with an empty prompt.");
      return ""; // Return an empty string or a placeholder if there's no prompt
    }
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
    if (!text) {
        console.warn("generateSpeech called with empty text.");
        return "";
    }
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
    // Find all cues like [whispering breathlessly] using a global regex
    const cueMatches = text.match(/\[(.*?)\]/g);
    
    if (cueMatches && cueMatches.length > 0) {
        // Extract the text content from all cues
        const cues = cueMatches.map(match => match.slice(1, -1));
        const cueSummary = cues.join(', '); // e.g., "whispering, then angry"
        
        // Remove all cues from the text to avoid the TTS reading them literally
        const cleanText = text.replace(/\[.*?\]/g, '').replace(/,$/, '').trim();
        
        // Reformat the prompt to be more descriptive for the TTS model
        ttsPrompt = `In a tone that is ${cueSummary}, say: ${cleanText}`;
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
2.  **STATE GENERATION:** Based on the winning path, generate the complete initial game state (CYM, MYJ, GoYJ with at least 8 nodes, YL). When generating the graph, use the new 'edgeType' property on edges where appropriate ('falseHope', 'traumaBond', 'symbolicDefiance'). Ensure the new YandereLedger fields (traumaLevel, hopeLevel, etc.) are initialized appropriately (e.g., traumaLevel: 0, hopeLevel: 100, physicalIntegrity: 100, interpersonalBonds: {}).
3.  **NARRATIVE & CHOICES:** Write the first narrative segment (250-350 words) in the mandated literary style. End with 3 compelling choices corresponding to the initial paths from the starting node in your graph.
4.  **MULTI-MODAL PROMPTS:** Generate the 'imagePrompt', 'speaker' ('Narrator'), and 'ttsText'.

You must output a single JSON object conforming to the schema.
`;
    // ASYNC REFACTOR: This function now only fetches the text-based state.
    // The image and audio will be fetched by the frontend component.
    const storyState = await callStoryEngine(initPrompt, gameStateSchema);
    return {
        ...storyState,
        imageUrl: storyState.imagePrompt, // Pass the prompt itself
        ttsAudioBase64: storyState.ttsText, // Pass the text itself
    };
};

export const advanceStory = async (currentState: GameState, choiceIndex: number): Promise<GameState> => {
    // Strip derived/frontend-only fields before sending to AI
    const { imageUrl, ttsAudioBase64, ...prevState } = currentState;

    // --- LOGIC DECOUPLING REFACTOR (Forge v5.0) ---
    // This logic is now handled in TypeScript, not by the AI.
    const currentNode = prevState.graphOfYandereJests.nodes.find(n => n.nodeId === prevState.yandereLedger.currentNodeId);
    if (!currentNode) {
         throw new Error(`Could not find current node with ID: ${prevState.yandereLedger.currentNodeId}`);
    }
    const availableEdges = prevState.graphOfYandereJests.edges.filter(e => e.fromNode === currentNode.nodeId);
    const chosenEdge: GoYJEdge | undefined = availableEdges[choiceIndex];

    if (!chosenEdge) {
        throw new Error(`Invalid choice index ${choiceIndex} for node ${currentNode.nodeId}. No corresponding edge found.`);
    }
    
    // --- v5.0 Stats Logic ---
    const currentLedger = prevState.yandereLedger;
    let newTrauma = currentLedger.traumaLevel;
    let newHope = currentLedger.hopeLevel;
    let newPhysicalIntegrity = currentLedger.physicalIntegrity;

    // Apply stat changes based on the type of choice made
    switch (chosenEdge.edgeType) {
        case 'falseHope':
            newTrauma += 20; // Massive psychological damage from betrayal
            newHope = Math.max(0, newHope - 15);
            break;
        case 'symbolicDefiance':
            newPhysicalIntegrity -= chosenEdge.agencyToll; // Defiance has a high physical cost
            newHope = Math.min(100, newHope + 10); // But it restores some hope
            newTrauma += 5;
            break;
        case 'traumaBond':
            newTrauma += 10;
            // Hope might slightly increase in a twisted way, representing reliance on the abuser
            newHope = Math.min(100, newHope + 2); 
            break;
        default: // 'standard' or undefined
            newTrauma += 5;
            newHope = Math.max(0, newHope - 2);
            newPhysicalIntegrity -= 2; // Minor wear and tear
            break;
    }

    // Update the ledger with the new calculated state
    const newLedger: YandereLedger = {
        ...currentLedger,
        currentNodeId: chosenEdge.toNode,
        subjectAgencyBudget: currentLedger.subjectAgencyBudget - chosenEdge.agencyToll,
        traumaLevel: newTrauma,
        hopeLevel: newHope,
        physicalIntegrity: Math.max(0, newPhysicalIntegrity), // Ensure it doesn't go below 0
        // NOTE: interpersonalBonds update logic would be more complex and is best handled by the AI's narrative generation for now.
    };

    const newStateForAI = { ...prevState, turn: prevState.turn + 1, yandereLedger: newLedger };
    const nextNode = newStateForAI.graphOfYandereJests.nodes.find(n => n.nodeId === newLedger.currentNodeId);
    const prevNodeId = prevState.yandereLedger.currentNodeId;

    // --- RAG SIMULATION ENHANCEMENT (Forge v5.0) ---
    // Gather inspirations from the new node, the previous node, general themes, and active characters.
    const inspirations = [
        ...(INSPIRATION_LIBRARY[nextNode?.nodeId || ''] || []),
        ...(INSPIRATION_LIBRARY[prevNodeId] || []), // <<< NEW: Inspiration from the previous node for emotional continuity
        ...(INSPIRATION_LIBRARY['PSYCHOLOGY_GENERAL'] || []),
        ...(INSPIRATION_LIBRARY['AESTHETIC_GENERAL'] || []),
        ...(INSPIRATION_LIBRARY['SENSORY_GENERAL'] || []),
    ];
    newStateForAI.yandereLedger.activeArchetypeRoster.forEach(char => {
        const charKey = `CHARACTER_${char.character.toUpperCase()}`;
        if (INSPIRATION_LIBRARY[charKey]) {
            inspirations.push(...INSPIRATION_LIBRARY[charKey]);
        }
    });
    
    // REFACTORED: More explicit instructions for the AI on how to use the inspirations.
    const inspirationText = inspirations.length > 0 
        ? `\n**USE THIS DIRECT INSPIRATION FROM CENTRAL STORAGE:**\n${[...new Set(inspirations)].join('\n')}\n
**YOUR TASK: SYNTHESIZE & GENERATE**
Your primary task is to synthesize the provided inspirations and the calculated state into a cohesive, multi-sensory narrative turn. Follow these steps:
1.  **Analyze Context:** Consider the psychological shift from the 'Previous Game State' to the 'NEW CALCULATED STATE'. Note the change in \`currentNodeId\` and the updated \`YandereLedger\` stats (especially \`traumaLevel\`, \`hopeLevel\`).
2.  **Synthesize Inspirations:** The 'INSPIRATION' provides the creative DNA for this scene.
    *   **Thematic Core:** Use the #Theme and #Psychology snippets to define the central emotional conflict.
    *   **Character Voice:** Use the #Character snippets to dictate actions and dialogue.
    *   **Aesthetic & Sensory Palette:** Use the #Aesthetic and #Sensory snippets to build the 'Baroque Brutalism' atmosphere in both the \`narrative\` prose and the \`imagePrompt\`.
3.  **Generate Creative Output:** Based on this synthesis, generate the required creative fields. A high \`traumaLevel\` might result in fragmented sentences. Low \`hopeLevel\` should evoke despair.`
        : '';

    const advancePrompt = `
${masterPrompt}
### PHASE 2: THE NEXUS OF CHAOS (Turn 2+)
You will advance the story based on a pre-calculated state transition.

**CONTEXT:**
*   **Previous Game State:** ${JSON.stringify(prevState)}
*   **NEW CALCULATED STATE:** ${JSON.stringify(newStateForAI)}
${inspirationText}

**INSTRUCTION: CREATIVE NARRATIVE GENERATION (ToT DELIBERATION)**
Based on the NEW CALCULATED state and the DIRECT INSPIRATION above, your internal Dramatist personas will determine the winning narrative path for the transition to the new 'psychologicalState' ('${nextNode?.psychologicalState}'). Then, generate the new 'narrative' (250-350 words), 3 new 'playerChoices' for the new node, and the corresponding 'imagePrompt', 'speaker', and 'ttsText'.

**FINAL OUTPUT:** Output only a single JSON object containing just the creative fields: 'narrative', 'playerChoices', 'imagePrompt', 'speaker', and 'ttsText'.
`;
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

    // ASYNC REFACTOR: Merge and return immediately with prompts/text for assets
    return {
        ...newStateForAI,
        ...creativeState,
        imageUrl: creativeState.imagePrompt,
        ttsAudioBase64: creativeState.ttsText,
    };
};