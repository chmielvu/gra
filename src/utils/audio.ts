
import { MutableRefObject } from 'react';

// Base64 decoding function
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Function to decode raw PCM data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000, // TTS model default sample rate
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const playAudio = async (
  base64Audio: string, 
  audioContext: AudioContext,
  audioSourceRef: MutableRefObject<AudioBufferSourceNode | null>
) => {
  try {
     if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch(e) {
          // May throw if already stopped
        }
    }
    
    const audioData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioData, audioContext);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    audioSourceRef.current = source;

  } catch (error) {
    console.error('Failed to play audio:', error);
  }
};
