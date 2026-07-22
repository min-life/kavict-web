import "server-only";

import { GoogleGenAI } from "@google/genai";
import { getLocalAiFallback } from "@/features/ai/fallback";

type GeminiRequest = Omit<
  Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  "model"
>;

export async function getGeminiResponse(
  input: GeminiRequest & { context: string },
): Promise<{ text: string }> {
  const { context, ...request } = input;
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) return getLocalAiFallback(context);

  const gemini = new GoogleGenAI({ apiKey });
  const response = await gemini.models.generateContent({
    ...request,
    model: "gemini-2.5-flash",
  });

  return { text: response.text ?? "" };
}
