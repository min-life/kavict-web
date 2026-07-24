import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentDirectory = __dirname;

describe("empty finance-plan sections", () => {
  it.each([
    ["IncomePlanSection.tsx", "progress.length === 0", 'const editButtonClassName = isEmpty\n    ? "rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"'],
    ["ObjectivesSection.tsx", "displayObjectives.length === 0", 'const editButtonClassName = "rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 disabled:cursor-wait disabled:opacity-50";'],
  ])("mutes the complete %s surface when no records exist", (fileName, emptyCondition, editButtonClassName) => {
    const source = readFileSync(resolve(componentDirectory, fileName), "utf8");

    expect(source).toContain(`const isEmpty = !isEditing && ${emptyCondition};`);
    expect(source).toContain('isEmpty ? "border-outline-variant/20 bg-surface-container-low" : "border-outline-variant/30 bg-surface"');
    expect(source).toContain('isEmpty ? "text-lg font-bold text-on-surface-variant" : "text-lg font-bold text-on-surface"');
    expect(source).toContain(editButtonClassName);
    expect(source).toContain("className={editButtonClassName}");
  });
});
