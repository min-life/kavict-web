import type { FinancialPlan, IncomePlan, Transaction } from "./domain";

export type BudgetStatus = "on-track" | "near-limit" | "over-budget";

export type MonthlySummary = {
  income: number;
  expense: number;
};

export type BudgetProgressItem = {
  category: string;
  budget: number;
  spent: number;
  percent: number;
  status: BudgetStatus;
};

export type BudgetProgress = MonthlySummary & {
  categories: BudgetProgressItem[];
  allocated: number;
};

export type IncomePlanProgress = IncomePlan & {
  transactionProgress: number;
  current: number;
  percent: number;
  displayPercent: number;
};

export type SpendingStatusTone = "complete" | "warning" | "danger" | "neutral";
export type IncomeStatusTone = "complete" | "progress" | "neutral";
export type ObjectiveStatusTone = "complete" | "neutral";

export type PlanStatusSummary = {
  spending: {
    total: number;
    onTrack: number;
    percent: number;
    tone: SpendingStatusTone;
  };
  income: {
    total: number;
    completed: number;
    percent: number;
    tone: IncomeStatusTone;
  };
  objectives: {
    total: number;
    completed: number;
    percent: number;
    tone: ObjectiveStatusTone;
  };
};

function isInMonth(timestamp: number, monthTimestamp: number) {
  const date = new Date(timestamp);
  const month = new Date(monthTimestamp);
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

export function getMonthlySummary(transactions: Transaction[], monthTimestamp: number): MonthlySummary {
  return transactions
    .filter((transaction) => isInMonth(transaction.date, monthTimestamp))
    .reduce<MonthlySummary>((summary, transaction) => (
      transaction.type === "income"
        ? { ...summary, income: summary.income + transaction.amount }
        : { ...summary, expense: summary.expense + transaction.amount }
    ), { income: 0, expense: 0 });
}

export function getBudgetProgress(
  plan: FinancialPlan | null,
  transactions: Transaction[],
  monthTimestamp: number,
): BudgetProgress {
  const summary = getMonthlySummary(transactions, monthTimestamp);
  const categories = (plan?.budgets ?? []).map((budget) => {
    const spent = transactions
      .filter((transaction) => (
        transaction.type === "expense"
        && transaction.category === budget.category
        && isInMonth(transaction.date, monthTimestamp)
      ))
      .reduce((total, transaction) => total + transaction.amount, 0);
    const percent = budget.amount === 0 ? (spent > 0 ? 101 : 0) : Math.round((spent / budget.amount) * 100);
    const status: BudgetStatus = percent > 100 ? "over-budget" : percent >= 80 ? "near-limit" : "on-track";

    return { category: budget.category, budget: budget.amount, spent, percent, status };
  });

  return {
    ...summary,
    categories,
    allocated: categories.reduce((total, item) => total + item.budget, 0),
  };
}

function nonNegativeFinite(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function getIncomePlanProgress(
  plan: FinancialPlan | null,
  transactions: Transaction[],
  monthTimestamp: number,
): IncomePlanProgress[] {
  return (plan?.incomePlans ?? []).map((incomePlan) => {
    const target = nonNegativeFinite(incomePlan.target);
    const manualProgress = nonNegativeFinite(incomePlan.manualProgress);
    const transactionProgress = transactions
      .filter((transaction) => (
        transaction.type === "income"
        && transaction.category === incomePlan.transactionCategory
        && isInMonth(transaction.date, monthTimestamp)
      ))
      .reduce((total, transaction) => total + (incomePlan.unit === "count" ? 1 : transaction.amount), 0);
    const current = manualProgress + transactionProgress;
    const percent = target > 0 ? Math.round((current / target) * 100) : 0;

    return {
      ...incomePlan,
      target,
      manualProgress,
      transactionProgress,
      current,
      percent,
      displayPercent: Math.min(percent, 100),
    };
  });
}

export function getPlanStatusSummary(
  plan: FinancialPlan | null,
  transactions: Transaction[],
  monthTimestamp: number,
): PlanStatusSummary {
  const budgetProgress = getBudgetProgress(plan, transactions, monthTimestamp).categories;
  const spendingTotal = budgetProgress.length;
  const onTrack = budgetProgress.filter((budget) => budget.percent <= 100).length;
  const spendingPercent = spendingTotal > 0 ? Math.round((onTrack / spendingTotal) * 100) : 0;
  const spendingTone: SpendingStatusTone = spendingTotal === 0
    ? "neutral"
    : spendingPercent === 100
      ? "complete"
      : spendingPercent >= 70
        ? "warning"
        : "danger";

  const incomeProgress = getIncomePlanProgress(plan, transactions, monthTimestamp);
  const incomeTotal = incomeProgress.length;
  const incomeCompleted = incomeProgress.filter((incomePlan) => incomePlan.percent >= 100).length;
  const incomePercent = incomeTotal > 0
    ? Math.round(incomeProgress.reduce((total, incomePlan) => total + incomePlan.displayPercent, 0) / incomeTotal)
    : 0;
  const incomeTone: IncomeStatusTone = incomeTotal === 0 || incomePercent === 0
    ? "neutral"
    : incomeCompleted === incomeTotal
      ? "complete"
      : incomeProgress.some((incomePlan) => incomePlan.current > 0)
        ? "progress"
        : "neutral";

  const objectives = plan?.objectives ?? [];
  const objectivesTotal = objectives.length;
  const objectivesCompleted = objectives.filter((objective) => objective.isCompleted).length;
  const objectivesPercent = objectivesTotal > 0 ? Math.round((objectivesCompleted / objectivesTotal) * 100) : 0;

  return {
    spending: {
      total: spendingTotal,
      onTrack,
      percent: spendingPercent,
      tone: spendingTone,
    },
    income: {
      total: incomeTotal,
      completed: incomeCompleted,
      percent: incomePercent,
      tone: incomeTone,
    },
    objectives: {
      total: objectivesTotal,
      completed: objectivesCompleted,
      percent: objectivesPercent,
      tone: objectivesCompleted > 0 ? "complete" : "neutral",
    },
  };
}

export function isLocalSampleConfirmation(input: string) {
  return input.trim().toLowerCase() === "yes";
}

export function createLocalSamplePlan(now: number): FinancialPlan {
  return {
    currentBalance: 3_500_000,
    monthlyIncome: 8_000_000,
    fixedExpenses: [
      { name: "Tiền nhà", amount: 2_000_000 },
      { name: "Điện nước", amount: 400_000 },
    ],
    budgets: [
      { category: "Ăn uống", amount: 1_800_000, icon: "restaurant", color: "text-orange-500" },
      { category: "Nhà ở", amount: 2_400_000, icon: "home", color: "text-rose-500" },
      { category: "Đi lại", amount: 500_000, icon: "directions_bike", color: "text-lime-500" },
      { category: "Học tập", amount: 500_000, icon: "school", color: "text-blue-500" },
      { category: "Khác", amount: 600_000, icon: "category", color: "text-violet-500" },
    ],
    goals: [
      {
        id: "local-emergency-fund",
        name: "Quỹ dự phòng",
        targetAmount: 12_000_000,
        currentAmount: 3_500_000,
        icon: "savings",
        color: "text-emerald-500",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}
