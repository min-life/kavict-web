import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLocalAiFallback } from "@/features/ai/fallback";

const { generateContent } = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));
vi.mock("server-only", () => ({}));

import { generateGeminiJson, getGeminiResponse } from "@/lib/server/gemini";

describe("local AI fallback", () => {
  it("returns useful Vietnamese copy without an API key", () => {
    expect(getLocalAiFallback("lập ngân sách").text).toContain("chế độ demo local");
  });
});

describe("Gemini model selection", () => {
  const originalApiKey = process.env.GOOGLE_GENAI_API_KEY;

  beforeEach(() => {
    process.env.GOOGLE_GENAI_API_KEY = "test-key";
    generateContent.mockResolvedValue({ text: "Kavi sẵn sàng hỗ trợ." });
  });

  afterEach(() => {
    generateContent.mockReset();
    if (originalApiKey) process.env.GOOGLE_GENAI_API_KEY = originalApiKey;
    else delete process.env.GOOGLE_GENAI_API_KEY;
  });

  it("uses the supported Gemini 3.6 Flash model", async () => {
    await getGeminiResponse({
      context: "Tư vấn ngân sách",
      contents: "Tư vấn ngân sách",
      config: {},
    });

    expect(generateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: "gemini-3.6-flash",
    }));
  });

  it("returns structured data only after the caller validator accepts it", async () => {
    generateContent.mockResolvedValueOnce({ text: '{"amount":20000}' });

    const result = await generateGeminiJson({
      contents: "tôi tiêu 20k",
      config: { responseMimeType: "application/json" },
    }, (value) => {
      const amount = (value as { amount?: unknown }).amount;
      return typeof amount === "number" && amount > 0 ? { amount } : null;
    });

    expect(result).toEqual({ amount: 20_000 });
  });

  it("returns null for invalid structured JSON", async () => {
    generateContent.mockResolvedValueOnce({ text: "not json" });

    await expect(generateGeminiJson({ contents: "tôi tiêu 20k", config: {} }, () => ({ amount: 20_000 }))).resolves.toBeNull();
  });
});
