export type IncomePlanUnit = "amount" | "count";

export interface IncomePlan {
  id: string;
  name: string;
  unit: IncomePlanUnit;
  target: number;
  manualProgress: number;
  transactionCategory?: string;
  icon?: string;
  color?: string;
}

export interface Objective {
  id: string;
  name: string;
  isCompleted: boolean;
  icon?: string;
  color?: string;
}

export interface FinancialPlan {
  currentBalance: number;
  monthlyIncome: number;
  fixedExpenses: { name: string; amount: number }[];
  goals: { id: string; name: string; targetAmount: number; currentAmount: number; deadline?: string; icon?: string; color?: string }[];
  budgets: { category: string; amount: number; icon?: string; color?: string }[]; // Monthly allocated budgets
  incomePlans?: IncomePlan[];
  objectives?: Objective[];
  createdAt: number;
  updatedAt: number;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id?: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: number; // Timestamp
  note?: string;
  createdAt: number;
}
