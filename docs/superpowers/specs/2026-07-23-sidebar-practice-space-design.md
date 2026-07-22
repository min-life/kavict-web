# Sidebar Task Summary and Practice Space Design

## Goal

Reorganize the dashboard sidebar into a primary navigation group and a lower utility group, show initial static task progress, and rename the games experience to Practice Space at `/dashboard/practice-space` without preserving the old `/dashboard/games` URL.

## Scope

- Keep these primary navigation destinations and their existing behavior unchanged: `/dashboard`, `/dashboard/learning`, and `/dashboard/finance-management`.
- Move the existing games route tree from `app/dashboard/games` to `app/dashboard/practice-space`, including the solo route, so the new canonical URLs are `/dashboard/practice-space` and `/dashboard/practice-space/solo`.
- Update every in-app link and pathname check that points to the former games URLs.
- Rename user-facing navigation and dashboard-card language from “Trò chơi” to “Practice Space”; use the Material Symbols `target` icon in the sidebar and dashboard entry card.
- Do not add a route, redirect, fallback, persistence, or completion behavior for tasks in this iteration.
- Do not change the existing multiplayer or solo game mechanics, data contracts, or feature-internal `games` module names.

## Sidebar Layout

The sidebar retains its header, upgrade action, and account footer. Its content is reorganized as follows:

1. Primary navigation at the top: Trang chủ, Học tập, Quản lý tài chính, Practice Space.
2. A horizontal divider below the primary navigation.
3. A static “Nhiệm vụ” summary with two rows:
   - Nhiệm vụ ngày: “Hoàn thành 1 bài học”, `1/1`, complete progress.
   - Nhiệm vụ tuần: “Ghi chép chi tiêu 5 ngày”, `3/5`, 60% progress.
4. A lower divider followed by Bảng xếp hạng linked to `/dashboard/leaderboard`.

On a collapsed sidebar, the static task text and progress bars are hidden; the navigation links remain icon-first and retain their existing tooltip behavior. The leaderboard link remains accessible as an icon with tooltip.

## Implementation Boundaries

Use a small pure sidebar-content module for primary navigation, static task data, and the leaderboard destination. The sidebar renders that data and remains responsible for client state such as collapse and account menus. This lets Vitest validate the proposed destinations and initial progress without requiring a browser DOM.

Next.js App Router folder names define public routes, so the route tree is physically renamed rather than duplicated. Relative imports inside the moved tree stay valid; only absolute and pathname-based references elsewhere are updated.

## Validation

- Add a Vitest unit test for sidebar content: three preserved primary URLs, the Practice Space URL and icon, and the two task-progress ratios.
- Run the new test red before adding the content module, then green after implementation.
- Search application source for stale `/dashboard/games` URL references.
- Run the full test suite, TypeScript type check, lint, and production build.
- Confirm the old games directory is absent and the new route tree contains both the main and solo page.

## Non-goals

- No task-management page, persistence layer, API, interaction, or analytics.
- No redirect from `/dashboard/games`.
- No renaming of feature-internal `features/games` modules or game-domain terminology.
