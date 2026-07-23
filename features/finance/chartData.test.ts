import { describe, expect, it } from "vitest";
import { buildCashflowChartData } from "./chartData";

describe("cashflow chart data", () => {
  it("exports the cashflow chart data builder", async () => {
    const modulePath = "./chartData";
    const chartData = await import(modulePath).catch(() => undefined);

    expect(chartData?.buildCashflowChartData).toBeTypeOf("function");
  });

  it("starts the yearly chart at the first transaction month and separates cashflow directions", () => {
    const result = buildCashflowChartData([
      { amount: 500_000, type: "income", category: "Tiền lương", date: new Date(2026, 2, 8).getTime(), createdAt: 1 },
      { amount: 20_000, type: "income", category: "Khác", date: new Date(2026, 3, 2).getTime(), createdAt: 2 },
      { amount: 120_000, type: "expense", category: "Ăn uống", date: new Date(2026, 3, 5).getTime(), createdAt: 3 },
    ], { type: "year", year: 2026 });

    expect(result).toEqual({
      labels: ["T3", "T4"],
      income: [500_000, 20_000],
      expense: [0, -120_000],
    });
  });

  it("groups the monthly chart by entered day without earlier empty days", () => {
    const result = buildCashflowChartData([
      { amount: 80_000, type: "expense", category: "Ăn uống", date: new Date(2026, 4, 3).getTime(), createdAt: 1 },
      { amount: 300_000, type: "income", category: "Tiền lương", date: new Date(2026, 4, 6).getTime(), createdAt: 2 },
    ], { type: "month", year: 2026, month: 4 });

    expect(result).toEqual({
      labels: ["3", "4", "5", "6"],
      income: [0, 0, 0, 300_000],
      expense: [-80_000, 0, 0, 0],
    });
  });

  it("ignores invalid values and returns no synthetic history", () => {
    const result = buildCashflowChartData([
      { amount: 0, type: "income", category: "Khác", date: new Date(2026, 0, 1).getTime(), createdAt: 1 },
      { amount: 100_000, type: "expense", category: "Khác", date: Number.NaN, createdAt: 2 },
    ], { type: "year", year: 2026 });

    expect(result).toEqual({ labels: [], income: [], expense: [] });
  });
});
