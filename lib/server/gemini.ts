import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getLocalAiFallback } from "@/features/ai/fallback";

export type GeminiRequest = Omit<
  Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  "model"
>;

const GEMINI_MODEL = "gemini-3.6-flash";

async function requestGemini(apiKey: string, request: GeminiRequest) {
  const gemini = new GoogleGenAI({ apiKey });
  return gemini.models.generateContent({ ...request, model: GEMINI_MODEL });
}

export async function getGeminiResponse(
  input: GeminiRequest & { context: string },
): Promise<{ text: string; fallback: boolean }> {
  const { context, ...request } = input;
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) return { ...getLocalAiFallback(context), fallback: true };

  try {
    const response = await requestGemini(apiKey, request);

    return { text: response.text ?? "", fallback: false };
  } catch (error) {
    console.error("Gemini request failed; using local fallback", error);
    return { ...getLocalAiFallback(context), fallback: true };
  }
}

export async function generateGeminiJson<T>(
  request: GeminiRequest,
  validate: (value: unknown) => T | null,
): Promise<T | null> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await requestGemini(apiKey, request);
    if (!response.text) return null;
    return validate(JSON.parse(response.text) as unknown);
  } catch (error) {
    console.error("Gemini structured request failed", error);
    return null;
  }
}
