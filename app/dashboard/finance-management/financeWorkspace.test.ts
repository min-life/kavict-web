import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pagePath = resolve(__dirname, "page.tsx");
const componentPath = resolve(__dirname, "components/FinanceWorkspace.tsx");
const componentDirectory = resolve(__dirname, "components");

describe("finance workspace composition", () => {
  it("replaces forced onboarding with the four requested tabs", () => {
    const pageSource = readFileSync(pagePath, "utf8");

    expect(pageSource).toContain('import FinanceWorkspace from "./components/FinanceWorkspace"');
    expect(pageSource).not.toContain("OnboardingPlanner");
    expect(existsSync(componentPath)).toBe(true);

    const workspaceSource = readFileSync(componentPath, "utf8");
    expect(workspaceSource).toContain('label: "Nhập liệu"');
    expect(workspaceSource).toContain('label: "Kế hoạch & Ngân sách"');
    expect(workspaceSource).toContain('label: "Thống kê và Báo cáo"');
    expect(workspaceSource).toContain('label: "Kavi Advisor"');
  });

  it("splits entry, budgets, reports, and advisor into dedicated panels", () => {
    for (const component of ["TransactionEntryTab", "PlanBudgetTab", "ReportsTab", "KaviAdvisorTab"]) {
      expect(existsSync(resolve(componentDirectory, `${component}.tsx`))).toBe(true);
    }

    const advisorSource = readFileSync(resolve(componentDirectory, "KaviAdvisorTab.tsx"), "utf8");
    const entrySource = readFileSync(resolve(componentDirectory, "TransactionEntryTab.tsx"), "utf8");
    expect(advisorSource).toContain("bạn đang ở môi trường local nên không thể kết nối AI");
    expect(advisorSource).toContain("isLocalSampleConfirmation");
    expect(advisorSource).toContain('fetch("/api/finance-advisor"');
    expect(entrySource).toContain('plan?.budgets[0]?.category ?? "Ăn uống"');
  });

  it("removes the superseded forced onboarding components", () => {
    expect(existsSync(resolve(componentDirectory, "OnboardingPlanner.tsx"))).toBe(false);
    expect(existsSync(resolve(componentDirectory, "FinancialDashboard.tsx"))).toBe(false);
  });
});
