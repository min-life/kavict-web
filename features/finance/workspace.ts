import type { FinancialPlan, Transaction } from "./domain";

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
    const percent = budget.amount === 0 ? 0 : Math.round((spent / budget.amount) * 100);
    const status: BudgetStatus = percent > 100 ? "over-budget" : percent >= 80 ? "near-limit" : "on-track";

    return { category: budget.category, budget: budget.amount, spent, percent, status };
  });

  return {
    ...summary,
    categories,
    allocated: categories.reduce((total, item) => total + item.budget, 0),
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
