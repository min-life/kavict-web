import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("profile page editing contract", () => {
  it("renders editable basic controls and honours reduced motion", () => {
    expect(source).toContain("formatProfileJoinDate");
    expect(source).toContain('aria-label="Tên"');
    expect(source).toContain('aria-label="Tuổi"');
    expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    expect(source).toContain("aria-pressed={profilePreferences.kaviTone === tone.value}");
  });
});
