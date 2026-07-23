import { describe, expect, it } from "vitest";
import type { FinancialPlan, Transaction } from "./domain";
import {
  createLocalSamplePlan,
  getBudgetProgress,
  getMonthlySummary,
  isLocalSampleConfirmation,
} from "./workspace";

const july = new Date(2026, 6, 15).getTime();

const plan: FinancialPlan = {
  currentBalance: 2_000_000,
  monthlyIncome: 5_000_000,
  fixedExpenses: [],
  goals: [],
  budgets: [
    { category: "Ăn uống", amount: 1_000_000 },
    { category: "Đi lại", amount: 500_000 },
  ],
  createdAt: july,
  updatedAt: july,
};

const transactions: Transaction[] = [
  { amount: 5_000_000, type: "income", category: "Tiền lương", date: new Date(2026, 6, 1).getTime(), createdAt: july },
  { amount: 900_000, type: "expense", category: "Ăn uống", date: new Date(2026, 6, 2).getTime(), createdAt: july },
  { amount: 150_000, type: "expense", category: "Đi lại", date: new Date(2026, 6, 3).getTime(), createdAt: july },
  { amount: 300_000, type: "expense", category: "Ăn uống", date: new Date(2026, 5, 30).getTime(), createdAt: july },
];

describe("finance workspace helpers", () => {
  it("summarizes only income and expenses from the selected month", () => {
    expect(getMonthlySummary(transactions, july)).toEqual({ income: 5_000_000, expense: 1_050_000 });
  });

  it("classifies category budgets as on-track, near-limit, or over-budget", () => {
    expect(getBudgetProgress(plan, transactions, july).categories).toEqual([
      { category: "Ăn uống", budget: 1_000_000, spent: 900_000, percent: 90, status: "near-limit" },
      { category: "Đi lại", budget: 500_000, spent: 150_000, percent: 30, status: "on-track" },
    ]);
  });

  it("recognizes local sample confirmation and creates a complete sample plan", () => {
    expect(isLocalSampleConfirmation("  YES ")).toBe(true);
    expect(isLocalSampleConfirmation("yes please")).toBe(false);
    expect(createLocalSamplePlan(july)).toMatchObject({
      createdAt: july,
      updatedAt: july,
      monthlyIncome: 8_000_000,
      budgets: expect.arrayContaining([expect.objectContaining({ category: "Ăn uống" })]),
      goals: expect.arrayContaining([expect.objectContaining({ name: "Quỹ dự phòng" })]),
    });
  });
});
