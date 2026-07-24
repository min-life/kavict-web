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

  it("extracts income plans and objectives from Kavi's proposal", () => {
    expect(extractPlanCandidate(`\`\`\`json
{
  "currentBalance": 2000000,
  "monthlyIncome": 8000000,
  "fixedExpenses": [],
  "goals": [],
  "budgets": [],
  "incomePlans": [{ "id": "edit-gigs", "name": "Nhận job edit", "unit": "count", "target": 5, "manualProgress": 1 }],
  "objectives": [{ "id": "shirts", "name": "Mua 2 cái áo", "isCompleted": false }]
}
\`\`\``)).toMatchObject({
      incomePlans: [{ id: "edit-gigs", target: 5, manualProgress: 1 }],
      objectives: [{ id: "shirts", isCompleted: false }],
    });
  });

  it("preserves income plans and objectives when Kavi does not modify them", () => {
    const currentPlan = {
      currentBalance: 1_000_000,
      monthlyIncome: 7_000_000,
      fixedExpenses: [],
      goals: [],
      budgets: [],
      incomePlans: [{ id: "tutoring", name: "Dạy kèm", unit: "amount" as const, target: 2_000_000, manualProgress: 0 }],
      objectives: [{ id: "reserve", name: "Quỹ dự phòng", isCompleted: false }],
      createdAt: 1,
      updatedAt: 1,
    };

    expect(extractPlanCandidate(`\`\`\`json
{"currentBalance":2000000,"monthlyIncome":8000000,"fixedExpenses":[],"goals":[],"budgets":[]}
\`\`\``, currentPlan)).toMatchObject({
      incomePlans: currentPlan.incomePlans,
      objectives: currentPlan.objectives,
    });
  });
});
