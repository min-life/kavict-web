import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LEARNING_MODULES, getLearningModule } from "@/features/learning/catalog";

describe("learning module catalog", () => {
  it("starts with Module 1 and retains a non-published future module", () => {
    expect(LEARNING_MODULES.slice(0, 4).map((module) => module.id)).toEqual(["1", "2", "3", "4"]);
    expect(LEARNING_MODULES[0].title).toBe("Nền tảng dòng tiền");
    expect(LEARNING_MODULES[4]).toMatchObject({ isPublished: false, comingSoon: true });
    expect(getLearningModule("1")?.items.some((item) => item.kind === "test")).toBe(true);
  });
});

describe("learning module board", () => {
  const board = readFileSync(path.resolve(process.cwd(), "app/dashboard/learning/page.tsx"), "utf8");

  it("maps module cards, uses module detail links, and labels future modules", () => {
    expect(board).toContain("LEARNING_MODULES.map");
    expect(board).toContain("/dashboard/learning/module/${module.id}");
    expect(board).toContain("Nền tảng sẽ update sớm");
    expect(board).toContain("star");
  });
});

describe("learning module detail", () => {
  const modulePagePath = path.resolve(process.cwd(), "app/dashboard/learning/module/[id]/page.tsx");

  it("sends Premium module items to Upgrade and keeps their badge", () => {
    const modulePage = readFileSync(modulePagePath, "utf8");

    expect(modulePage).toContain('href="/dashboard/upgrade"');
    expect(modulePage).toContain("Premium");
    expect(modulePage).toContain('data-icon="star"');
    expect(modulePage).toContain("getLearningModule");
  });
});
