import type { Transaction, TransactionType } from "./domain";

export type QuickTransaction = Pick<Transaction, "amount" | "type" | "category" | "date" | "note">;

export type QuickTransactionReady = {
  status: "ready";
  transaction: QuickTransaction;
  confidence: number;
  source: "ai" | "rules";
};

export type QuickTransactionClarification = {
  status: "needs_clarification";
  question: string;
  source: "ai" | "rules";
};

export type QuickTransactionParseResponse = QuickTransactionReady | QuickTransactionClarification;

export type QuickTransactionParseRequest = {
  message: string;
  categories: string[];
  now: number;
};

type ModelCandidate = {
  transaction?: {
    type?: unknown;
    amount?: unknown;
    category?: unknown;
    date?: unknown;
    note?: unknown;
  };
  confidence?: unknown;
};

export const QUICK_TRANSACTION_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["transaction", "confidence"],
  properties: {
    transaction: {
      type: "object",
      additionalProperties: false,
      required: ["type", "amount", "category", "date", "note"],
      properties: {
        type: { type: "string", enum: ["income", "expense"] },
        amount: { type: "integer", minimum: 1 },
        category: { type: "string", minLength: 1, maxLength: 80 },
        date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        note: { type: "string", minLength: 1, maxLength: 160 },
      },
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
} as const;

const STANDARD_CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: "Ăn uống", keywords: ["ăn", "uống", "bánh", "cơm", "phở", "cà phê", "trà sữa", "nhà hàng"] },
  { category: "Nhà ở", keywords: ["nhà", "trọ", "tiền phòng", "điện", "nước"] },
  { category: "Đi lại", keywords: ["xe", "xăng", "grab", "taxi", "gửi xe", "đi lại"] },
  { category: "Học tập", keywords: ["học", "sách", "khóa", "course", "học phí"] },
  { category: "Mua sắm", keywords: ["mua", "quần áo", "giày", "đồ dùng"] },
  { category: "Sức khỏe", keywords: ["bệnh", "thuốc", "khám", "gym"] },
  { category: "Tiền lương", keywords: ["lương", "salary"] },
  { category: "Làm thêm", keywords: ["làm thêm", "freelance", "part-time"] },
  { category: "Thưởng", keywords: ["thưởng", "bonus"] },
];

