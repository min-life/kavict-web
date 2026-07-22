import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

describe("settings visual surface", () => {
  it("uses a root-class dark variant and semantic dark tokens", () => {
    expect(css).toContain("@custom-variant dark (&:where(.dark, .dark *));");
    expect(css).toContain("html.dark {");
    expect(css).toContain("--color-surface-container-lowest:");
    expect(css).toContain("--color-on-surface:");
    expect(css).toContain("--color-background:");
  });
});
