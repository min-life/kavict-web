import { describe, expect, it } from "vitest";
import { getLocalAiFallback } from "@/features/ai/fallback";

describe("local AI fallback", () => {
  it("returns useful Vietnamese copy without an API key", () => {
    expect(getLocalAiFallback("lập ngân sách").text).toContain("chế độ demo local");
  });
});
