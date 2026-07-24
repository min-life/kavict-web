import { describe, expect, it } from "vitest";
import type { FinancialPlan, Transaction } from "./domain";
import {
  createLocalSamplePlan,
  getBudgetProgress,
  getIncomePlanProgress,
  getMonthlySummary,
  getPlanStatusSummary,
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

  it("combines income transactions and manual amount progress for a linked income plan", () => {
    const result = getIncomePlanProgress({
      ...plan,
      incomePlans: [{ id: "freelance", name: "Freelance edit", unit: "amount", target: 1_000_000, manualProgress: 200_000, transactionCategory: "Edit ngoài" }],
    }, [
      ...transactions,
      { amount: 600_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 4).getTime(), createdAt: july },
    ], july);

    expect(result).toEqual([expect.objectContaining({ id: "freelance", transactionProgress: 600_000, current: 800_000, percent: 80, displayPercent: 80 })]);
  });

  it("counts matching income records for count plans and preserves old plans without new arrays", () => {
    const result = getIncomePlanProgress({
      ...plan,
      incomePlans: [{ id: "edit-gigs", name: "Nhận job edit", unit: "count", target: 5, manualProgress: 1, transactionCategory: "Edit ngoài" }],
    }, [
      ...transactions,
      { amount: 200_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 4).getTime(), createdAt: july },
      { amount: 300_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 7).getTime(), createdAt: july },
    ], july);

    expect(result[0]).toMatchObject({ transactionProgress: 2, current: 3, percent: 60 });
    expect(getIncomePlanProgress(plan, transactions, july)).toEqual([]);
  });

  it("returns neutral empty states and the requested spending, income, and objective tones", () => {
    expect(getPlanStatusSummary(plan, transactions, july)).toMatchObject({
      income: { total: 0, percent: 0, tone: "neutral" },
      objectives: { total: 0, completed: 0, percent: 0, tone: "neutral" },
    });
    expect(getPlanStatusSummary({
      ...plan,
      incomePlans: [{ id: "done", name: "Dạy kèm", unit: "count", target: 2, manualProgress: 2 }],
      objectives: [{ id: "shirt", name: "Mua 2 áo", isCompleted: true }],
    }, transactions, july)).toMatchObject({
      income: { total: 1, percent: 100, tone: "complete" },
      objectives: { total: 1, completed: 1, percent: 100, tone: "complete" },
    });
  });

  it("marks objectives complete as soon as at least one objective is complete", () => {
    expect(getPlanStatusSummary({
      ...plan,
      objectives: [
        { id: "first", name: "Quỹ dự phòng", isCompleted: true },
        { id: "second", name: "Mua laptop", isCompleted: false },
      ],
    }, transactions, july).objectives).toMatchObject({
      total: 2,
      completed: 1,
      percent: 50,
      tone: "complete",
    });
  });

  it("keeps income neutral when its displayed completion percentage is zero", () => {
    expect(getPlanStatusSummary({
      ...plan,
      incomePlans: [{ id: "invalid-target", name: "Việc làm thêm", unit: "amount", target: Number.NaN, manualProgress: 200_000 }],
    }, transactions, july).income).toMatchObject({
      total: 1,
      completed: 0,
      percent: 0,
      tone: "neutral",
    });
  });

  it("averages capped completion percentages across multiple income plans", () => {
    expect(getPlanStatusSummary({
      ...plan,
      incomePlans: [
        { id: "mostly-done", name: "Dạy kèm", unit: "amount", target: 100, manualProgress: 80 },
        { id: "not-started", name: "Bán đồ cũ", unit: "amount", target: 100, manualProgress: 0 },
      ],
    }, transactions, july)).toMatchObject({
      income: { total: 2, completed: 0, percent: 40, tone: "progress" },
    });
  });

  it("counts budgets at or below 100 percent as compliant for spending status", () => {
    const result = getPlanStatusSummary({
      ...plan,
      budgets: [
        { category: "Ăn uống", amount: 100 },
        { category: "Đi lại", amount: 100 },
        { category: "Mua sắm", amount: 100 },
      ],
    }, [
      { amount: 90, type: "expense", category: "Ăn uống", date: july, createdAt: july },
      { amount: 100, type: "expense", category: "Đi lại", date: july, createdAt: july },
      { amount: 101, type: "expense", category: "Mua sắm", date: july, createdAt: july },
    ], july);

    expect(result.spending).toEqual({ total: 3, onTrack: 2, percent: 67, tone: "danger" });
  });

  it("treats spending against a zero budget as over-budget and non-compliant", () => {
    const zeroBudgetPlan = {
      ...plan,
      budgets: [{ category: "Ăn uống", amount: 0 }],
    };
    const zeroBudgetTransactions = [
      { amount: 1, type: "expense" as const, category: "Ăn uống", date: july, createdAt: july },
    ];

    const progress = getBudgetProgress(zeroBudgetPlan, zeroBudgetTransactions, july);

    expect(progress.categories[0]).toMatchObject({ budget: 0, spent: 1, status: "over-budget" });
    expect(progress.categories[0].percent).toBeGreaterThan(100);
    expect(getPlanStatusSummary(zeroBudgetPlan, zeroBudgetTransactions, july).spending)
      .toEqual({ total: 1, onTrack: 0, percent: 0, tone: "danger" });
  });
});
