import type { FinancialPlan } from "@/features/finance/domain";

type PlanUpdate = (currentPlan: FinancialPlan) => FinancialPlan;
type PersistPlan = (nextPlan: FinancialPlan) => Promise<void>;

function makeEmptyPlan(): FinancialPlan {
  const now = Date.now();
  return {
    currentBalance: 0,
    monthlyIncome: 0,
    fixedExpenses: [],
    goals: [],
    budgets: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createPlanPersistenceQueue(initialPlan: FinancialPlan | null) {
  let currentPlan = initialPlan;
  let pendingUpdates = 0;
  let queueTail: Promise<void> = Promise.resolve();

  const finishUpdate = () => {
    pendingUpdates -= 1;
  };

  return {
    acceptRemote(plan: FinancialPlan | null) {
      if (pendingUpdates === 0) currentPlan = plan;
    },
    enqueue(update: PlanUpdate, persist: PersistPlan): Promise<void> {
      pendingUpdates += 1;

      const operation = queueTail.then(async () => {
        const nextPlan = update(currentPlan ?? makeEmptyPlan());
        await persist(nextPlan);
        currentPlan = nextPlan;
      });

      queueTail = operation.then(finishUpdate, finishUpdate).catch(() => {});
      return operation;
    },
    getCurrent(): FinancialPlan | null {
      return currentPlan;
    },
    whenIdle(): Promise<void> {
      return queueTail;
    },
  };
}
