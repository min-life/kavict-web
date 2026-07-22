import type { FinancialPlan, Transaction } from "./domain";
import type { FinanceRepository } from "./repository";

const FINANCE_KEY = "kavict:local:finance:v1";

type LocalFinanceData = {
  plans: Record<string, FinancialPlan>;
  transactions: Record<string, Transaction[]>;
};

function read(storage: Storage): LocalFinanceData {
  const value = storage.getItem(FINANCE_KEY);
  return value ? JSON.parse(value) as LocalFinanceData : { plans: {}, transactions: {} };
}

function write(storage: Storage, data: LocalFinanceData) {
  storage.setItem(FINANCE_KEY, JSON.stringify(data));
}

function sortByDate(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date - a.date);
}

export function createLocalFinanceRepository(storage: Storage): FinanceRepository {
  return {
    async getPlan(uid) {
      return read(storage).plans[uid] ?? null;
    },
    async savePlan(uid, plan) {
      const data = read(storage);
      data.plans[uid] = { ...data.plans[uid], ...plan, updatedAt: Date.now() } as FinancialPlan;
      write(storage, data);
    },
    async getTransactions(uid) {
      return sortByDate(read(storage).transactions[uid] ?? []);
    },
    async addTransaction(uid, transaction) {
      const data = read(storage);
      const id = crypto.randomUUID();
      data.transactions[uid] = [...(data.transactions[uid] ?? []), { ...transaction, id, createdAt: Date.now() }];
      write(storage, data);
      return id;
    },
    async deleteTransaction(uid, transactionId) {
      const data = read(storage);
      data.transactions[uid] = (data.transactions[uid] ?? []).filter((transaction) => transaction.id !== transactionId);
      write(storage, data);
    },
    async updateTransaction(uid, transactionId, updates) {
      const data = read(storage);
      data.transactions[uid] = (data.transactions[uid] ?? []).map((transaction) => (
        transaction.id === transactionId ? { ...transaction, ...updates, id: transactionId } : transaction
      ));
      write(storage, data);
    },
    async resetDemoData() {
      storage.removeItem(FINANCE_KEY);
    },
  };
}
