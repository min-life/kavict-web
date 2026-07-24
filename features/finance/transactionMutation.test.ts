import { describe, expect, it, vi } from "vitest";
import type { FinancialPlan } from "./domain";
import { saveTransactionAndUpdateBalance } from "./transactionMutation";

const plan: FinancialPlan = {
  currentBalance: 100_000,
  monthlyIncome: 0,
  fixedExpenses: [],
  goals: [],
  budgets: [],
  createdAt: 1,
  updatedAt: 1,
};

describe("saveTransactionAndUpdateBalance", () => {
  it("stores a confirmed expense and deducts it from the plan balance", async () => {
    const repository = { addTransaction: vi.fn().mockResolvedValue("record-1"), savePlan: vi.fn().mockResolvedValue(undefined) };

    await saveTransactionAndUpdateBalance(repository, "user-1", plan, {
      type: "expense", amount: 20_000, category: "Ăn uống", date: Date.now(), note: "Bánh mì",
    });

    expect(repository.addTransaction).toHaveBeenCalledWith("user-1", expect.objectContaining({ amount: 20_000, type: "expense" }));
    expect(repository.savePlan).toHaveBeenCalledWith("user-1", { currentBalance: 80_000 });
  });

  it("stores a confirmed income and increases the plan balance", async () => {
    const repository = { addTransaction: vi.fn().mockResolvedValue("record-2"), savePlan: vi.fn().mockResolvedValue(undefined) };

    await saveTransactionAndUpdateBalance(repository, "user-1", plan, {
      type: "income", amount: 50_000, category: "Tiền lương", date: Date.now(), note: "Làm thêm",
    });

    expect(repository.savePlan).toHaveBeenCalledWith("user-1", { currentBalance: 150_000 });
  });
});
