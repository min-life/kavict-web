import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dashboardPage = readFileSync(resolve(__dirname, "page.tsx"), "utf8");
const financialOverview = readFileSync(resolve(__dirname, "components/FinancialOverview.tsx"), "utf8");
const sidebar = readFileSync(resolve(__dirname, "../components/Sidebar.tsx"), "utf8");

describe("dashboard content", () => {
  it("uses the requested finance and learning labels without a leaderboard card", () => {
    expect(financialOverview).toContain(">Quản lý tài chính</h2>");
    expect(dashboardPage).toContain(">Học tập</h2>");
    expect(dashboardPage).toContain('href="/dashboard/finance-management"');
    expect(dashboardPage).toMatch(/<Link href="\/dashboard\/finance-management"[^>]*>[\s\S]*Quản lý tài chính/);
    expect(dashboardPage).not.toContain("Bảng xếp hạng");
    expect(sidebar).toContain("LEADERBOARD_NAV_ITEM");
  });
});
