import { describe, expect, it, vi } from "vitest";

const { getGeminiResponse } = vi.hoisted(() => ({ getGeminiResponse: vi.fn() }));

vi.mock("@/lib/server/gemini", () => ({ getGeminiResponse }));

import { POST } from "./route";

describe("POST /api/finance-advisor", () => {
  it("rejects a request without a message", async () => {
    const response = await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      body: JSON.stringify({ history: [] }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Message is required" });
  });

  it("returns prose and an optional structured plan from Gemini", async () => {
    getGeminiResponse.mockResolvedValueOnce({
      text: `Kế hoạch đề xuất:\n\`\`\`json\n{"currentBalance":2000000,"monthlyIncome":8000000,"fixedExpenses":[],"goals":[],"budgets":[]}\n\`\`\``,
    });

    const response = await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Mình thu nhập 8 triệu", history: [], plan: null,
        monthlySummary: { income: 0, expense: 0 },
      }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      text: "Kế hoạch đề xuất:",
      plan: { monthlyIncome: 8_000_000, budgets: [] },
    });
    expect(getGeminiResponse).toHaveBeenCalledOnce();
  });
});
