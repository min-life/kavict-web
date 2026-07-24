## Task 2: Build the monthly summary and spending-plan read-only/edit flow

**Files:**
- Create: `app/dashboard/finance-management/components/PlanBudgetSummary.tsx`
- Create: `app/dashboard/finance-management/components/SpendingPlanSection.tsx`
- Modify: `app/dashboard/finance-management/components/PlanBudgetTab.tsx`
- Modify: `app/dashboard/finance-management/financeWorkspace.test.ts`

**Interfaces:**
- `PlanBudgetSummary` consumes `BudgetProgress` and `PlanStatusSummary`; it has no local persistence state.
- `SpendingPlanSection` consumes `plan`, `progress.categories`, `onSave(nextPlan)`, and renders read-only until its own `isEditing` is true.
- `PlanBudgetTab` becomes the orchestrator and still accepts `userId`, `plan`, `transactions`, and `onSaved`.

- [ ] **Step 1: Run upstream impact analysis before editing `PlanBudgetTab`.**

Run through GitNexus MCP:

```ts
await gitnexus_impact({ repo: "kavict-web", target: "PlanBudgetTab", direction: "upstream", minConfidence: 0.8, maxDepth: 3, includeTests: true });
```

Expected: record all direct component callers. Stop and report if risk is HIGH or CRITICAL.

- [ ] **Step 2: Write failing composition tests.**

Add one test to `app/dashboard/finance-management/financeWorkspace.test.ts`:

```ts
it("keeps the spending plan read-only until the explicit edit action", () => {
  const source = readFileSync(resolve(componentDirectory, "SpendingPlanSection.tsx"), "utf8");

  expect(source).toContain("Chỉnh sửa kế hoạch");
  expect(source).toContain("Lưu kế hoạch");
  expect(source).toContain("Hủy");
  expect(source).toContain("< 90%");
  expect(source).toContain("90–100%");
  expect(source).toContain("> 100%");
});
```

Also assert `PlanBudgetSummary.tsx` contains `Tổng thu nhập`, `Tổng plan tháng này`, `Đã tiêu dùng`, and all three status-card headings.

- [ ] **Step 3: Run the composition test and verify it fails because both new component files are absent.**

Run:

```bash
npm test -- app/dashboard/finance-management/financeWorkspace.test.ts
```

Expected: FAIL with `ENOENT` for `SpendingPlanSection.tsx` or `PlanBudgetSummary.tsx`.

- [ ] **Step 4: Implement the summary and spending section.**

`PlanBudgetSummary.tsx` must show summary values using `getMonthlySummary`/`getBudgetProgress`: actual selected-month income, allocated budget total, and actual expense. Apply `bg-success/10 text-success` to expense when `expense <= allocated`; otherwise `bg-error/10 text-error`.

Use these spending thresholds in `SpendingPlanSection.tsx`:

```ts
const tone = percent > 100 ? "error" : percent >= 90 ? "warning" : "success";
const width = Math.min(percent, 100);
```

The read-only row must contain the icon fallback `category`, category name, `spent / budget ₫`, exact `percent%`, and a capped progress bar. Only edit mode renders inputs and add/delete actions. Make `save` filter entries whose trimmed category is empty or amount is not finite/non-negative; call `onSave` only after constructing `nextPlan` with a fresh `updatedAt`. Hủy restores the last persisted `plan` snapshot and returns to read-only without saving.

`PlanBudgetTab.tsx` should derive `monthTimestamp`, `budgetProgress`, `incomeProgress`, and `statusSummary` once with `useMemo`, then pass them into children. It must no longer render editable budget inputs at first paint.

- [ ] **Step 5: Run focused UI/source and helper tests.**

Run:

```bash
npm test -- app/dashboard/finance-management/financeWorkspace.test.ts features/finance/workspace.test.ts
```

Expected: PASS; no existing Finance workspace composition assertion regresses.

