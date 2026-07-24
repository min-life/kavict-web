import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pagePath = resolve(__dirname, "page.tsx");
const componentPath = resolve(__dirname, "components/FinanceWorkspace.tsx");
const componentDirectory = resolve(__dirname, "components");
const globalStylesPath = resolve(__dirname, "../../globals.css");

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

  it("keeps dashboard overview separate and gives reports its two chart tabs", () => {
    const reportsSource = readFileSync(resolve(componentDirectory, "ReportsTab.tsx"), "utf8");
    const dashboardOverview = readFileSync(resolve(__dirname, "../components/FinancialOverview.tsx"), "utf8");

    expect(reportsSource).toContain("Diễn biến thu chi");
    expect(reportsSource).toContain("Tỷ trọng thu chi");
    expect(reportsSource).toContain('["aggregate", "Tổng hợp"]');
    expect(reportsSource).toContain('["expense", "Chi tiêu"]');
    expect(reportsSource).toContain('["income", "Thu nhập"]');
    expect(reportsSource).toContain("buildCategoryShareData");
    expect(reportsSource).toContain("Chưa có dữ liệu");
    expect(dashboardOverview).toContain("FinancialOverview");
  });

  it("offers AI quick entry but keeps transaction persistence behind an explicit confirmation", () => {
    const entrySource = readFileSync(resolve(componentDirectory, "TransactionEntryTab.tsx"), "utf8");

    expect(entrySource).toContain('fetch("/api/finance-parse"');
    expect(entrySource).toContain("Nhập nhanh bằng AI");
    expect(entrySource).toContain("Lưu giao dịch");
    expect(entrySource).toContain("saveTransactionAndUpdateBalance");
  });

  it("lets local users attempt the Advisor request before enabling the sample fallback", () => {
    const advisorSource = readFileSync(resolve(componentDirectory, "KaviAdvisorTab.tsx"), "utf8");

    expect(advisorSource).toContain("const [isFallbackMode, setIsFallbackMode] = useState(false)");
    expect(advisorSource).toContain("if (data.fallback)");
    expect(advisorSource).not.toContain("if (!aiAvailable)");
  });

  it("shows an Advisor use-case selection screen before starting chat", () => {
    const advisorSource = readFileSync(resolve(componentDirectory, "KaviAdvisorTab.tsx"), "utf8");

    expect(advisorSource).toContain("Bạn muốn Kavi làm gì cho bạn?");
    expect(advisorSource).toContain("Lập kế hoạch tài chính cho bạn");
    expect(advisorSource).toContain("Phân tích chi tiêu của bạn");
    expect(advisorSource).toContain("Tư vấn cho bạn về tài chính");
    expect(advisorSource).toContain("Chỉnh sửa plan theo thay đổi của bạn");
    expect(advisorSource).toContain("useCase,");
    expect(advisorSource).toContain('useCase === "spending-analysis"');
    expect(advisorSource).toContain("askAdvisor(message, selectedUseCase, messages)");
    expect(advisorSource).toContain("Chọn nhu cầu khác");
  });

  it("defines the green success token used by the selected income button", () => {
    const globalStyles = readFileSync(globalStylesPath, "utf8");

    expect(globalStyles).toContain("--color-success:");
  });

  it("removes the superseded forced onboarding components", () => {
    expect(existsSync(resolve(componentDirectory, "OnboardingPlanner.tsx"))).toBe(false);
    expect(existsSync(resolve(componentDirectory, "FinancialDashboard.tsx"))).toBe(false);
  });
});
