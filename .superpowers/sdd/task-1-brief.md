## Task 1: Extend the plan domain and calculate two-plan progress

**Files:**
- Modify: `features/finance/domain.ts`
- Modify: `features/finance/workspace.ts`
- Modify: `features/finance/workspace.test.ts`

**Interfaces:**
- Produces `IncomePlan`, `Objective`, `getIncomePlanProgress`, and `getPlanStatusSummary` for all Finance UI code.
- `getIncomePlanProgress(plan, transactions, monthTimestamp)` returns one item per plan with `transactionProgress`, `current`, `percent`, and a capped `displayPercent`.
- `getPlanStatusSummary(plan, transactions, monthTimestamp)` returns `spending`, `income`, and `objectives` counters/tone without any JSX or repository access.

- [ ] **Step 1: Run upstream impact analysis before editing the domain and helper symbols.**

Run through GitNexus MCP:

```ts
await gitnexus_impact({ repo: "kavict-web", target: "FinancialPlan", direction: "upstream", minConfidence: 0.8, maxDepth: 3, includeTests: true });
await gitnexus_impact({ repo: "kavict-web", target: "getBudgetProgress", direction: "upstream", minConfidence: 0.8, maxDepth: 3, includeTests: true });
```

Expected: record direct consumers before changing types; stop and report if either risk is HIGH or CRITICAL.

- [ ] **Step 2: Write failing helper tests.**

Append these tests to `features/finance/workspace.test.ts` (using the existing July fixture), importing the new helpers:

```ts
it("combines income transactions and manual amount progress for a linked income plan", () => {
  const result = getIncomePlanProgress({
    ...plan,
    incomePlans: [{ id: "freelance", name: "Freelance edit", unit: "amount", target: 1_000_000, manualProgress: 200_000, transactionCategory: "Edit ngoài" }],
  }, [
    ...transactions,
    { amount: 600_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 4).getTime(), createdAt: july },
  ], july);

  expect(result).toEqual([expect.objectContaining({ id: "freelance", transactionProgress: 600_000, current: 800_000, percent: 80, displayPercent: 80 })]);
});

it("counts matching income records for count plans and preserves old plans without new arrays", () => {
  const result = getIncomePlanProgress({
    ...plan,
    incomePlans: [{ id: "edit-gigs", name: "Nhận job edit", unit: "count", target: 5, manualProgress: 1, transactionCategory: "Edit ngoài" }],
  }, [
    ...transactions,
    { amount: 200_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 4).getTime(), createdAt: july },
    { amount: 300_000, type: "income", category: "Edit ngoài", date: new Date(2026, 6, 7).getTime(), createdAt: july },
  ], july);

  expect(result[0]).toMatchObject({ transactionProgress: 2, current: 3, percent: 60 });
  expect(getIncomePlanProgress(plan, transactions, july)).toEqual([]);
});

it("returns neutral empty states and the requested spending, income, and objective tones", () => {
  expect(getPlanStatusSummary(plan, transactions, july)).toMatchObject({
    income: { total: 0, percent: 0, tone: "neutral" },
    objectives: { total: 0, completed: 0, percent: 0, tone: "neutral" },
  });
  expect(getPlanStatusSummary({
    ...plan,
    incomePlans: [{ id: "done", name: "Dạy kèm", unit: "count", target: 2, manualProgress: 2 }],
    objectives: [{ id: "shirt", name: "Mua 2 áo", isCompleted: true }],
  }, transactions, july)).toMatchObject({
    income: { total: 1, percent: 100, tone: "complete" },
    objectives: { total: 1, completed: 1, percent: 100, tone: "complete" },
  });
});
```

- [ ] **Step 3: Run the focused tests and verify they fail because the exports do not exist.**

Run:

```bash
npm test -- features/finance/workspace.test.ts
```

Expected: FAIL with TypeScript/Vitest errors identifying missing `getIncomePlanProgress` and `getPlanStatusSummary` exports, not a fixture or assertion error.

- [ ] **Step 4: Add the optional domain fields and minimal pure helpers.**

In `features/finance/domain.ts`, add exact exported types and optional fields:

```ts
export type IncomePlanUnit = "amount" | "count";

export interface IncomePlan {
  id: string;
  name: string;
  unit: IncomePlanUnit;
  target: number;
  manualProgress: number;
  transactionCategory?: string;
  icon?: string;
  color?: string;
}

export interface Objective {
  id: string;
  name: string;
  isCompleted: boolean;
  icon?: string;
  color?: string;
}
```

Add `incomePlans?: IncomePlan[]` and `objectives?: Objective[]` to `FinancialPlan`, leaving `goals` unchanged. In `features/finance/workspace.ts`, implement the helpers with this core aggregation:

```ts
const transactionProgress = transactions
  .filter((transaction) => transaction.type === "income" && transaction.category === incomePlan.transactionCategory && isInMonth(transaction.date, monthTimestamp))
  .reduce((total, transaction) => total + (incomePlan.unit === "count" ? 1 : transaction.amount), 0);
const current = incomePlan.manualProgress + transactionProgress;
const percent = incomePlan.target > 0 ? Math.round((current / incomePlan.target) * 100) : 0;
```

Reject invalid persisted values defensively by using zero for negative/non-finite `target` and `manualProgress`; do not mutate the input plan or transaction arrays. `getPlanStatusSummary` must use these exact tones: spending `complete | warning | danger | neutral`, income `complete | progress | neutral`, objectives `complete | neutral`.

- [ ] **Step 5: Run the focused helper tests and verify green.**

Run:

```bash
npm test -- features/finance/workspace.test.ts
```

Expected: PASS, including existing monthly summary/budget status tests.

