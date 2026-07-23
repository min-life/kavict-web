# Dashboard finance layout design

## Goal

Rearrange `/dashboard` using the approved balanced layout without changing the existing finance, learning, task, or Practice Space routes and behaviours.

## Approved layout

- Top row on large screens: `Nhập liệu` at 5/12 width and `Thống kê` at 7/12 width.
- `Nhập liệu` embeds the existing transaction-entry experience and writes through the existing finance repository.
- `Thống kê` is the existing financial overview/chart, relabelled from `Quản lý tài chính` only in the dashboard card.
- Bottom row contains three equal cards in this exact order: `Nhiệm vụ tuần`, `Học tập`, then `Practice Space`.
- Small screens retain a single-column stack in the same reading order.

## Component boundaries

- Keep finance persistence and validation in the existing transaction-entry component and repository.
- Keep chart calculations in `FinancialOverview`.
- Let the dashboard own the finance-data refresh callback so a saved transaction immediately updates the statistics card.

## Compatibility

- Preserve `/dashboard/finance-management`, `/dashboard/learning`, and `/dashboard/practice-space` destinations.
- Keep finance-management's standalone transaction tab unchanged for its current use.
- Do not rename exported symbols or introduce a route migration.

## Validation

- Add or update a dashboard content test to assert the new labels, component order, and existing routes.
- Run the focused Vitest test, the complete test suite, typecheck, and a production build when the environment permits.
