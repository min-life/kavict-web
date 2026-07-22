import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");
const settingsPath = path.resolve(process.cwd(), "app/dashboard/settings/page.tsx");
const profilePath = path.resolve(process.cwd(), "app/dashboard/profile/page.tsx");

describe("settings visual surface", () => {
  it("uses a root-class dark variant and semantic dark tokens", () => {
    expect(css).toContain("@custom-variant dark (&:where(.dark, .dark *));");
    expect(css).toContain("html.dark {");
    expect(css).toContain("--color-surface-container-lowest:");
    expect(css).toContain("--color-on-surface:");
    expect(css).toContain("--color-background:");
  });

  it("moves settings from Profile to the dedicated protected route", () => {
    const settings = readFileSync(settingsPath, "utf8");
    const profile = readFileSync(profilePath, "utf8");
    for (const label of ["Thông báo", "Ngôn ngữ", "Chế độ tối", "Bảo mật", "Billing"]) {
      expect(settings).toContain(label);
    }
    expect(settings).toContain('type="checkbox"');
    expect(settings).toContain("useTheme");
    expect(profile).not.toContain("Cài đặt chung");
  });
});
