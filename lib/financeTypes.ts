export interface FinancialPlan {
  currentBalance: number;
  monthlyIncome: number;
  fixedExpenses: { name: string; amount: number }[];
  goals: { id: string; name: string; targetAmount: number; currentAmount: number; deadline?: string; icon?: string; color?: string }[];
  budgets: { category: string; amount: number; icon?: string; color?: string }[]; // Monthly allocated budgets
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
