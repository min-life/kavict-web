# Finance Cashflow Bar Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show real income and expense cashflow as green and red bars, beginning only at the first entered transaction.

**Architecture:** A pure finance helper groups valid transactions by the selected day or month and returns positive income plus negative expense series. `FinancialOverview` consumes that helper to configure Chart.js as a zero-based bar chart; it no longer derives historical balance from the current balance.

**Tech Stack:** TypeScript, Vitest, Chart.js 4, React 19, Next.js 16.

## Global Constraints

- Preserve existing year/month controls and financial summary cards.
- Do not show fabricated points before the first transaction.
- Income is green above zero; expense is red below zero.
- Keep the shared overview behavior identical on `/dashboard` and `/dashboard/finance-management`.

---

### Task 1: Cashflow grouping helper

**Files:**
- Create: `features/finance/chartData.ts`
- Create: `features/finance/chartData.test.ts`

**Interfaces:**
- Consumes: `Transaction` and `{ type: 'year' | 'month'; year: number; month?: number }`.
- Produces: `buildCashflowChartData(transactions, filter)` returning `{ labels, income, expense }`.

- [ ] **Step 1: Write the failing test**

```ts
expect(buildCashflowChartData(transactions, { type: 'year', year: 2026 })).toEqual({
  labels: ['T3', 'T4'], income: [500_000, 0], expense: [0, -120_000],
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- features/finance/chartData.test.ts`
Expected: FAIL because the helper is not defined.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildCashflowChartData(transactions: Transaction[], filter: ChartFilter) {
  // Filter valid transactions in the selected calendar period, aggregate by bucket,
  // and emit only the inclusive first-to-last populated bucket.
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- features/finance/chartData.test.ts`
Expected: PASS.

### Task 2: FinancialOverview bar rendering

**Files:**
- Modify: `app/dashboard/components/FinancialOverview.tsx`

**Interfaces:**
- Consumes: `buildCashflowChartData` output.
- Produces: a Chart.js `bar` chart with income and expense datasets.

- [ ] **Step 1: Replace derived balance data**

```ts
const cashflow = buildCashflowChartData(transactions, chartFilter);
data: { labels: cashflow.labels, datasets: [incomeDataset, expenseDataset] }
```

- [ ] **Step 2: Configure the zero baseline and money tooltip**

```ts
scales: { y: { beginAtZero: true } }
tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatVnd(context.parsed.y)}` } }
```

- [ ] **Step 3: Run focused test and typecheck**

Run: `npm test -- features/finance/chartData.test.ts && npm run typecheck`
Expected: PASS and exit 0.

### Task 3: Full verification and commit

**Files:**
- Modify: `features/finance/chartData.ts`
- Modify: `features/finance/chartData.test.ts`
- Modify: `app/dashboard/components/FinancialOverview.tsx`

- [ ] **Step 1: Run the complete test suite**

Run: `npm test`
Expected: all Vitest tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Inspect changed-symbol scope and commit only feature files**

Run: `gitnexus_detect_changes` and `git commit --only ... -m "feat: show finance cashflow bars"`.
Expected: only the cashflow helper, its test, the overview, and this plan are committed; existing staged instruction-file changes stay untouched.
