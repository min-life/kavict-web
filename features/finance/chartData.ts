import type { Transaction, TransactionType } from "./domain";

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

export type PeriodFinancialSummary = {
  income: number;
  expense: number;
  net: number;
  previousNet: number | null;
  growthRate: number | null;
  growthStatus: "available" | "no-previous-data" | "previous-period-zero";
};

export type CategoryShareData = {
  labels: string[];
  values: number[];
  percentages: number[];
  total: number;
};

function isValidTransaction(transaction: Transaction): boolean {
  return Number.isFinite(transaction.amount)
    && transaction.amount > 0
    && Number.isFinite(transaction.date)
    && (transaction.type === "income" || transaction.type === "expense");
}

function isInPeriod(transaction: Transaction, filter: CashflowChartFilter): boolean {
  const date = new Date(transaction.date);
  return date.getFullYear() === filter.year
    && (filter.type === "year" || date.getMonth() === (filter.month ?? 0));
}

function getPreviousPeriod(filter: CashflowChartFilter): CashflowChartFilter {
  if (filter.type === "year") {
    return { type: "year", year: filter.year - 1 };
  }

  const month = filter.month ?? 0;
  return month === 0
    ? { type: "month", year: filter.year - 1, month: 11 }
    : { type: "month", year: filter.year, month: month - 1 };
}

function sumPeriod(transactions: Transaction[], filter: CashflowChartFilter) {
  return transactions.reduce((summary, transaction) => {
    if (!isValidTransaction(transaction) || !isInPeriod(transaction, filter)) {
      return summary;
    }

    if (transaction.type === "income") {
      summary.income += transaction.amount;
    } else {
      summary.expense += transaction.amount;
    }
    summary.hasTransactions = true;
    return summary;
  }, { income: 0, expense: 0, hasTransactions: false });
}

export function buildPeriodFinancialSummary(
  transactions: Transaction[],
  filter: CashflowChartFilter,
): PeriodFinancialSummary {
  const current = sumPeriod(transactions, filter);
  const previous = sumPeriod(transactions, getPreviousPeriod(filter));
  const net = current.income - current.expense;

  if (!previous.hasTransactions) {
    return {
      income: current.income,
      expense: current.expense,
      net,
      previousNet: null,
      growthRate: null,
      growthStatus: "no-previous-data",
    };
  }

  const previousNet = previous.income - previous.expense;
  if (previousNet === 0) {
    return {
      income: current.income,
      expense: current.expense,
      net,
      previousNet,
      growthRate: null,
      growthStatus: "previous-period-zero",
    };
  }

  return {
    income: current.income,
    expense: current.expense,
    net,
    previousNet,
    growthRate: ((net - previousNet) / Math.abs(previousNet)) * 100,
    growthStatus: "available",
  };
}

export function buildCategoryShareData(
  transactions: Transaction[],
  filter: CashflowChartFilter,
  type: TransactionType,
): CategoryShareData {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (!isValidTransaction(transaction) || transaction.type !== type || !isInPeriod(transaction, filter)) {
      continue;
    }

    const category = transaction.category.trim() || "Khác";
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount);
  }

  const entries = [...totals.entries()].sort(([, left], [, right]) => right - left);
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  return {
    labels: entries.map(([category]) => category),
    values: entries.map(([, amount]) => amount),
    percentages: entries.map(([, amount]) => Number(((amount / total) * 100).toFixed(2))),
    total,
  };
}

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
    if (!isValidTransaction(transaction)) {
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
