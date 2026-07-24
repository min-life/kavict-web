import { describe, expect, it } from "vitest";
import {
  parseQuickTransaction,
  validateQuickTransactionCandidate,
} from "./quickTransaction";

const now = new Date("2026-07-24T09:00:00+07:00").getTime();
const categories = ["Ăn uống", "Nhà ở", "Đi lại", "Tiền lương", "Khác"];

describe("quick transaction parser", () => {
  it("parses a Vietnamese expense with k shorthand and today's date", () => {
    expect(parseQuickTransaction("tôi tiêu 20k ăn bánh mì hôm nay", categories, now)).toMatchObject({
      status: "ready",
      source: "rules",
      transaction: { type: "expense", amount: 20_000, category: "Ăn uống", note: expect.stringContaining("bánh mì") },
    });
  });

  it("parses Vietnamese income with million shorthand and yesterday", () => {
    expect(parseQuickTransaction("hôm qua nhận 2 triệu tiền lương", categories, now)).toMatchObject({
      status: "ready",
      transaction: { type: "income", amount: 2_000_000, category: "Tiền lương" },
    });
  });

  it("prefers the user budget category before the standard category", () => {
    const result = parseQuickTransaction("mua bánh mì 20k hôm nay", ["Ăn uống hằng ngày", "Khác"], now);

    expect(result).toMatchObject({ status: "ready", transaction: { category: "Ăn uống hằng ngày" } });
  });

  it("uses the latest stated weekday without creating a future transaction", () => {
    const result = parseQuickTransaction("chi 50 nghìn đi xe thứ hai", categories, now);

    expect(result).toMatchObject({ status: "ready", transaction: { category: "Đi lại", amount: 50_000 } });
    if (result.status === "ready") expect(result.transaction.date).toBe(new Date("2026-07-20T12:00:00").getTime());
  });

  it("asks for clarification rather than inventing a missing amount", () => {
    expect(parseQuickTransaction("hôm qua ăn trưa", categories, now)).toMatchObject({
      status: "needs_clarification",
      source: "rules",
    });
  });

  it("rejects a model candidate with invalid fields", () => {
    expect(validateQuickTransactionCandidate({
      transaction: { type: "expense", amount: -20_000, category: "Ăn uống", date: "2026-07-24", note: "bánh mì" },
      confidence: 1.4,
    }, categories, now)).toBeNull();
  });

  it("rejects a low-confidence model candidate instead of treating it as a draft", () => {
    expect(validateQuickTransactionCandidate({
      transaction: { type: "expense", amount: 20_000, category: "Ăn uống", date: "2026-07-24", note: "bánh mì" },
      confidence: 0.49,
    }, categories, now)).toBeNull();
  });
});
