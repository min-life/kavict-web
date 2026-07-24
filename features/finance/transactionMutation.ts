import type { FinancialPlan, Transaction } from "./domain";
import type { FinanceRepository } from "./repository";

type TransactionInput = Omit<Transaction, "id" | "createdAt">;

export async function saveTransactionAndUpdateBalance(
  repository: Pick<FinanceRepository, "addTransaction" | "savePlan">,
  userId: string,
  plan: FinancialPlan | null,
  transaction: TransactionInput,
) {
  await repository.addTransaction(userId, { ...transaction, createdAt: Date.now() });
  if (!plan) return;

  const currentBalance = plan.currentBalance + (transaction.type === "income" ? transaction.amount : -transaction.amount);
  await repository.savePlan(userId, { currentBalance });
}
