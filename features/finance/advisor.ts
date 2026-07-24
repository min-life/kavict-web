import type { FinancialPlan } from "./domain";
import type { MonthlySummary } from "./workspace";

export type AdvisorMessage = {
  sender: "user" | "assistant";
  text: string;
};

export type FinanceAdvisorRequest = {
  message: string;
  history: AdvisorMessage[];
  plan: FinancialPlan | null;
  monthlySummary: MonthlySummary;
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
