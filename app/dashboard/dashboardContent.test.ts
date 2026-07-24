import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dashboardPage = readFileSync(resolve(__dirname, "page.tsx"), "utf8");
const financialOverview = readFileSync(resolve(__dirname, "components/FinancialOverview.tsx"), "utf8");
const sidebar = readFileSync(resolve(__dirname, "../components/Sidebar.tsx"), "utf8");

describe("dashboard content", () => {
  it("shows transaction entry beside statistics and orders the lower dashboard cards", () => {
    expect(dashboardPage).toContain('import TransactionEntryTab from "./finance-management/components/TransactionEntryTab"');
    expect(dashboardPage).toContain('lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]');
    expect(dashboardPage).toContain('<TransactionEntryTab');
    expect(dashboardPage).toContain('showRecentTransactions={false}');
    expect(dashboardPage).toContain('title="Thống kê"');
    expect(financialOverview).toContain('title = "Quản lý tài chính"');
    expect(dashboardPage.indexOf(">Nhiệm vụ tuần</h2>")).toBeLessThan(dashboardPage.indexOf(">Học tập</h2>"));
    expect(dashboardPage.indexOf(">Học tập</h2>")).toBeLessThan(dashboardPage.indexOf(">Practice Space</h2>"));
    expect(dashboardPage).toContain('href="/dashboard/finance-management"');
    expect(dashboardPage).not.toContain("Bảng xếp hạng");
    expect(sidebar).toContain("LEADERBOARD_NAV_ITEM");
  });

  it("offers separate expense, income, and aggregate chart tabs", () => {
    expect(financialOverview).toContain('["expense", "Chi tiêu"]');
    expect(financialOverview).toContain('["income", "Thu nhập"]');
    expect(financialOverview).toContain('["aggregate", "Tổng hợp"]');
    expect(financialOverview).toContain("cashflow.net");
    expect(financialOverview).toContain('type: "line"');
    expect(financialOverview).toContain("cashflow.net.map");
  });

  it("shows four period-aware finance summary cards", () => {
    expect(financialOverview).toContain("buildPeriodFinancialSummary");
    expect(financialOverview).toContain("Tổng chi tiêu");
    expect(financialOverview).toContain("Tổng thu nhập");
    expect(financialOverview).toContain("Chênh lệch thu chi");
    expect(financialOverview).toContain("% tăng trưởng");
    expect(financialOverview).toContain("Chưa có dữ liệu trước đó");
    expect(financialOverview).toContain("Không thể tính % (kỳ trước = 0)");
  });
});
