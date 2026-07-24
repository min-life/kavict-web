## Task 3: Add income-plan and manual-objective sections

**Files:**
- Create: `app/dashboard/finance-management/components/IncomePlanSection.tsx`
- Create: `app/dashboard/finance-management/components/ObjectivesSection.tsx`
- Modify: `app/dashboard/finance-management/components/PlanBudgetTab.tsx`
- Modify: `app/dashboard/finance-management/financeWorkspace.test.ts`

**Interfaces:**
- `IncomePlanSection` receives `incomePlans: IncomePlan[]`, `progress: IncomePlanProgressItem[]`, and `onSave(nextIncomePlans)`.
- `ObjectivesSection` receives `objectives: Objective[]`, `onSave(nextObjectives)` for edit-mode lists, and `onToggleComplete(id, isCompleted)` for an immediate checkbox save.
- `PlanBudgetTab` converts each child update into `{ ...basePlan, incomePlans }` or `{ ...basePlan, objectives }`, calls `getFinanceRepository().savePlan`, then awaits `onSaved`.

- [ ] **Step 1: Run upstream impact analysis before editing `PlanBudgetTab` again.**

Run through GitNexus MCP:

```ts
await gitnexus_impact({ repo: "kavict-web", target: "PlanBudgetTab", direction: "upstream", minConfidence: 0.8, maxDepth: 3, includeTests: true });
```

Expected: ensure Task 2 did not broaden the component's public caller set to HIGH or CRITICAL risk.

- [ ] **Step 2: Write failing section-composition tests.**

Add source assertions to `app/dashboard/finance-management/financeWorkspace.test.ts`:

```ts
it("supports read-only income plans and manual objectives", () => {
  const income = readFileSync(resolve(componentDirectory, "IncomePlanSection.tsx"), "utf8");
  const objectives = readFileSync(resolve(componentDirectory, "ObjectivesSection.tsx"), "utf8");

  expect(income).toContain("Kế hoạch kiếm tiền");
  expect(income).toContain("Chỉnh sửa kế hoạch kiếm tiền");
  expect(income).toContain('unit === "amount"');
  expect(income).toContain("Tiến độ nhập tay");
  expect(objectives).toContain("Objective");
  expect(objectives).toContain("Đã hoàn thành");
  expect(objectives).toContain("Chỉnh sửa objective");
});
```

- [ ] **Step 3: Run the focused test and verify it fails due to missing component files.**

Run:

```bash
npm test -- app/dashboard/finance-management/financeWorkspace.test.ts
```

Expected: FAIL with `ENOENT` for `IncomePlanSection.tsx` and `ObjectivesSection.tsx`.

- [ ] **Step 4: Implement both read-only/editable sections and their persistence callbacks.**

For income plans, use this draft validation before save:

```ts
const validPlans = draft.filter((item) => (
  item.name.trim().length > 0
  && Number.isFinite(item.target)
  && item.target > 0
  && Number.isFinite(item.manualProgress)
  && item.manualProgress >= 0
));
```

Read-only items show icon, name, `current / target` with `₫` for amount or `lần` for count, exact percentage, and transaction-linked contribution when `transactionCategory` exists. Empty income plans render the full section in muted/gray styling and do not render fake progress.

For objectives, display the checkbox in read-only mode with `checked={objective.isCompleted}` and `onChange={() => onToggleComplete(objective.id, !objective.isCompleted)}`. Disable the checkbox while its save is pending to prevent a double write. Edit mode supports name/icon changes and removal, then saves the full filtered list. Empty objectives render muted/gray styling. Reuse `IconPicker` for all editable icon/color selectors without changing its public API.

- [ ] **Step 5: Run focused tests and typecheck.**

Run:

```bash
npm test -- app/dashboard/finance-management/financeWorkspace.test.ts features/finance/workspace.test.ts
npm run typecheck
```

Expected: all focused tests and TypeScript compile pass.

