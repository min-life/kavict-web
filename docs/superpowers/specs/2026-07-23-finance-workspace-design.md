# Finance workspace design

## Goal

Replace the forced AI-plan onboarding on `/dashboard/finance-management` with a four-tab financial workspace. A signed-in user can record income and expenses before creating a financial plan. A plan made by Kavi Advisor is persisted through the existing finance repository and is immediately available in the Plan and Budget tab.

## Scope and constraints

- Keep `/dashboard/finance-management` as the canonical route and preserve the existing signed-in requirement.
- Keep the existing `FinancialPlan`, `Transaction`, and `FinanceRepository` contracts unless a narrowly scoped extension is needed for the workspace.
- Use the configured Gemini-backed server API in production. Never expose an AI key to client code.
- In local mode, do not call an AI API. Kavi must explain that local mode cannot connect to AI and ask the user to enter `Yes`; a case-insensitive `Yes` creates and saves a deterministic sample plan.
- Existing plans and transactions remain usable. Neither data entry nor reports require a plan.
- This change does not add browser/OS push notifications or a long-lived advisor-chat history.

## User experience

The page has a shared title and a four-item tab bar:

1. **Nhập liệu** is the default tab. It provides an income/expense switch, date, note, formatted amount, and category picker for expenses. Submitting writes a transaction immediately. Recent transactions can be edited or deleted with the existing balance behavior preserved when a plan exists.
2. **Kế hoạch & Ngân sách** shows the selected month, a monthly budget setup and per-category allocations. Each allocation displays spent amount, remaining amount, a semantic-colour progress bar, and an over-budget state. It remains useful with no plan by offering direct setup instead of redirecting to Advisor.
3. **Thống kê và Báo cáo** contains the existing cash-flow chart and headline cards. It calculates from transactions for the selected period and renders a clear empty state when none exist.
4. **Kavi Advisor** is a chat-like conversation. In production it sends the user's situation, spending preferences, goals, prior advisor messages, and relevant current finance context to a server endpoint. The assistant asks targeted follow-up questions when information is missing, proposes a structured plan, and offers an explicit action to apply it. Applying saves the plan, switches/synchronizes the Plan tab, and leaves it editable.

## Architecture and data flow

`page.tsx` becomes a lightweight authenticated workspace shell. It fetches the plan and transactions independently and owns a single refresh/update path shared by all tabs. The former conditional rendering of `OnboardingPlanner` versus `FinancialDashboard` is removed.

- Finance-domain helpers derive the active month's income, expense, category spend, and budget status from transactions. They accept a missing plan, allowing records and reports to work first.
- The data-entry and plan-budget UI both use `getFinanceRepository()` and return their saved result to the shell so all four tabs observe current data without a reload.
- Advisor plan extraction is explicit: a successful response contains user-facing text plus an optional validated `FinancialPlan` candidate. The UI never auto-saves an AI proposal; the user must choose to apply it.
- When the local-mode Advisor receives `Yes`, a deterministic sample `FinancialPlan` with Vietnamese categories, budgets, and a savings goal is saved via `savePlan`. The assistant appends a completion message and provides the same apply/sync result as production.

## Failure and empty states

- No plan: data entry, reports, and plan setup stay available; Advisor shows an invitation rather than a blocking onboarding screen.
- No transactions: report/chart and budget progress show zero-state copy rather than broken totals.
- API/network failure: keep the conversation and show a Vietnamese retryable error; do not change the existing plan.
- Invalid AI plan data: render the text reply but withhold the Apply action.
- A newly added expense triggers an in-page warning when it reaches a near-limit threshold or exceeds a category/monthly allocation. The warning is dismissible and recalculated from persisted data.

## Test strategy

- Add pure unit tests for monthly transaction summaries, budget percentage/threshold states, and sample-plan generation.
- Test local Advisor interaction: initial local explanation, case-insensitive `Yes`, persisted plan, and plan-tab synchronization callback.
- Test that a signed-in user with no plan sees the four-tab workspace and can submit a transaction; no onboarding component is rendered.
- Test production Advisor request/response mapping, including malformed plan candidates and API failures.
- Run focused Vitest tests, the complete test suite, `npm run typecheck`, `npm run lint`, and a production build when network/font access permits.

## Non-goals

- Automatic background tracking, browser push notifications, or financial advice beyond the user-visible plan context.
- Changing the dashboard route, sidebar navigation, authentication flow, or Firebase/local repository ownership model.
