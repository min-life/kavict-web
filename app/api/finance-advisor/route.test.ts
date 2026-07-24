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

  it("uses the selected financial-planning instruction", async () => {
    getGeminiResponse.mockResolvedValueOnce({ text: "Hãy bắt đầu bằng mục tiêu của bạn." });

    await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Mình muốn lập kế hoạch tiết kiệm",
        history: [],
        useCase: "financial-planning",
        plan: null,
        monthlySummary: { income: 0, expense: 0 },
      }),
    }));

    expect(getGeminiResponse).toHaveBeenLastCalledWith(expect.objectContaining({
      config: expect.objectContaining({ systemInstruction: expect.stringContaining("Lập kế hoạch tài chính") }),
    }));
  });

  it("asks Kavi to return the spending, income, and objective plan sections", async () => {
    getGeminiResponse.mockResolvedValueOnce({ text: "Mình cần thêm một chút thông tin." });

    await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Hãy điều chỉnh kế hoạch của mình",
        history: [],
        useCase: "plan-adjustment",
        plan: null,
        monthlySummary: { income: 0, expense: 0 },
      }),
    }));

    const instruction = getGeminiResponse.mock.calls.at(-1)?.[0].config.systemInstruction;
    expect(instruction).toContain("incomePlans");
    expect(instruction).toContain("objectives");
    expect(instruction).toContain("không đổi");
  });

  it("includes recorded transactions only for spending analysis", async () => {
    getGeminiResponse.mockResolvedValueOnce({ text: "Bạn đang chi nhiều cho ăn uống." });

    await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Phân tích chi tiêu giúp mình",
        history: [],
        useCase: "spending-analysis",
        plan: null,
        monthlySummary: { income: 0, expense: 250000 },
        transactions: [{ date: 1721433600000, type: "expense", category: "Ăn uống", amount: 250000, note: "Ăn trưa" }],
      }),
    }));

    expect(getGeminiResponse).toHaveBeenLastCalledWith(expect.objectContaining({
      config: expect.objectContaining({ systemInstruction: expect.stringContaining("Ăn trưa") }),
    }));
  });

  it("does not include transaction history for other advice modes", async () => {
    getGeminiResponse.mockResolvedValueOnce({ text: "Hãy cho mình biết mục tiêu của bạn." });

    await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Tư vấn giúp mình",
        history: [],
        useCase: "financial-advice",
        plan: null,
        monthlySummary: { income: 0, expense: 0 },
        transactions: [{ date: 1721433600000, type: "expense", category: "Ăn uống", amount: 250000, note: "Chi tiết riêng tư" }],
      }),
    }));

    expect(getGeminiResponse).toHaveBeenLastCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        systemInstruction: expect.stringContaining("Tư vấn cho bạn về tài chính"),
      }),
    }));
    expect(getGeminiResponse.mock.calls.at(-1)?.[0].config.systemInstruction).not.toContain("Chi tiết riêng tư");
  });

  it("marks the response as a fallback when Gemini is unavailable", async () => {
    getGeminiResponse.mockResolvedValueOnce({
      text: "Phản hồi mẫu local",
      fallback: true,
    });

    const response = await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Xin chào", history: [], plan: null, monthlySummary: { income: 0, expense: 0 } }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      text: "Phản hồi mẫu local",
      fallback: true,
    });
  });
});
