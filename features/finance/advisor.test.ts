import { describe, expect, it } from "vitest";
import { extractPlanCandidate } from "./advisor";

describe("finance advisor plan extraction", () => {
  it("accepts a complete FinancialPlan inside a JSON code fence", () => {
    expect(extractPlanCandidate(`Đề xuất của Kavi:

\`\`\`json
{
  "currentBalance": 2000000,
  "monthlyIncome": 8000000,
  "fixedExpenses": [],
  "goals": [],
  "budgets": []
}
\`\`\``)).toMatchObject({
      currentBalance: 2_000_000,
      monthlyIncome: 8_000_000,
      budgets: [],
    });
  });

  it("rejects malformed or incomplete plan candidates", () => {
    expect(extractPlanCandidate("```json\n{bad json}\n``` ")).toBeNull();
    expect(extractPlanCandidate("```json\n{\"monthlyIncome\": 8000000}\n``` ")).toBeNull();
  });
});
