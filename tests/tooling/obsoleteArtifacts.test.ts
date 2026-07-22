import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

describe("repository tooling", () => {
  it("does not retain one-off Stitch conversion scripts", () => {
    for (const name of ["convert_screens.js", "fix_aria.js", "fix_variants.js", "_stitch_raw"]) {
      expect(existsSync(path.resolve(process.cwd(), name))).toBe(false);
    }
  });
});
