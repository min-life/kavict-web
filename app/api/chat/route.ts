import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { history, message, lessonContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Map history to Gemini contents format
    const contents = (history || []).map((h: any) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Append the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: `Bạn là Kavi, một trợ lý ảo chuyên nghiệp, nhiệt tình và am hiểu về tài chính cá nhân.
Nhiệm vụ của bạn là giải đáp thắc mắc, đưa ra lời khuyên và hỗ trợ người dùng trong quá trình học tập.
Hãy trả lời ngắn gọn, dễ hiểu, dùng ngôn ngữ tiếng Việt thân thiện, phù hợp với ngữ cảnh của bài học hiện tại: "${lessonContext}".
QUAN TRỌNG: Bạn CÓ bộ nhớ về toàn bộ lịch sử cuộc trò chuyện (được cung cấp trong prompt). Hãy dựa vào các câu hội thoại trước đó để trả lời. TUYỆT ĐỐI KHÔNG ĐƯỢC nói rằng bạn không lưu trữ hay không nhớ lịch sử trò chuyện.`,
      }
    });

    return NextResponse.json({ 
      text: response.text 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau." }, 
      { status: 500 }
    );
  }
}
