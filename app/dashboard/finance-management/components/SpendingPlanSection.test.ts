import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeSpendingPlanDraft } from "./SpendingPlanSection";

describe("SpendingPlanSection editing", () => {
  it("persists planned monthly income together with category icon and color", () => {
    expect(sanitizeSpendingPlanDraft(15_000_000, [
      { category: "  Ăn uống  ", amount: 3_000_000, icon: "restaurant", color: "text-orange-500" },
    ])).toEqual({
      monthlyIncome: 15_000_000,
      budgets: [{ category: "Ăn uống", amount: 3_000_000, icon: "restaurant", color: "text-orange-500" }],
    });
  });

  it("renders controls that update monthly income and category visuals in edit mode", () => {
    const source = readFileSync(resolve(__dirname, "SpendingPlanSection.tsx"), "utf8");

    expect(source).toContain("Thu nhập dự kiến mỗi tháng");
    expect(source).toContain("setDraftMonthlyIncome(Number(event.target.value))");
    expect(source).toContain('import IconPicker from "./IconPicker"');
    expect(source).toContain("<IconPicker");
    expect(source).toContain("updateBudget(index, { icon, color })");
    expect(source).toContain("currentIcon={budget.icon}");
    expect(source).toContain("currentColor={budget.color}");
    expect(source).toContain('sourceBudget?.icon ?? "category"');
    expect(source).toContain("{formatBudgetPercentage(item)}");
  });
});
