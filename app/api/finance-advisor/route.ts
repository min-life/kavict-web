import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/server/gemini";
import {
  extractPlanCandidate,
  removePlanCandidate,
  type FinanceAdvisorRequest,
} from "@/features/finance/advisor";

function isAdvisorRequest(value: unknown): value is FinanceAdvisorRequest {
  return typeof value === "object"
    && value !== null
    && typeof (value as { message?: unknown }).message === "string";
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isAdvisorRequest(body) || !body.message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const history = Array.isArray(body.history) ? body.history : [];
    const context = {
      plan: body.plan ?? null,
      monthlySummary: body.monthlySummary ?? { income: 0, expense: 0 },
    };
    const response = await getGeminiResponse({
      context: body.message,
      contents: [
        ...history.map((item) => ({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        })),
        { role: "user", parts: [{ text: body.message }] },
      ],
      config: {
        temperature: 0.5,
        systemInstruction: `Bạn là Kavi Advisor, trợ lý tài chính cá nhân bằng tiếng Việt. Hỏi ngắn gọn, tuần tự để làm rõ số dư hiện tại, thu nhập hàng tháng, chi phí đều đặn, phong cách chi tiêu và mục tiêu. Chỉ sau khi đã có đủ thông tin hãy đưa ra đề xuất bằng lời dễ hiểu. Nếu người dùng đồng ý để xuất plan, kèm đúng một khối JSON đầy đủ cho FinancialPlan với các trường currentBalance, monthlyIncome, fixedExpenses, goals và budgets. Budgets chỉ chứa chi tiêu, không đưa tiết kiệm vào budgets. Dữ liệu hiện tại: ${JSON.stringify(context)}.`,
      },
    });

    return NextResponse.json({
      text: removePlanCandidate(response.text),
      plan: extractPlanCandidate(response.text),
      fallback: response.fallback,
    });
  } catch (error) {
    console.error("Finance advisor API error", error);
    return NextResponse.json(
      { error: "Không thể kết nối Kavi Advisor. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
