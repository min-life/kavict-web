import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LEARNING_MODULES, getLearningModule } from "@/features/learning/catalog";

describe("learning module catalog", () => {
  it("starts with Module 1 and keeps concrete future-module samples", () => {
    expect(LEARNING_MODULES.slice(0, 4).map((module) => module.id)).toEqual(["1", "2", "3", "4"]);
    expect(LEARNING_MODULES[0].title).toBe("Nền tảng dòng tiền");
    expect(LEARNING_MODULES.slice(4).map((module) => module.id)).toEqual(["5", "6", "7", "8", "9", "10"]);
    expect(LEARNING_MODULES.slice(4)).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "5", title: "Chiến lược danh mục", tags: ["Đầu tư", "Quản trị"], difficulty: 4, isPublished: false, comingSoon: true }),
    ]));
    expect(LEARNING_MODULES.slice(4).every((module) => module.tags.length >= 1 && module.tags.length <= 2 && !module.tags.includes("Module tương lai"))).toBe(true);
    expect(LEARNING_MODULES.slice(0, 4).every((module) => module.overview && module.estimatedDuration && module.prerequisites)).toBe(true);
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
    expect(board).toContain("difficultyStarClasses");
    expect(board).toContain("text-emerald-500");
    expect(board).toContain("text-yellow-400");
    expect(board).toContain("text-orange-500");
    expect(board).toContain("text-red-500");
    expect(board).toContain("bg-[linear-gradient");
    expect(board).toContain("fontVariationSettings");
    expect(board).not.toContain("Học tài chính theo từng module");
    expect(board).not.toContain("Bắt đầu từ nền tảng dòng tiền");
    expect(board).not.toContain("Module 1 là điểm bắt đầu");
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
    expect(modulePage).not.toContain("const module =");
    expect(modulePage).toContain("Bạn sẽ học được gì");
    expect(modulePage).toContain("Thời lượng học");
    expect(modulePage).toContain("Kiến thức cần biết");
    expect(modulePage).toContain("difficultyStarClasses");
    expect(modulePage).toContain("fontVariationSettings");
  });
});

describe("learning lesson fallback", () => {
  const lessonPage = readFileSync(path.resolve(process.cwd(), "app/dashboard/learning/lesson/[id]/page.tsx"), "utf8");

  it("falls back to lesson 1 instead of lesson 4", () => {
    expect(lessonPage).toContain('params.id === "string" ? params.id : "1"');
    expect(lessonPage).toContain("Number(lessonId) || 1");
    expect(lessonPage).toContain('LESSONS_DATABASE[lessonId] || LESSONS_DATABASE["1"]');
  });
});
