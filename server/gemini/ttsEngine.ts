import { getGemini } from "./client";

export interface TTSAudioResult {
  audioBase64: string;
  mimeType: string;
}

function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;

  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function generateTTSAudio(
  text: string,
  voiceName: string = "Kore"
): Promise<TTSAudioResult | null> {
  const ai = getGemini();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: text.slice(0, 800), // optimal speech chunk length
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Kore",
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    for (const p of parts) {
      if (p.inlineData && p.inlineData.data) {
        const rawMime = p.inlineData.mimeType || "";
        const rawBuffer = Buffer.from(p.inlineData.data, "base64");

        // If it's already a valid RIFF WAVE or MP3, return as is
        if (
          rawBuffer.subarray(0, 4).toString("ascii") === "RIFF" ||
          rawBuffer.subarray(0, 3).toString("ascii") === "ID3"
        ) {
          return {
            audioBase64: p.inlineData.data,
            mimeType: rawMime.includes("audio/") ? rawMime : "audio/wav",
          };
        }

        // Parse sample rate and channels if provided in mimeType e.g. "audio/l16; rate=24000; channels=1"
        const rateMatch = rawMime.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        const channelsMatch = rawMime.match(/channels=(\d+)/);
        const channels = channelsMatch ? parseInt(channelsMatch[1], 10) : 1;

        // Wrap raw 16-bit linear PCM in standard RIFF WAV header
        const wavBuffer = pcmToWav(rawBuffer, sampleRate, channels, 16);
        return {
          audioBase64: wavBuffer.toString("base64"),
          mimeType: "audio/wav",
        };
      }
    }
    return null;
  } catch (err) {
    // Graceful fallback to browser speech synthesis
    console.warn("Gemini TTS service unavailable, falling back to Web Speech:", err);
    return null;
  }
}
