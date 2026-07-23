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
};

export function buildCashflowChartData(
  transactions: Transaction[],
  filter: CashflowChartFilter,
): CashflowChartData {
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

  if (bucketedTransactions.length === 0) {
    return { labels: [], income: [], expense: [] };
  }

  const firstBucket = Math.min(...bucketedTransactions.map(({ bucket }) => bucket));
  const lastBucket = Math.max(...bucketedTransactions.map(({ bucket }) => bucket));
  const length = lastBucket - firstBucket + 1;
  const income = new Array<number>(length).fill(0);
  const expense = new Array<number>(length).fill(0);

  for (const { bucket, transaction } of bucketedTransactions) {
    const index = bucket - firstBucket;
    if (transaction.type === "income") {
      income[index] += transaction.amount;
    } else {
      expense[index] -= transaction.amount;
    }
  }

  return {
    labels: Array.from({ length }, (_, index) => {
      const period = firstBucket + index + 1;
      return filter.type === "year" ? `T${period}` : period.toString();
    }),
    income,
    expense,
  };
}
