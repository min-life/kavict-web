# Finance Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Replace forced finance-plan onboarding with independent tabs for transaction entry, budgets, reports, and Kavi Advisor.

**Architecture:** Keep FinancialPlan, Transaction, and FinanceRepository as the persistence boundary. Add pure finance helpers for monthly state and deterministic local samples, a server-only typed Advisor route for production Gemini calls, and small client tab components. One workspace shell owns the plan and transactions; every save refreshes the other tabs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Chart.js 4, Vitest 4, Firebase Firestore, Gemini.

## Global Constraints

- Preserve /dashboard/finance-management, authentication, sidebar navigation, and local/Firebase finance adapters.
- Do not require a financial plan to add transactions, configure budgets, or view reports.
- Use Vietnamese copy, semantic theme tokens, and responsive layouts.
- Production AI uses a Route Handler and GOOGLE_GENAI_API_KEY only on the server. Do not expose any AI key to client code.
- NEXT_PUBLIC_KAVICT_MODE=local prevents Advisor network requests. Its local response requests Yes; yes, YES, and whitespace-surrounded Yes create a deterministic sample plan.
- A production AI proposal is previewed and must be explicitly applied; never auto-save it.
- Before editing an existing function/class/method run gitnexus_impact({ target, direction: "upstream" }); if the index is stale, run npx gitnexus analyze and retry. Report HIGH or CRITICAL risk before editing.
- Before each commit run gitnexus_detect_changes(). Stage only task files; never include the pre-existing staged AGENTS.md or CLAUDE.md changes.

---

## File structure

- features/finance/workspace.ts: month filtering, category-budget progress, alert statuses, Yes recognition, and local sample plan.
- features/finance/workspace.test.ts: pure finance behavior.
- features/finance/advisor.ts: serializable Advisor types and strict JSON plan-candidate parsing.
- features/finance/advisor.test.ts: candidate parsing behavior.
- app/api/finance-advisor/route.ts: production Gemini request validation and typed response boundary.
- app/api/finance-advisor/route.test.ts: Route Handler success/failure tests with mocked Gemini.
- app/dashboard/finance-management/components/FinanceWorkspace.tsx: authenticated data loading, tab state, cross-tab refresh, and alerts.
- app/dashboard/finance-management/components/TransactionEntryTab.tsx: manual income/expense entry and recent transaction edits.
- app/dashboard/finance-management/components/PlanBudgetTab.tsx: plan/budget editing and monthly progress.
- app/dashboard/finance-management/components/ReportsTab.tsx: Chart.js overview report panel.
- app/dashboard/finance-management/components/KaviAdvisorTab.tsx: chat, local sample creation, production proposal, and apply action.
- app/dashboard/finance-management/page.tsx: thin route entry that renders FinanceWorkspace.
- app/dashboard/components/FinancialOverview.tsx: shared chart component reused unchanged by the reporting adapter.

### Task 1: Add pure finance workspace helpers

**Files:**

- Create: features/finance/workspace.ts
- Create: features/finance/workspace.test.ts

**Interfaces:**

- Consumes: FinancialPlan, Transaction, and a timestamp.
- Produces: getMonthlySummary(), getBudgetProgress(), createLocalSamplePlan(), and isLocalSampleConfirmation().

- [ ] **Step 1: Write failing helper tests**

    const july = new Date(2026, 6, 15).getTime();

    expect(getMonthlySummary(transactions, july)).toMatchObject({
      income: 5_000_000, expense: 1_050_000,
    });
    expect(getBudgetProgress(plan, transactions, july).categories).toContainEqual({
      category: "Ăn uống", budget: 1_000_000, spent: 900_000,
      percent: 90, status: "near-limit",
    });
    expect(isLocalSampleConfirmation("  YES ")).toBe(true);
    expect(createLocalSamplePlan(july)).toMatchObject({
      monthlyIncome: 8_000_000, budgets: expect.any(Array),
    });

- [ ] **Step 2: Run the test to verify it fails**

