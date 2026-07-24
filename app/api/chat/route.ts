import { NextResponse } from 'next/server';
import { buildKaviPersonalizationInstruction } from "@/features/chat/personalization";
import { getGeminiResponse } from '@/lib/server/gemini';

interface ChatRequestBody {
  history?: Array<{ sender?: string; text?: string }>;
  message?: string;
  lessonContext?: string;
  personalization?: unknown;
}

export async function POST(req: Request) {
  try {
    const { history, message, lessonContext, personalization } = await req.json() as ChatRequestBody;
    const personalizationInstruction = buildKaviPersonalizationInstruction(personalization);

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Map history to Gemini contents format
    const contents = (history || []).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    // Append the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await getGeminiResponse({
      context: message,
      contents,
      config: {
        systemInstruction: `Bạn là Kavi, một trợ lý ảo chuyên nghiệp, nhiệt tình và am hiểu về tài chính cá nhân.
Nhiệm vụ của bạn là giải đáp thắc mắc, đưa ra lời khuyên và hỗ trợ người dùng trong quá trình học tập.
Hãy trả lời rõ ràng, dễ hiểu, dùng ngôn ngữ tiếng Việt thân thiện, phù hợp với ngữ cảnh của bài học hiện tại: "${lessonContext}".
QUAN TRỌNG: Bạn CÓ bộ nhớ về toàn bộ lịch sử cuộc trò chuyện (được cung cấp trong prompt). Hãy dựa vào các câu hội thoại trước đó để trả lời. TUYỆT ĐỐI KHÔNG ĐƯỢC nói rằng bạn không lưu trữ hay không nhớ lịch sử trò chuyện.${personalizationInstruction}`,
      },
    });

    return NextResponse.json({ 
      text: response.text 
    });

  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau." }, 
      { status: 500 }
    );
  }
}
