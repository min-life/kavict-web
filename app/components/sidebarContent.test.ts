import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const contentModulePath = resolve(__dirname, "sidebarContent.ts");

describe("sidebar content", () => {
  it("defines Practice Space and static task progress without a leaderboard destination", async () => {
    expect(existsSync(contentModulePath)).toBe(true);

    const sidebarContent = await import("./sidebarContent");
    const { PRIMARY_NAV_ITEMS, STATIC_TASKS } = sidebarContent;

    expect(PRIMARY_NAV_ITEMS.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/learning",
      "/dashboard/finance-management",
      "/dashboard/practice-space",
    ]);
    expect(PRIMARY_NAV_ITEMS.at(-1)).toMatchObject({
      icon: "target",
      label: "Practice Space",
    });
    expect(STATIC_TASKS).toEqual([
      { label: "Nhiệm vụ ngày", title: "Hoàn thành 1 bài học", completed: 1, total: 1 },
      { label: "Nhiệm vụ tuần", title: "Ghi chép chi tiêu 5 ngày", completed: 3, total: 5 },
    ]);
    expect("LEADERBOARD_NAV_ITEM" in sidebarContent).toBe(false);
  });
});