const INCOME_WORDS = ["nhận", "thu nhập", "lương", "thưởng", "được trả"];
const EXPENSE_WORDS = ["chi", "tiêu", "mua", "ăn", "uống", "trả", "đóng", "thanh toán"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function validCategories(categories: string[]) {
  return Array.from(new Set(categories.map((category) => category.trim()).filter(Boolean))).slice(0, 30);
}

function atMidday(date: Date) {
  date.setHours(12, 0, 0, 0);
  return date.getTime();
}

function toDateTimestamp(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date.getTime() : null;
}

function resolveDate(message: string, now: number) {
  const reference = new Date(now);
  const normalized = normalize(message);
  if (normalized.includes("hom qua")) {
    reference.setDate(reference.getDate() - 1);
    return atMidday(reference);
  }
  if (normalized.includes("hom nay")) return atMidday(reference);

  const weekdays: Array<[RegExp, number]> = [
    [/thu\s*2|thu\s*hai/, 1], [/thu\s*3|thu\s*ba/, 2], [/thu\s*4|thu\s*tu/, 3],
    [/thu\s*5|thu\s*nam/, 4], [/thu\s*6|thu\s*sau/, 5], [/thu\s*7|thu\s*bay/, 6], [/chu\s*nhat/, 0],
  ];
  const weekday = weekdays.find(([pattern]) => pattern.test(normalized));
  if (!weekday) return atMidday(reference);

  const difference = (reference.getDay() - weekday[1] + 7) % 7;
  reference.setDate(reference.getDate() - difference);
  return atMidday(reference);
}

function parseAmount(message: string) {
  const normalized = normalize(message);
  const shorthand = normalized.match(/(?<!\d)(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|tr|trieu)\b/i);
  if (shorthand) {
    const value = Number(shorthand[1].replace(",", "."));
    const multiplier = /^(tr|trieu)$/i.test(shorthand[2]) ? 1_000_000 : 1_000;
    return Number.isFinite(value) ? Math.round(value * multiplier) : null;
  }
  const fullAmount = normalized.match(/(?<!\d)(\d{1,3}(?:[.,]\d{3})+|\d{4,})(?!\d)/);
  return fullAmount ? Number(fullAmount[1].replace(/[.,]/g, "")) : null;
}

function inferType(message: string): TransactionType | null {
  const normalized = normalize(message);
  const includesPhrase = (word: string) => new RegExp(`(^|\\s)${normalize(word).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}(?=\\s|$)`).test(normalized);
  const isIncome = INCOME_WORDS.some(includesPhrase);
  const isExpense = EXPENSE_WORDS.some(includesPhrase);
  if (isIncome === isExpense) return null;
  return isIncome ? "income" : "expense";
}

function selectCategory(message: string, categories: string[]) {
  const normalizedMessage = normalize(message);
  const exact = categories.find((category) => normalizedMessage.includes(normalize(category)));
  if (exact) return exact;

  const standard = STANDARD_CATEGORY_KEYWORDS.find((rule) => rule.keywords.some((keyword) => normalizedMessage.includes(normalize(keyword))))?.category;
  if (!standard) return categories.find((category) => normalize(category) === "khac") ?? null;

  return categories.find((category) => {
    const candidate = normalize(category);
    const canonical = normalize(standard);
    return candidate.includes(canonical) || canonical.includes(candidate);
  }) ?? categories.find((category) => normalize(category) === normalize(standard)) ?? categories.find((category) => normalize(category) === "khac") ?? null;
}

function removeSyntax(message: string) {
  return message
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:k|nghìn|ngàn|triệu|tr)\b/gi, "")
    .replace(/\b\d{1,3}(?:[.,]\d{3})+|\b\d{4,}\b/g, "")
    .replace(/\b(hôm nay|hôm qua|thứ\s*(?:hai|ba|tư|năm|sáu|bảy|[2-7])|chủ nhật)\b/gi, "")
    .replace(/\b(tôi|mình|đã|vừa|tiêu|chi|mua|nhận|được|trả|thanh toán|đóng)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateQuickTransactionCandidate(candidate: unknown, categories: string[], now: number): QuickTransactionReady | null {
  if (typeof candidate !== "object" || candidate === null) return null;
  const value = candidate as ModelCandidate;
  const transaction = value.transaction;
  const allowedCategories = validCategories(categories);
  if (!transaction) return null;
  const { type, amount, category: candidateCategory, date: candidateDate, note: candidateNote } = transaction;
  if ((type !== "income" && type !== "expense") || typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0 || amount > 1_000_000_000 || typeof candidateCategory !== "string" || typeof candidateDate !== "string" || typeof candidateNote !== "string" || typeof value.confidence !== "number" || value.confidence < 0.65 || value.confidence > 1) return null;

  const category = allowedCategories.find((item) => normalize(item) === normalize(candidateCategory));
  const date = toDateTimestamp(candidateDate);
  const note = candidateNote.trim().slice(0, 160);
  if (!category || !date || date > atMidday(new Date(now)) || !note) return null;

  return { status: "ready", transaction: { type, amount, category, date, note }, confidence: value.confidence, source: "ai" };
}

export function parseQuickTransaction(message: string, categories: string[], now: number): QuickTransactionParseResponse {
  const amount = parseAmount(message);
  if (!amount || amount <= 0) return { status: "needs_clarification", question: "Bạn đã chi hoặc nhận bao nhiêu tiền?", source: "rules" };

  const type = inferType(message);
  if (!type) return { status: "needs_clarification", question: "Khoản này là thu hay chi?", source: "rules" };

  const category = selectCategory(message, validCategories(categories));
  if (!category) return { status: "needs_clarification", question: "Khoản này thuộc danh mục nào?", source: "rules" };

  const note = removeSyntax(message) || (type === "income" ? "Khoản thu" : "Khoản chi");
  return { status: "ready", transaction: { type, amount, category, date: resolveDate(message, now), note }, confidence: 0.82, source: "rules" };
}
