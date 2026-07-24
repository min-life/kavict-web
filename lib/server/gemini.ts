import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getLocalAiFallback } from "@/features/ai/fallback";

type GeminiRequest = Omit<
  Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  "model"
>;

export async function getGeminiResponse(
  input: GeminiRequest & { context: string },
): Promise<{ text: string; fallback: boolean }> {
  const { context, ...request } = input;
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) return { ...getLocalAiFallback(context), fallback: true };

  try {
    const gemini = new GoogleGenAI({ apiKey });
    const response = await gemini.models.generateContent({
      ...request,
      model: "gemini-3.6-flash",
    });

    return { text: response.text ?? "", fallback: false };
  } catch (error) {
    console.error("Gemini request failed; using local fallback", error);
    return { ...getLocalAiFallback(context), fallback: true };
  }
}
