import { describe, expect, it } from "vitest";
import { LEARNING_MODULES, getLearningModule } from "@/features/learning/catalog";

describe("learning module catalog", () => {
  it("starts with Module 1 and retains a non-published future module", () => {
    expect(LEARNING_MODULES.slice(0, 4).map((module) => module.id)).toEqual(["1", "2", "3", "4"]);
    expect(LEARNING_MODULES[0].title).toBe("Nền tảng dòng tiền");
    expect(LEARNING_MODULES[4]).toMatchObject({ isPublished: false, comingSoon: true });
    expect(getLearningModule("1")?.items.some((item) => item.kind === "test")).toBe(true);
  });
});
