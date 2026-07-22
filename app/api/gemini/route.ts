import { NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/server/gemini';

export async function POST(request: Request) {
  try {
    const { prompt, systemInstruction } = await request.json();

    const response = await getGeminiResponse({
        context: prompt,
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
