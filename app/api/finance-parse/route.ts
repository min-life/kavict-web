import { NextResponse } from "next/server";
import { generateGeminiJson } from "@/lib/server/gemini";
import {
  parseQuickTransaction,
  QUICK_TRANSACTION_RESPONSE_SCHEMA,
  validateQuickTransactionCandidate,
  type QuickTransactionParseRequest,
} from "@/features/finance/quickTransaction";

function isParseRequest(value: unknown): value is QuickTransactionParseRequest {
  return typeof value === "object"
    && value !== null
    && typeof (value as { message?: unknown }).message === "string"
    && (value as { message: string }).message.trim().length > 0
    && (value as { message: string }).message.length <= 500
    && Array.isArray((value as { categories?: unknown }).categories)
    && (value as { categories: unknown[] }).categories.length <= 30
    && (value as { categories: unknown[] }).categories.every((category) => typeof category === "string" && category.trim().length > 0 && category.length <= 80)
    && typeof (value as { now?: unknown }).now === "number"
    && Number.isFinite((value as { now: number }).now);
}

function buildInstruction(categories: string[], now: number) {
  return `Bạn là bộ trích xuất một giao dịch tài chính bằng tiếng Việt. Chỉ trả về JSON khớp JSON Schema, không trả markdown hay giải thích. Không suy đoán số tiền, loại thu/chi, danh mục, hoặc ngày. Nếu câu mơ hồ, trả confidence dưới 0.5; vẫn điền giá trị hợp lý nhất để máy chủ sẽ quyết định có dùng hay không. Số tiền là VND nguyên dương. Ngày phải là YYYY-MM-DD, suy ra “hôm nay”, “hôm qua”, và “thứ hai” từ thời điểm tham chiếu ${new Date(now).toISOString()}. Chỉ dùng một trong các danh mục sau: ${JSON.stringify(categories)}. Ưu tiên chính xác danh mục người dùng đã có.`;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isParseRequest(body)) return NextResponse.json({ error: "Invalid transaction parse request" }, { status: 400 });

  const fallback = () => parseQuickTransaction(body.message.trim(), body.categories, body.now);
  const parsed = await generateGeminiJson({
    contents: body.message,
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseJsonSchema: QUICK_TRANSACTION_RESPONSE_SCHEMA,
      systemInstruction: buildInstruction(body.categories, body.now),
    },
  }, (candidate) => validateQuickTransactionCandidate(candidate, body.categories, body.now));
  return NextResponse.json(parsed ?? fallback());
}
