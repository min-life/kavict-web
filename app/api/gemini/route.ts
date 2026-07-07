import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_AI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt, systemInstruction } = await request.json();

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction || "Bạn là Kavi - Trợ lý Tài chính AI. Hãy trả lời ngắn gọn, súc tích và thân thiện.",
            temperature: 0.7,
        }
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
