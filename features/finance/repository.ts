import type { FinancialPlan, Transaction } from "./domain";

export interface FinanceRepository {
  getPlan(uid: string): Promise<FinancialPlan | null>;
  savePlan(uid: string, plan: Partial<FinancialPlan>): Promise<void>;
  getTransactions(uid: string): Promise<Transaction[]>;
  addTransaction(uid: string, transaction: Omit<Transaction, "id">): Promise<string>;
  deleteTransaction(uid: string, transactionId: string): Promise<void>;
  updateTransaction(uid: string, transactionId: string, updates: Partial<Transaction>): Promise<void>;
  resetDemoData?(): Promise<void>;
}
