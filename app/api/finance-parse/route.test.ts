import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateGeminiJson, getGeminiResponse } = vi.hoisted(() => ({ generateGeminiJson: vi.fn(), getGeminiResponse: vi.fn() }));
vi.mock("@/lib/server/gemini", () => ({ generateGeminiJson, getGeminiResponse }));

import { POST } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/finance-parse", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("POST /api/finance-parse", () => {
  const originalApiKey = process.env.GOOGLE_GENAI_API_KEY;

  beforeEach(() => {
    generateGeminiJson.mockReset();
    getGeminiResponse.mockReset();
    delete process.env.GOOGLE_GENAI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.GOOGLE_GENAI_API_KEY;
    else process.env.GOOGLE_GENAI_API_KEY = originalApiKey;
  });

  it("rejects invalid request bodies", async () => {
    const response = await POST(request({ message: "ăn bánh mì 20k" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid transaction parse request" });
  });

  it("uses the deterministic parser when Gemini is unavailable", async () => {
    const response = await POST(request({
      message: "tôi tiêu 20k ăn bánh mì hôm nay",
      categories: ["Ăn uống", "Khác"],
      now: new Date("2026-07-24T09:00:00+07:00").getTime(),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ready",
      source: "rules",
      transaction: { amount: 20_000, type: "expense", category: "Ăn uống" },
    });
    expect(generateGeminiJson).toHaveBeenCalledOnce();
  });

  it("does not trust a malformed Gemini candidate and falls back to rules", async () => {
    process.env.GOOGLE_GENAI_API_KEY = "test-only";
    generateGeminiJson.mockResolvedValueOnce(null);

    const response = await POST(request({
      message: "tôi tiêu 20k ăn bánh mì hôm nay",
      categories: ["Ăn uống", "Khác"],
      now: new Date("2026-07-24T09:00:00+07:00").getTime(),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ready", source: "rules", transaction: { amount: 20_000 } });
    expect(generateGeminiJson).toHaveBeenCalledOnce();
  });

  it("returns a validated Gemini draft and requests JSON Schema output", async () => {
    process.env.GOOGLE_GENAI_API_KEY = "test-only";
    generateGeminiJson.mockResolvedValueOnce({
      status: "ready",
      source: "ai",
      confidence: 0.98,
      transaction: { type: "expense", amount: 20_000, category: "Ăn uống", date: new Date("2026-07-24T12:00:00").getTime(), note: "Ăn bánh mì" },
    });

    const response = await POST(request({
      message: "tôi tiêu 20k ăn bánh mì hôm nay",
      categories: ["Ăn uống", "Khác"],
      now: new Date("2026-07-24T09:00:00+07:00").getTime(),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ready", source: "ai", transaction: { amount: 20_000 } });
    expect(generateGeminiJson).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({ responseMimeType: "application/json", responseJsonSchema: expect.any(Object) }),
    }), expect.any(Function));
  });
});
