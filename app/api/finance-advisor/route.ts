import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/server/gemini";
import {
  extractPlanCandidate,
  isAdvisorTransactionContext,
  isAdvisorUseCase,
  removePlanCandidate,
  type FinanceAdvisorRequest,
} from "@/features/finance/advisor";
import { createAdvisorSystemInstruction } from "@/lib/server/financeAdvisorPrompts";

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
    const useCase = isAdvisorUseCase(body.useCase) ? body.useCase : "general-advice";
    const transactions = Array.isArray(body.transactions)
      ? body.transactions.filter(isAdvisorTransactionContext).slice(-100)
      : [];
    const context = {
      plan: body.plan ?? null,
      monthlySummary: body.monthlySummary ?? { income: 0, expense: 0 },
      transactions,
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
        systemInstruction: createAdvisorSystemInstruction(useCase, context),
      },
    });

    return NextResponse.json({
      text: removePlanCandidate(response.text),
      plan: extractPlanCandidate(response.text, context.plan),
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
