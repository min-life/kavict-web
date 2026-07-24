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

import { getGeminiResponse } from "@/lib/server/gemini";

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
});
