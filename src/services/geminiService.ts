
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected module import path for types to point to 'src/types/index' which contains the correct definition for CreativeOutput.
import { CreativeOutput } from "src/types/index";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please check your project configuration.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

const creativeOutputSchema = {
    type: Type.OBJECT,
    properties: {
        reasoning: { type: Type.STRING },
        narrative: { type: Type.STRING },
        playerChoices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { id: { type: Type.STRING }, text: { type: Type.STRING } },
                required: ['id', 'text'],
            }
        },
        imagePrompt: { 
            type: Type.OBJECT,
            properties: { prompt: { type: Type.STRING }, negativePrompt: { type: Type.STRING, optional: true } },
            required: ['prompt'],
        },
        speaker: { type: Type.STRING },
        ttsText: { type: Type.STRING }
    },
    required: ["reasoning", "narrative", "playerChoices", "imagePrompt", "speaker", "ttsText"]
};

export const generateStoryTurn = async (prompt: string, previousImageUrl: string | null): Promise<CreativeOutput> => {
    try {
        const contents = [];
        if (previousImageUrl) {
            const base64Data = previousImageUrl.split(',')[1];
            if (base64Data) {
                contents.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
            }
        }
        contents.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: storyModel,
            contents: { parts: contents },
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeOutputSchema,
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
             throw new Error("The Abyss Alchemist returned a malformed response.");
        }
        throw new Error("The Abyss Alchemist failed to respond.");
    }
};

export const generateImage = async (promptObject: { prompt: string; negativePrompt?: string }): Promise<string> => {
    if (!promptObject || !promptObject.prompt) return "";
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: promptObject.prompt,
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
        console.error("Error generating image:", error);
        throw new Error("Image generation failed. The Forge was unable to render a visual.");
    }
};

export const generateSpeech = async (text: string, speaker: string, vocalStyle: string): Promise<string> => {
    if (!text) return "";
    const voiceMap: { [key: string]: string } = {
        'Selene': 'Puck', 'Lyra': 'Kore', 'Aveena': 'Zephyr', 'Mara': 'Charon', 'Eleni': 'Kore',
        'Jared': 'Fenrir', 'Torin': 'Fenrir', 'Eryndor': 'Fenrir', 'Kael': 'Fenrir',
        'Narrator': 'Zephyr'
    };
    const voiceName = voiceMap[speaker] || 'Zephyr';
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
        throw new Error("Speech generation failed. The Forge was unable to generate a voice.");
    }
};
