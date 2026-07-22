# Sidebar Task Summary and Practice Space Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the dashboard sidebar into primary and utility groups with static task progress, and replace the games URL and entry label with Practice Space.

**Architecture:** A pure `sidebarContent` module owns static navigation and task data. `Sidebar` keeps rendering and client state. The App Router tree moves from `games` to `practice-space`; feature-internal game modules remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest 4.

## Global Constraints

- Preserve `/dashboard`, `/dashboard/learning`, `/dashboard/finance-management`, and `/dashboard/leaderboard` behavior.
- Use `/dashboard/practice-space` and `/dashboard/practice-space/solo` as the only public Practice Space URLs.
- Do not implement `/dashboard/games` redirect or fallback behavior.
- Keep task data static and non-interactive; do not rename `features/games` modules.

---

### Task 1: Add testable sidebar content data

**Files:**

- Create: `app/components/sidebarContent.test.ts`
- Create: `app/components/sidebarContent.ts`

**Interfaces:** Produces `PRIMARY_NAV_ITEMS`, `STATIC_TASKS`, and `LEADERBOARD_NAV_ITEM` for `Sidebar`.

- [ ] **Step 1: Write the failing test**

```ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const contentModulePath = resolve(__dirname, "sidebarContent.ts");

describe("sidebar content", () => {
  it("defines Practice Space, static task progress, and leaderboard destinations", async () => {
    expect(existsSync(contentModulePath)).toBe(true);
    const { LEADERBOARD_NAV_ITEM, PRIMARY_NAV_ITEMS, STATIC_TASKS } = await import("./sidebarContent");
    expect(PRIMARY_NAV_ITEMS.map((item) => item.href)).toEqual([
      "/dashboard", "/dashboard/learning", "/dashboard/finance-management", "/dashboard/practice-space",
    ]);
    expect(PRIMARY_NAV_ITEMS.at(-1)).toMatchObject({ icon: "target", label: "Practice Space" });
    expect(STATIC_TASKS).toEqual([
      { label: "Nhiệm vụ ngày", title: "Hoàn thành 1 bài học", completed: 1, total: 1 },
      { label: "Nhiệm vụ tuần", title: "Ghi chép chi tiêu 5 ngày", completed: 3, total: 5 },
    ]);
    expect(LEADERBOARD_NAV_ITEM).toMatchObject({ href: "/dashboard/leaderboard", icon: "leaderboard", label: "Bảng xếp hạng" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run app/components/sidebarContent.test.ts`

Expected: FAIL because `app/components/sidebarContent.ts` does not exist.

- [ ] **Step 3: Write the minimal implementation**

```ts
export const PRIMARY_NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Trang chủ", fill: true },
  { href: "/dashboard/learning", icon: "school", label: "Học tập" },
  { href: "/dashboard/finance-management", icon: "account_balance_wallet", label: "Quản lý tài chính" },
  { href: "/dashboard/practice-space", icon: "target", label: "Practice Space" },
] as const;
export const STATIC_TASKS = [
  { label: "Nhiệm vụ ngày", title: "Hoàn thành 1 bài học", completed: 1, total: 1 },
  { label: "Nhiệm vụ tuần", title: "Ghi chép chi tiêu 5 ngày", completed: 3, total: 5 },
] as const;
export const LEADERBOARD_NAV_ITEM = { href: "/dashboard/leaderboard", icon: "leaderboard", label: "Bảng xếp hạng" } as const;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run app/components/sidebarContent.test.ts`

Expected: PASS with one test and zero failures.

### Task 2: Render the reorganized sidebar

**Files:**

- Modify: `app/components/Sidebar.tsx`

**Interfaces:** Consumes the three exports from `sidebarContent.ts`; produces grouped navigation, static task rows, and a lower leaderboard link.

- [ ] **Step 1: Replace the local navigation constant**

Import `LEADERBOARD_NAV_ITEM`, `PRIMARY_NAV_ITEMS`, and `STATIC_TASKS` from `@/app/components/sidebarContent`, then map `PRIMARY_NAV_ITEMS` for the top navigation list.

- [ ] **Step 2: Add the static utility group**

Below a `border-t border-outline-variant` divider, render a “Nhiệm vụ” heading and each task's label, title, `completed/total` count, and width calculated as `(completed / total) * 100%`. Hide this detail in collapsed mode. Follow with another divider and render `LEADERBOARD_NAV_ITEM` with the existing link/tooltip pattern.

- [ ] **Step 3: Run the focused test**

Run: `npx vitest run app/components/sidebarContent.test.ts`

Expected: PASS with one test and zero failures.

### Task 3: Rename the App Router URL tree and all public links

**Files:**

- Move: `app/dashboard/games` to `app/dashboard/practice-space`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/practice-space/page.tsx`
- Modify: `app/dashboard/practice-space/solo/page.tsx`

**Interfaces:** Produces `/dashboard/practice-space` and `/dashboard/practice-space/solo`, with no `/dashboard/games` route.

- [ ] **Step 1: Move the route tree**

Run: `mv app/dashboard/games app/dashboard/practice-space`

- [ ] **Step 2: Update route-aware code**

Replace each public `/dashboard/games` and `/dashboard/games/solo` reference with its `practice-space` equivalent, including the fullscreen pathname check, dashboard card, main Practice Space page, and solo exit handlers.

- [ ] **Step 3: Update user-facing entry copy**

Use `Practice Space` and icon `target` in the sidebar/dashboard entry; update only the route page's presentation copy to frame it as financial practice. Retain game mechanics and feature module names.

- [ ] **Step 4: Verify old public links are removed**

Run: `rg -n --glob '!node_modules/**' '/dashboard/games' app tests features`

Expected: no matches.

### Task 4: Verify and commit implementation

**Files:** All implementation files from Tasks 1–3 and this plan.

- [ ] **Step 1: Run complete automated verification**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all commands exit 0.

- [ ] **Step 2: Check route-tree shape**

Run: `test ! -d app/dashboard/games && test -f app/dashboard/practice-space/page.tsx && test -f app/dashboard/practice-space/solo/page.tsx`

Expected: exit 0.

- [ ] **Step 3: Review changed execution-flow scope**

Run GitNexus `detect_changes` for unstaged changes and inspect its risk summary.

- [ ] **Step 4: Commit the feature**

Stage the feature files and force-add this ignored plan file, then commit with message `feat: add sidebar task summary and practice space`.
