import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not configured.");
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build-ai-teacher",
        },
      },
    });
  }
  return geminiClient;
}

export interface GeminiCallParams {
  contents: any;
  config?: any;
  preferredModel?: string;
  maxRetriesPerModel?: number;
}

const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error?.error?.code || error?.error?.status;
  const msg = String(error.message || error?.error?.message || "").toLowerCase();
  
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  if (status === "UNAVAILABLE" || status === "RESOURCE_EXHAUSTED") {
    return true;
  }
  if (msg.includes("high demand") || msg.includes("unavailable") || msg.includes("spikes in demand") || msg.includes("rate limit") || msg.includes("quota")) {
    return true;
  }
  return false;
}

/**
 * Resilient wrapper around ai.models.generateContent that handles:
 * 1. 503 high demand / service unavailable with automatic model fallback
 * 2. Exponential backoff for transient glitches
 * 3. Fallback progression: gemini-3.8-flash -> gemini-flash-latest -> gemini-3.1-flash-lite
 */
export async function generateGeminiContent(
  params: GeminiCallParams
): Promise<GenerateContentResponse | null> {
  const ai = getGemini();
  if (!ai) return null;

  const initialModel = params.preferredModel || "gemini-3.8-flash";
  const candidateModels = Array.from(new Set([initialModel, ...FALLBACK_MODELS]));
  const maxRetries = params.maxRetriesPerModel ?? 2;

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text !== undefined) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const retryable = isRetryableError(err);
        const errMsg = err?.message || err?.error?.message || String(err);

        // If high-demand or unavailable, don't waste too much time waiting on this specific model; try next model
        if (errMsg.toLowerCase().includes("high demand") || errMsg.toLowerCase().includes("unavailable") || err?.status === 503) {
          console.warn(`[Gemini Resilience] Model "${model}" reported high demand/503. Shifting to alternate model...`);
          break; // Break retry loop on this model, advance to next candidate model
        }

        if (retryable && attempt < maxRetries) {
          const delay = Math.min(800 * Math.pow(2, attempt - 1) + Math.random() * 300, 3000);
          console.warn(`[Gemini Resilience] Model "${model}" attempt ${attempt} failed (${errMsg.slice(0, 80)}). Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
        } else {
          // If not retryable or max retries reached for this model, switch to next model
          break;
        }
      }
    }
  }

  console.error("[Gemini Resilience] All candidate models exhausted for request:", lastError?.message || lastError);
  return null;
}

export function parseJsonFromText<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
    } catch (e) {
      console.error("JSON regex extraction failed:", e);
    }
    return fallback;
  }
}

