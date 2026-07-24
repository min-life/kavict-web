import { describe, expect, it } from "vitest";
import { buildCashflowChartData, buildCategoryShareData, buildPeriodFinancialSummary } from "./chartData";

describe("cashflow chart data", () => {
  it("exports the cashflow chart data builder", async () => {
    const modulePath = "./chartData";
    const chartData = await import(modulePath).catch(() => undefined);

    expect(chartData?.buildCashflowChartData).toBeTypeOf("function");
  });

  it("covers all 12 months of a selected year and separates cashflow directions", () => {
    const result = buildCashflowChartData([
      { amount: 500_000, type: "income", category: "Tiền lương", date: new Date(2026, 2, 8).getTime(), createdAt: 1 },
      { amount: 20_000, type: "income", category: "Khác", date: new Date(2026, 3, 2).getTime(), createdAt: 2 },
      { amount: 120_000, type: "expense", category: "Ăn uống", date: new Date(2026, 3, 5).getTime(), createdAt: 3 },
    ], { type: "year", year: 2026 });

    expect(result).toEqual({
      labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
      income: [0, 0, 500_000, 20_000, 0, 0, 0, 0, 0, 0, 0, 0],
      expense: [0, 0, 0, 120_000, 0, 0, 0, 0, 0, 0, 0, 0],
      net: [0, 0, 500_000, -100_000, 0, 0, 0, 0, 0, 0, 0, 0],
    });
  });

  it("covers every calendar day in a selected month", () => {
    const result = buildCashflowChartData([
      { amount: 80_000, type: "expense", category: "Ăn uống", date: new Date(2026, 4, 3).getTime(), createdAt: 1 },
      { amount: 300_000, type: "income", category: "Tiền lương", date: new Date(2026, 4, 6).getTime(), createdAt: 2 },
    ], { type: "month", year: 2026, month: 4 });

    expect(result.labels).toEqual(Array.from({ length: 31 }, (_, index) => (index + 1).toString()));
    expect(result.income).toHaveLength(31);
    expect(result.expense).toHaveLength(31);
    expect(result.net).toHaveLength(31);
    expect(result.income[5]).toBe(300_000);
    expect(result.expense[2]).toBe(80_000);
    expect(result.net[2]).toBe(-80_000);
    expect(result.net[5]).toBe(300_000);
  });

  it("keeps an empty selected period visible while ignoring invalid transactions", () => {
    const result = buildCashflowChartData([
      { amount: 0, type: "income", category: "Khác", date: new Date(2026, 0, 1).getTime(), createdAt: 1 },
      { amount: 100_000, type: "expense", category: "Khác", date: Number.NaN, createdAt: 2 },
    ], { type: "year", year: 2026 });

    expect(result).toEqual({
      labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
      income: new Array(12).fill(0),
      expense: new Array(12).fill(0),
      net: new Array(12).fill(0),
    });
  });

  it("uses the actual day count of the selected month", () => {
    const result = buildCashflowChartData([], { type: "month", year: 2024, month: 1 });

    expect(result.labels).toHaveLength(29);
    expect(result.labels.at(-1)).toBe("29");
  });

  it("summarizes a selected month and compares its net result with the previous month", () => {
    const result = buildPeriodFinancialSummary([
      { amount: 1_000_000, type: "income", category: "Lương", date: new Date(2026, 4, 5).getTime(), createdAt: 1 },
      { amount: 200_000, type: "expense", category: "Ăn uống", date: new Date(2026, 4, 8).getTime(), createdAt: 2 },
      { amount: 500_000, type: "income", category: "Lương", date: new Date(2026, 3, 2).getTime(), createdAt: 3 },
      { amount: 100_000, type: "expense", category: "Ăn uống", date: new Date(2026, 3, 9).getTime(), createdAt: 4 },
    ], { type: "month", year: 2026, month: 4 });

    expect(result).toMatchObject({
      income: 1_000_000,
      expense: 200_000,
      net: 800_000,
      previousNet: 400_000,
      growthRate: 100,
      growthStatus: "available",
    });
  });

  it("compares yearly totals with the previous calendar year", () => {
    const result = buildPeriodFinancialSummary([
      { amount: 900_000, type: "income", category: "Lương", date: new Date(2026, 0, 1).getTime(), createdAt: 1 },
      { amount: 300_000, type: "expense", category: "Nhà ở", date: new Date(2026, 8, 1).getTime(), createdAt: 2 },
      { amount: 600_000, type: "income", category: "Lương", date: new Date(2025, 5, 1).getTime(), createdAt: 3 },
      { amount: 400_000, type: "expense", category: "Nhà ở", date: new Date(2025, 9, 1).getTime(), createdAt: 4 },
    ], { type: "year", year: 2026 });

    expect(result).toMatchObject({
      income: 900_000,
      expense: 300_000,
      net: 600_000,
      previousNet: 200_000,
      growthRate: 200,
      growthStatus: "available",
    });
  });

  it("reports when the previous period has no transactions", () => {
    const result = buildPeriodFinancialSummary([
      { amount: 600_000, type: "income", category: "Lương", date: new Date(2026, 4, 5).getTime(), createdAt: 1 },
    ], { type: "month", year: 2026, month: 4 });

    expect(result).toMatchObject({
      previousNet: null,
      growthRate: null,
      growthStatus: "no-previous-data",
    });
  });

  it("does not calculate growth when the previous period net is zero", () => {
    const result = buildPeriodFinancialSummary([
      { amount: 600_000, type: "income", category: "Lương", date: new Date(2026, 4, 5).getTime(), createdAt: 1 },
      { amount: 300_000, type: "income", category: "Lương", date: new Date(2026, 3, 2).getTime(), createdAt: 2 },
      { amount: 300_000, type: "expense", category: "Ăn uống", date: new Date(2026, 3, 9).getTime(), createdAt: 3 },
    ], { type: "month", year: 2026, month: 4 });

    expect(result).toMatchObject({
      previousNet: 0,
      growthRate: null,
      growthStatus: "previous-period-zero",
    });
  });

  it("groups the selected year's expenses by category and computes total shares", () => {
    const result = buildCategoryShareData([
      { amount: 120_000, type: "expense", category: "Ăn uống", date: new Date(2026, 0, 5).getTime(), createdAt: 1 },
      { amount: 80_000, type: "expense", category: "Ăn uống", date: new Date(2026, 6, 5).getTime(), createdAt: 2 },
      { amount: 300_000, type: "expense", category: "Nhà ở", date: new Date(2026, 3, 2).getTime(), createdAt: 3 },
      { amount: 1_000_000, type: "income", category: "Lương", date: new Date(2026, 1, 1).getTime(), createdAt: 4 },
      { amount: 50_000, type: "expense", category: "Ăn uống", date: new Date(2025, 11, 1).getTime(), createdAt: 5 },
    ], { type: "year", year: 2026 }, "expense");

    expect(result).toEqual({
      labels: ["Nhà ở", "Ăn uống"],
      values: [300_000, 200_000],
      percentages: [60, 40],
      total: 500_000,
    });
  });

  it("isolates the selected month and ignores invalid transactions", () => {
    const result = buildCategoryShareData([
      { amount: 250_000, type: "income", category: "Lương", date: new Date(2026, 4, 2).getTime(), createdAt: 1 },
      { amount: 50_000, type: "income", category: "Freelance", date: new Date(2026, 4, 8).getTime(), createdAt: 2 },
      { amount: 300_000, type: "income", category: "Lương", date: new Date(2026, 3, 2).getTime(), createdAt: 3 },
      { amount: 0, type: "income", category: "Khác", date: new Date(2026, 4, 2).getTime(), createdAt: 4 },
      { amount: 1, type: "income", category: "Khác", date: Number.NaN, createdAt: 5 },
    ], { type: "month", year: 2026, month: 4 }, "income");

    expect(result).toEqual({
      labels: ["Lương", "Freelance"],
      values: [250_000, 50_000],
      percentages: [83.33, 16.67],
      total: 300_000,
    });
  });

  it("returns an empty share result when the period has no matching type", () => {
    expect(buildCategoryShareData([], { type: "year", year: 2026 }, "expense")).toEqual({
      labels: [], values: [], percentages: [], total: 0,
    });
  });
});