Run: npm test -- features/finance/workspace.test.ts

Expected: FAIL because the helper module is absent.

- [ ] **Step 3: Implement fixed, testable finance rules**

    export type BudgetStatus = "on-track" | "near-limit" | "over-budget";

    export function isLocalSampleConfirmation(input: string) {
      return input.trim().toLowerCase() === "yes";
    }

    export function getMonthlySummary(transactions: Transaction[], timestamp: number) {
      const date = new Date(timestamp);
      return transactions
        .filter((transaction) => {
          const itemDate = new Date(transaction.date);
          return itemDate.getFullYear() === date.getFullYear()
            && itemDate.getMonth() === date.getMonth();
        })
        .reduce((summary, transaction) => transaction.type === "income"
          ? { ...summary, income: summary.income + transaction.amount }
          : { ...summary, expense: summary.expense + transaction.amount },
          { income: 0, expense: 0 });
    }

Return a progress row for every plan.budgets item. Calculate percent as budget === 0 ? 0 : Math.round(spent / budget * 100); status is over-budget above 100, near-limit from 80 through 100, otherwise on-track. createLocalSamplePlan(now) sets createdAt and updatedAt to now; it includes 8,000,000 VND monthly income, Vietnamese expense categories, and at least one savings goal.

- [ ] **Step 4: Run focused verification**

Run: npm test -- features/finance/workspace.test.ts && npm run typecheck

Expected: helper tests pass and TypeScript exits 0.

- [ ] **Step 5: Detect scope and commit**

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

Expected: only the new helper/test finance symbols appear; no auth, route, or dashboard flow is affected.

    git add features/finance/workspace.ts features/finance/workspace.test.ts
    git commit -m "feat: add finance workspace helpers"

### Task 2: Add the production Advisor contract and Route Handler

**Files:**

- Create: features/finance/advisor.ts
- Create: features/finance/advisor.test.ts
- Create: app/api/finance-advisor/route.ts
- Create: app/api/finance-advisor/route.test.ts

**Interfaces:**

- Consumes: FinancialPlan | null, monthly summary, and AdvisorMessage[].
- Produces: POST /api/finance-advisor -> FinanceAdvisorResponse.

