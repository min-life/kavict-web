# Finance cashflow bar chart

## Goal

Replace the misleading balance-history line chart with a cashflow bar chart on the financial overview. It must show only periods that contain user-entered transactions and must not fabricate history before the first recorded transaction.

## Chart behavior

- The yearly view groups transactions by calendar month; the monthly view groups transactions by calendar day.
- Each populated period has two independent datasets around a zero baseline:
  - income is a green positive bar labelled `Thu vào`;
  - expenses are a red negative bar labelled `Chi tiêu`.
- Income and expenses in the same period are summed separately.
- Labels and data start at the first transaction in the selected period and end at the last transaction in that selected period. A period with no transaction before or after that range is omitted.
- If the selected period has no transactions, the chart shows no bars and keeps the zero baseline; it never derives values from `plan.currentBalance`.
- Tooltip values use Vietnamese currency formatting. The y-axis represents VND amounts, with a visible horizontal zero line.

## Scope and compatibility

- Keep the existing year/month controls and all summary cards unchanged.
- Implement the data grouping in a small pure helper with unit tests covering: no pre-history, income above zero, expense below zero, and grouping on the correct calendar bucket.
- `FinancialOverview` is shared by `/dashboard` and `/dashboard/finance-management`, so both routes receive the same correct chart behavior.

## Error handling

Transactions with an invalid date or a non-positive/non-finite amount are ignored when building chart data. An empty valid result renders safely without a fake line or historical balance.
