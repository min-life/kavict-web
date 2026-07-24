import { describe, expect, it, vi } from "vitest";
import type { FinancialPlan } from "@/features/finance/domain";
import { createPlanPersistenceQueue } from "./planPersistence";

const initialPlan: FinancialPlan = {
  currentBalance: 1_000_000,
  monthlyIncome: 10_000_000,
  fixedExpenses: [],
  goals: [],
  budgets: [{ category: "Ăn uống", amount: 2_000_000 }],
  incomePlans: [{ id: "salary", name: "Lương", unit: "amount", target: 10_000_000, manualProgress: 0 }],
  objectives: [{ id: "reserve", name: "Quỹ dự phòng", isCompleted: false }],
  createdAt: 1,
  updatedAt: 1,
};

describe("plan persistence queue", () => {
  it("serializes section saves and merges every update into the latest committed plan", async () => {
    let releaseFirstSave = () => {};
    const firstSaveBlocked = new Promise<void>((resolve) => { releaseFirstSave = resolve; });
    const persisted: FinancialPlan[] = [];
    const persist = vi.fn(async (plan: FinancialPlan) => {
      persisted.push(plan);
      if (persisted.length === 1) await firstSaveBlocked;
    });
    const queue = createPlanPersistenceQueue(initialPlan);

    const spendingSave = queue.enqueue(
      (current) => ({ ...current, monthlyIncome: 12_000_000, budgets: [{ category: "Ăn uống", amount: 3_000_000 }] }),
      persist,
    );
    const incomeSave = queue.enqueue(
      (current) => ({ ...current, incomePlans: [{ id: "freelance", name: "Freelance", unit: "amount", target: 4_000_000, manualProgress: 0 }] }),
      persist,
    );
    const objectiveSave = queue.enqueue(
      (current) => ({ ...current, objectives: [{ id: "reserve", name: "Quỹ dự phòng", isCompleted: true }] }),
      persist,
    );

    await vi.waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
    expect(persisted[0]).toMatchObject({
      monthlyIncome: 12_000_000,
      budgets: [{ category: "Ăn uống", amount: 3_000_000 }],
      incomePlans: initialPlan.incomePlans,
      objectives: initialPlan.objectives,
    });

    releaseFirstSave();
    await Promise.all([spendingSave, incomeSave, objectiveSave]);

    expect(persisted).toHaveLength(3);
    expect(persisted[1]).toMatchObject({
      monthlyIncome: 12_000_000,
      budgets: [{ category: "Ăn uống", amount: 3_000_000 }],
      incomePlans: [{ id: "freelance" }],
      objectives: initialPlan.objectives,
    });
    expect(persisted[2]).toMatchObject({
      monthlyIncome: 12_000_000,
      budgets: [{ category: "Ăn uống", amount: 3_000_000 }],
      incomePlans: [{ id: "freelance" }],
      objectives: [{ id: "reserve", isCompleted: true }],
    });
  });
});
