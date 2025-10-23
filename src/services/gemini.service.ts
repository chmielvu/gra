import { GoogleGenAI, Type } from "@google/genai";
import { CreativeOutput } from '../shared/types/index';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

// Defines the strict JSON schema the AI must follow.
const creativeOutputSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: { type: Type.STRING, description: "A step-by-step thought process for how you arrived at the creative choices, synthesizing the provided context." },
        narrative: { type: Type.STRING, description: "The main narrative text of the scene, written in a compelling, literary style." },
        playerChoices: {
            type: Type.ARRAY,
            description: "An array of 2-4 distinct choices for the player.",
            items: {
                type: Type.OBJECT,
                properties: { 
                    id: { type: Type.STRING, description: "The unique identifier for the choice, matching the Event Template." }, 
                    text: { type: Type.STRING, description: "The descriptive text for the player's choice." } 
                },
                required: ['id', 'text'],
            }
        },
        imagePrompt: { 
            type: Type.OBJECT,
            description: "A prompt for an image generation model to create a visual for the scene.",
            properties: { 
                prompt: { type: Type.STRING, description: "A detailed, evocative description for the image, including style, lighting, and composition." }, 
                negativePrompt: { type: Type.STRING, optional: true, description: "Elements to exclude from the image." } 
            },
            required: ['prompt'],
        },
        speaker: { type: Type.STRING, description: "The name of the character who is the primary speaker in the scene, or 'Narrator'." },
        ttsText: { type: Type.STRING, description: "A concise line of dialogue or narrative summary for text-to-speech generation." },
        vocalStyle: { type: Type.STRING, description: "A bracketed cue describing the vocal performance, e.g., '[curtly]', '[with false sympathy]'." },
    },
    required: ["reasoning", "narrative", "playerChoices", "imagePrompt", "speaker", "ttsText", "vocalStyle"]
};


export const api = {
  generateStoryTurn: async (prompt: string): Promise<CreativeOutput> => {
    try {
      const response = await ai.models.generateContent({
            model: storyModel,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeOutputSchema,
                temperature: 1.0, 
                topP: 0.95,
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini story engine:", error);
        throw new Error("The Abyss Alchemist failed to respond.");
    }
  },

  generateImage: async (promptObject: { prompt: string; negativePrompt?: string }): Promise<string> => {
    if (!promptObject || !promptObject.prompt) return "";
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: `hyper-realistic, dark fantasy digital painting, ${promptObject.prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
                negativePrompt: promptObject.negativePrompt,
            },
        });
        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
        if (!base64ImageBytes) throw new Error("Image generation returned no data.");
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error)
        throw new Error("Image generation failed.");
    }
  },

  generateSpeech: async (text: string, speaker: string, vocalStyle: string): Promise<string> => {
    if (!text) return "";
    const voiceMap: { [key: string]: string } = {
        'Selene': 'Puck', 'Lyra': 'Kore', 'Aveena': 'Zephyr', 'Mara': 'Charon',
        'Narrator': 'Zephyr'
    };
    const voiceName = voiceMap[speaker] || 'Fenrir';
    const ttsPrompt = `Say ${vocalStyle}: ${text.replace(/\[.*?\]/g, '').trim()}`;

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
        throw new Error("Speech generation failed.");
    }
  }
};