- [ ] **Step 1: Write failing parser and route tests**

    expect(extractPlanCandidate(
      'Đề xuất:
```json
{"currentBalance":2000000,"monthlyIncome":8000000,"fixedExpenses":[],"goals":[],"budgets":[],"createdAt":1,"updatedAt":1}
```',
    )).toMatchObject({ monthlyIncome: 8_000_000 });
    expect(extractPlanCandidate("```json
{bad json}
```")).toBeNull();

    const response = await POST(new Request("http://localhost/api/finance-advisor", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: "Tôi có thu nhập 8 triệu", history: [], plan: null,
        monthlySummary: { income: 0, expense: 0 },
      }),
    }));
    expect(await response.json()).toMatchObject({
      text: expect.any(String), plan: null,
    });

- [ ] **Step 2: Run the tests to verify they fail**

Run: npm test -- features/finance/advisor.test.ts app/api/finance-advisor/route.test.ts

Expected: FAIL because the contract and handler do not exist.

- [ ] **Step 3: Define and validate the advisor protocol**

    export type AdvisorMessage = { sender: "user" | "assistant"; text: string };
    export type FinanceAdvisorResponse = { text: string; plan: FinancialPlan | null };

    export function extractPlanCandidate(text: string): FinancialPlan | null {
      const match = text.match(/```(?:json)?s*([sS]*?)s*```/i);
      if (!match) return null;
      try {
        const value = JSON.parse(match[1]) as Partial<FinancialPlan>;
        if (typeof value.currentBalance !== "number"
          || typeof value.monthlyIncome !== "number"
          || !Array.isArray(value.fixedExpenses)
          || !Array.isArray(value.goals)
          || !Array.isArray(value.budgets)) return null;
        return { ...value, createdAt: Date.now(), updatedAt: Date.now() } as FinancialPlan;
      } catch { return null; }
    }

- [ ] **Step 4: Implement the server-only route**

Use getGeminiResponse in app/api/finance-advisor/route.ts. Reject a missing/non-string message with status 400. Build a Vietnamese system instruction requiring Kavi to collect current balance, monthly income, regular expenses, spending style, and goals before a human-readable proposal. Only then it may append complete FinancialPlan JSON. Return the response text with its JSON fence removed and plan: extractPlanCandidate(response.text). On Gemini failure return status 500 with error: "Không thể kết nối Kavi Advisor. Vui lòng thử lại." Keep GOOGLE_GENAI_API_KEY only behind lib/server/gemini.ts.

- [ ] **Step 5: Run focused verification**

Run: npm test -- features/finance/advisor.test.ts app/api/finance-advisor/route.test.ts && npm run typecheck

Expected: malformed/incomplete candidates are rejected; the mocked Gemini response maps to typed output; TypeScript exits 0.

- [ ] **Step 6: Detect scope and commit**

Before changing getGeminiResponse run: gitnexus_impact({ repo: "kavict-web", target: "getGeminiResponse", direction: "upstream", minConfidence: 0.8 }).

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

    git add features/finance/advisor.ts features/finance/advisor.test.ts app/api/finance-advisor/route.ts app/api/finance-advisor/route.test.ts
    git commit -m "feat: add finance advisor API"

### Task 3: Replace forced onboarding with the four-tab workspace shell

**Files:**

- Modify: app/dashboard/finance-management/page.tsx
- Create: app/dashboard/finance-management/components/FinanceWorkspace.tsx
- Create: app/dashboard/finance-management/financeWorkspace.test.ts

**Interfaces:**

- Consumes: useAuth(), FinanceRepository.getPlan(), and FinanceRepository.getTransactions().
- Produces: plan, transactions, refreshFinance(), and onPlanSaved(plan) for tab panels.

- [ ] **Step 1: Write a failing route-composition test**

    expect(pageSource).toContain('import FinanceWorkspace from "./components/FinanceWorkspace"');
    expect(pageSource).not.toContain("OnboardingPlanner");
    expect(workspaceSource).toContain('"Nhập liệu"');
    expect(workspaceSource).toContain('"Kế hoạch & Ngân sách"');
    expect(workspaceSource).toContain('"Thống kê và Báo cáo"');
    expect(workspaceSource).toContain('"Kavi Advisor"');

- [ ] **Step 2: Run the test to verify it fails**

Run: npm test -- app/dashboard/finance-management/financeWorkspace.test.ts

Expected: FAIL because the workspace and four tab labels are absent.

- [ ] **Step 3: Implement the workspace shell and accessible tabs**

    const TABS = [
      { id: "entry", label: "Nhập liệu", icon: "edit_note" },
      { id: "plan", label: "Kế hoạch & Ngân sách", icon: "account_balance_wallet" },
      { id: "reports", label: "Thống kê và Báo cáo", icon: "bar_chart" },
      { id: "advisor", label: "Kavi Advisor", icon: "smart_toy" },
    ] as const;

    <div role="tablist" aria-label="Quản lý tài chính">
      {TABS.map((tab) => (
        <button role="tab" aria-selected={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
      ))}
    </div>

FinanceWorkspace loads plan and transactions in one user.uid-keyed effect. refreshFinance() uses Promise.all over repository.getPlan(uid) and repository.getTransactions(uid). Keep signed-out/loading states; default active tab is entry; no condition may render OnboardingPlanner. page.tsx only renders FinanceWorkspace.

- [ ] **Step 4: Run focused verification**

Run: npm test -- app/dashboard/finance-management/financeWorkspace.test.ts && npm run typecheck

Expected: composition test passes and no prop crosses a Server/Client boundary.

- [ ] **Step 5: Detect impact and commit**

Before editing the route function run: gitnexus_impact({ repo: "kavict-web", target: "AIAssistantPage", direction: "upstream", file_path: "app/dashboard/finance-management/page.tsx", minConfidence: 0.8 }). If unresolved, run npx gitnexus analyze and retry once.

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

    git add app/dashboard/finance-management/page.tsx app/dashboard/finance-management/components/FinanceWorkspace.tsx app/dashboard/finance-management/financeWorkspace.test.ts
    git commit -m "feat: add finance workspace tabs"

### Task 4: Implement transaction entry and budget setup

**Files:**

- Create: app/dashboard/finance-management/components/TransactionEntryTab.tsx
- Create: app/dashboard/finance-management/components/PlanBudgetTab.tsx
- Modify: app/dashboard/finance-management/components/FinanceWorkspace.tsx

**Interfaces:**

- Consumes: FinanceRepository, FinancialPlan | null, Transaction[], getBudgetProgress(), and onSaved().
- Produces: immediately persisted transactions, editable budget plans, and current-month alerts.

- [ ] **Step 1: Add entry that works before a plan exists**

    const [draft, setDraft] = useState({
      type: "expense" as TransactionType, amount: 0, category: "Ăn uống",
      note: "", date: Date.now(),
    });
    await repository.addTransaction(userId, { ...draft, createdAt: Date.now() });
    await onSaved();

Render income/expense switch, date, note, MoneyInput, amount, and a category grid. Expenses use plan?.budgets plus Ăn uống, Nhà ở, Đi lại, Học tập, and Khác. Income uses Tiền lương and Khác. Disable saving non-positive amounts. Reuse update/delete repository operations for recent records; only update currentBalance when a non-null plan exists.

- [ ] **Step 2: Add plan/budget setup and progress rows**

    const basePlan: FinancialPlan = plan ?? {
      currentBalance: 0, monthlyIncome: 0, fixedExpenses: [], goals: [], budgets: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    await repository.savePlan(userId, { ...basePlan, monthlyIncome, budgets });
    await onSaved();

Render selected month, total allocated/spent/remaining values, add/remove category controls, and getBudgetProgress(basePlan, transactions, selectedMonth).categories. Use primary below 80%, amber between 80–100%, error above 100%, and a text status alongside each color.

- [ ] **Step 3: Wire alerts through the workspace**

After onSaved(), recompute progress for the current month. Render a dismissible in-page warning naming each near-limit or over-budget category. Do not use browser notifications, background work, or a new repository schema.

- [ ] **Step 4: Manually verify the no-plan path**

Run: NEXT_PUBLIC_KAVICT_MODE=local npm run dev

Verify at http://localhost:3000/dashboard/finance-management: clear local finance data; add income and expense before a plan; reload and confirm persistence; configure budgets; add a high expense and confirm progress/alert change.

- [ ] **Step 5: Run focused verification and commit**

Run: npm test -- features/finance/workspace.test.ts app/dashboard/finance-management/financeWorkspace.test.ts && npm run typecheck

Before editing FinanceWorkspace run: gitnexus_impact({ repo: "kavict-web", target: "FinanceWorkspace", direction: "upstream", minConfidence: 0.8 }).

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

    git add app/dashboard/finance-management/components/FinanceWorkspace.tsx app/dashboard/finance-management/components/TransactionEntryTab.tsx app/dashboard/finance-management/components/PlanBudgetTab.tsx
    git commit -m "feat: add finance entry and budgets"

### Task 5: Put existing charts into the report tab

**Files:**

- Create: app/dashboard/finance-management/components/ReportsTab.tsx
- Modify: app/dashboard/finance-management/components/FinanceWorkspace.tsx

**Interfaces:**

- Consumes: transactions, FinancialPlan | null, and buildCashflowChartData().
- Produces: cashflow chart/summary cards in Reports with reliable empty state.

- [ ] **Step 1: Add a report adapter with zero-plan fallback**

    const emptyPlan: FinancialPlan = {
      currentBalance: 0, monthlyIncome: 0, fixedExpenses: [], goals: [], budgets: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    return <FinancialOverview plan={plan ?? emptyPlan} transactions={transactions} />;

Keep existing year/month filter and Chart.js behavior. When transactions.length === 0, show Vietnamese empty-state copy below the heading.

- [ ] **Step 2: Keep shared dashboard overview safe**

Keep FinancialOverview's existing non-null FinancialPlan interface: ReportsTab provides emptyPlan, while app/dashboard/page.tsx remains unchanged. Remove the former chart overview from entry and plan tabs so reports are its only finance-workspace home.

- [ ] **Step 3: Run report regression tests**

Run: npm test -- features/finance/chartData.test.ts app/dashboard/dashboardContent.test.ts && npm run typecheck

Expected: cashflow and dashboard-home tests pass.

- [ ] **Step 4: Detect impact and commit**

Before adding ReportsTab, run gitnexus_query({ repo: "kavict-web", query: "FinancialOverview finance reports", task_context: "reuse the shared cashflow chart without changing dashboard home" }) and confirm the adapter is the only finance-management consumer added.

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

    git add app/dashboard/finance-management/components/ReportsTab.tsx app/dashboard/finance-management/components/FinanceWorkspace.tsx
    git commit -m "feat: add finance reports tab"

### Task 6: Implement Kavi Advisor production chat and local sample sync

**Files:**

- Create: app/dashboard/finance-management/components/KaviAdvisorTab.tsx
- Modify: app/dashboard/finance-management/components/FinanceWorkspace.tsx
- Modify: app/dashboard/finance-management/financeWorkspace.test.ts

**Interfaces:**

- Consumes: runtimeMode, getRuntimeCapabilities(), advisor helpers, current plan, monthly summary, and onPlanApplied().
- Produces: chat messages, explicit production apply action, and persisted local sample plan.

- [ ] **Step 1: Extend the route-composition test**

    expect(advisorSource).toContain("bạn đang ở môi trường local nên không thể kết nối AI");
    expect(advisorSource).toContain("Yes");
    expect(advisorSource).toContain("isLocalSampleConfirmation");
    expect(advisorSource).toContain('fetch("/api/finance-advisor"');

- [ ] **Step 2: Run the test to verify it fails**

Run: npm test -- app/dashboard/finance-management/financeWorkspace.test.ts

Expected: FAIL because KaviAdvisorTab is absent.

- [ ] **Step 3: Implement local and production message paths**

    if (!aiAvailable) {
      if (!isLocalSampleConfirmation(message)) {
        appendAssistant("Bạn đang ở môi trường local nên không thể kết nối AI. Bạn muốn tôi tạo sample thì hãy enter Yes.");
        return;
      }
      const samplePlan = createLocalSamplePlan(Date.now());
      await repository.savePlan(userId, samplePlan);
      await onPlanApplied(samplePlan);
      appendAssistant("Tôi đã tạo sample và đồng bộ vào Kế hoạch & Ngân sách.");
      return;
    }

For production, post { message, history, plan, monthlySummary } to /api/finance-advisor. Append data.text and set a proposal preview only if data.plan is non-null. Áp dụng kế hoạch calls repository.savePlan(userId, proposal), awaits onPlanApplied(proposal), clears preview, and switches the shell active tab to plan. Show a retryable Vietnamese error message for a non-OK response. The local branch never calls fetch.

- [ ] **Step 4: Run focused verification**

Run: npm test -- app/dashboard/finance-management/financeWorkspace.test.ts features/finance/workspace.test.ts features/finance/advisor.test.ts && npm run typecheck

Expected: source contract and pure finance/advisor tests pass.

- [ ] **Step 5: Manually verify Advisor modes**

Run local mode: NEXT_PUBLIC_KAVICT_MODE=local npm run dev

Verify local Advisor shows the exact explanation, ignores arbitrary input, accepts  Yes , shows completion, persists the sample, and displays allocations in the Plan tab after reload.

Run production-configured mode with valid Firebase and GOOGLE_GENAI_API_KEY values. Verify Kavi asks follow-up questions before a proposal, the proposal remains editable/unapplied until Áp dụng kế hoạch, and applying it updates the Plan tab without reload.

- [ ] **Step 6: Detect impact and commit**

Before editing FinanceWorkspace run: gitnexus_impact({ repo: "kavict-web", target: "FinanceWorkspace", direction: "upstream", minConfidence: 0.8 }).

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

    git add app/dashboard/finance-management/components/KaviAdvisorTab.tsx app/dashboard/finance-management/components/FinanceWorkspace.tsx app/dashboard/finance-management/financeWorkspace.test.ts
    git commit -m "feat: add Kavi finance advisor"

### Task 7: Remove superseded forced-flow components and verify end to end

**Files:**

- Delete: app/dashboard/finance-management/components/OnboardingPlanner.tsx
- Delete: app/dashboard/finance-management/components/FinancialDashboard.tsx
- Modify: app/dashboard/finance-management/financeWorkspace.test.ts

**Interfaces:**

- Consumes: completed workspace tabs and current finance repository.
- Produces: no active import/reference to the forced onboarding or monolithic dashboard components.

- [ ] **Step 1: Write the failing removal assertion**

    expect(pageSource).not.toContain("OnboardingPlanner");
    expect(pageSource).not.toContain("FinancialDashboard");
    expect(existsSync(resolve(__dirname, "components/OnboardingPlanner.tsx"))).toBe(false);
    expect(existsSync(resolve(__dirname, "components/FinancialDashboard.tsx"))).toBe(false);

- [ ] **Step 2: Run the test to verify it fails**

Run: npm test -- app/dashboard/finance-management/financeWorkspace.test.ts

Expected: FAIL while the superseded files still exist.

- [ ] **Step 3: Remove only confirmed superseded files**

Run: rg -n "OnboardingPlanner|FinancialDashboard" app features

Confirm references are only the finance-management route before deletion. Remove the two files. Retain MoneyInput.tsx and IconPicker.tsx when the new tabs still import them.

- [ ] **Step 4: Run all checks**

Run: npm test && npm run typecheck && npm run lint && git diff --check

Expected: tests/typecheck pass, lint has zero errors (report pre-existing warnings separately), and diff check is silent.

- [ ] **Step 5: Run build and manual feature verification**

Run: npm run build

Expected: exit 0. If restricted sandbox font downloading blocks it, repeat in a network-capable environment and report that environmental distinction.

Verify desktop/mobile and light/dark at /dashboard/finance-management: four accessible tabs, pre-plan entry, plan budgets/progress/warnings, reports chart, production/local Advisor behavior, explicit apply synchronization, and no forced onboarding.

- [ ] **Step 6: Final scope detection and commit**

Run: gitnexus_detect_changes({ repo: "kavict-web", scope: "all" })

Expected: only finance workspace/advisor symbols; no unrelated auth, learning, game, sidebar, or redirect flows.

    git add app/dashboard/finance-management/financeWorkspace.test.ts app/dashboard/finance-management/page.tsx app/dashboard/finance-management/components
    git rm app/dashboard/finance-management/components/OnboardingPlanner.tsx app/dashboard/finance-management/components/FinancialDashboard.tsx
    git commit -m "refactor: remove forced finance onboarding"

## Plan self-review

- Spec coverage: Task 1 delivers month calculations, progress, threshold rules, and local samples; Task 2 delivers the server-only Gemini boundary; Task 3 makes every requested tab available without gating; Tasks 4–6 implement entry, budgets, reports, and Advisor synchronization; Task 7 removes the old flow and verifies it end to end.
- Failure behavior: no plan, no transactions, malformed AI plans, API errors, and unavailable local AI each have a user-visible, non-destructive path.
- Type consistency: FinancialPlan and Transaction remain repository contracts. FinanceAdvisorResponse returns FinancialPlan | null, and only KaviAdvisorTab applies a non-null plan. getBudgetProgress is the only source of budget thresholds.
- Scope: no new authentication, notification transport, persistence provider, navigation route, sidebar, or client-secret behavior is introduced.
