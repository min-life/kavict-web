import type { FinancialPlan, Transaction } from "./domain";
import type { MonthlySummary } from "./workspace";

export type AdvisorMessage = {
  sender: "user" | "assistant";
  text: string;
};

export const ADVISOR_USE_CASES = [
  "financial-planning",
  "spending-analysis",
  "financial-advice",
  "plan-adjustment",
  "general-advice",
] as const;

export type AdvisorUseCase = (typeof ADVISOR_USE_CASES)[number];
export type AdvisorTransactionContext = Pick<Transaction, "date" | "type" | "category" | "amount" | "note">;

export function isAdvisorUseCase(value: unknown): value is AdvisorUseCase {
  return typeof value === "string" && ADVISOR_USE_CASES.includes(value as AdvisorUseCase);
}

export function isAdvisorTransactionContext(value: unknown): value is AdvisorTransactionContext {
  if (typeof value !== "object" || value === null) return false;
  const transaction = value as Partial<AdvisorTransactionContext>;
  return typeof transaction.date === "number"
    && (transaction.type === "income" || transaction.type === "expense")
    && typeof transaction.category === "string"
    && typeof transaction.amount === "number"
    && (transaction.note === undefined || typeof transaction.note === "string");
}

export type FinanceAdvisorRequest = {
  message: string;
  history: AdvisorMessage[];
  useCase: AdvisorUseCase;
  plan: FinancialPlan | null;
  monthlySummary: MonthlySummary;
  transactions?: AdvisorTransactionContext[];
};

export type FinanceAdvisorResponse = {
  text: string;
  plan: FinancialPlan | null;
  fallback: boolean;
};

export function extractPlanCandidate(text: string): FinancialPlan | null {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (!match) return null;

  try {
    const value = JSON.parse(match[1]) as Partial<FinancialPlan>;
    if (
      typeof value.currentBalance !== "number"
      || typeof value.monthlyIncome !== "number"
      || !Array.isArray(value.fixedExpenses)
      || !Array.isArray(value.goals)
      || !Array.isArray(value.budgets)
    ) {
      return null;
    }

    const now = Date.now();
    return {
      currentBalance: value.currentBalance,
      monthlyIncome: value.monthlyIncome,
      fixedExpenses: value.fixedExpenses,
      goals: value.goals,
      budgets: value.budgets,
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

export function removePlanCandidate(text: string) {
  return text.replace(/```(?:json)?\s*[\s\S]*?\s*```/i, "").trim();
}
