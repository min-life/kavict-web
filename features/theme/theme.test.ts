import { describe, expect, it } from "vitest";
import { applyTheme, readTheme, THEME_STORAGE_KEY, writeTheme } from "./theme";

function storageWith(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("theme preference", () => {
  it("uses light mode for missing and invalid values", () => {
    expect(readTheme(storageWith())).toBe("light");
    expect(readTheme(storageWith({ [THEME_STORAGE_KEY]: "system" }))).toBe("light");
  });

  it("persists and restores dark mode", () => {
    const storage = storageWith();
    writeTheme("dark", storage);
    expect(readTheme(storage)).toBe("dark");
  });

  it("sets the root dark class only for dark mode", () => {
    const calls: Array<[string, boolean]> = [];
    const classList = { toggle: (name: string, enabled: boolean) => { calls.push([name, enabled]); return enabled; } };
    applyTheme("dark", classList);
    applyTheme("light", classList);
    expect(calls).toEqual([["dark", true], ["dark", false]]);
  });
});
