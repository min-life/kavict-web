import type { Transaction } from "./domain";

export type CashflowChartFilter = {
  type: "year" | "month";
  year: number;
  month?: number;
};

export type CashflowChartData = {
  labels: string[];
  income: number[];
  expense: number[];
  net: number[];
};

export function buildCashflowChartData(
  transactions: Transaction[],
  filter: CashflowChartFilter,
): CashflowChartData {
  const length = filter.type === "year"
    ? 12
    : new Date(filter.year, (filter.month ?? 0) + 1, 0).getDate();
  const income = new Array<number>(length).fill(0);
  const expense = new Array<number>(length).fill(0);

  const bucketedTransactions = transactions.flatMap((transaction) => {
    if (!Number.isFinite(transaction.amount) || transaction.amount <= 0 || !Number.isFinite(transaction.date)) {
      return [];
    }

    const date = new Date(transaction.date);
    if (date.getFullYear() !== filter.year || (filter.type === "month" && date.getMonth() !== filter.month)) {
      return [];
    }

    return [{
      bucket: filter.type === "year" ? date.getMonth() : date.getDate() - 1,
      transaction,
    }];
  });

  for (const { bucket, transaction } of bucketedTransactions) {
    if (transaction.type === "income") {
      income[bucket] += transaction.amount;
    } else {
      expense[bucket] += transaction.amount;
    }
  }

  return {
    labels: Array.from({ length }, (_, index) => {
      const period = index + 1;
      return filter.type === "year" ? `T${period}` : period.toString();
    }),
    income,
    expense,
    net: income.map((amount, index) => amount - expense[index]),
  };
}
