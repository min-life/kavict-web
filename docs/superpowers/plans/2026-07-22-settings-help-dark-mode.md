# Settings, Help, and Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the dedicated dashboard Settings route, a Help sub-menu in the avatar menu, and a persisted application-wide dark mode while preserving current routes and sign-out behavior.

**Architecture:** A small client theme module owns parsing, persistence, and document-class application; `ThemeProvider` exposes that state to the Settings switch and is composed at the root beside `AuthProvider`. The Settings page is a protected App Router route, while the Sidebar renders static account and Help descriptors so required labels are testable without a new UI-test dependency.

**Tech Stack:** Next.js 16.2.9 App Router, React 19.2.4, TypeScript strict mode, Tailwind CSS 4, Vitest 4.1.10.

## Global Constraints

- Preserve every existing route, including `/dashboard/profile`, `/dashboard/upgrade`, and all API routes.
- Remove the `Cài đặt chung` card from `/dashboard/profile`; expose settings only at `/dashboard/settings`.
- The only functional setting is `Chế độ tối`; Notifications, Language, Security, Billing, and all Help entries do not navigate or mutate data.
- Store only `"light"` or `"dark"` under the `kavict-theme` localStorage key; a missing, invalid, or inaccessible value must use light mode without throwing.
- Use a root `dark` class and semantic Tailwind color tokens. Do not add a new theme dependency or change Firebase/auth adapters.
- The avatar menu contains only Hồ sơ, Cài đặt, Help, and Đăng xuất; do not add Upgrade plan or Personalization.
- Help uses the seven requested labels and opens as a dark sub-popover beside the open avatar menu.
- Follow Next.js App Router client-boundary guidance: browser APIs, state, and event handlers stay in client components.
- Before editing an existing function, class, or method, run GitNexus upstream impact analysis and report the blast radius; do not edit if the risk is HIGH or CRITICAL until the user has been warned.
- Before each implementation commit, run `gitnexus_detect_changes` and exclude pre-existing changes to `.gitignore`, `AGENTS.md`, `CLAUDE.md`, and `.claude/`.

---

## Planned file structure

```text
app/
  layout.tsx                                  Root composition of ThemeProvider and AuthProvider
  globals.css                                 Class-based dark variant and semantic color overrides
  components/
    Sidebar.tsx                               Existing navigation plus account-menu integration
    accountMenuItems.ts                       Immutable account and Help menu descriptors
  dashboard/
    profile/page.tsx                          Profile dashboard without quick-settings card
    settings/page.tsx                         Protected Settings screen and accessible theme switch
features/theme/
  theme.ts                                    Pure preference parsing, persistence, and class application
  theme.test.ts                               Theme behavior unit tests
  ThemeProvider.tsx                           Browser-only provider and useTheme hook
tests/tooling/
  settingsSurface.test.ts                     Route/menu/CSS regression checks without browser dependencies
```

### Task 1: Add the persisted theme contract and root provider

**Files:**

- Create: `features/theme/theme.ts`
- Create: `features/theme/theme.test.ts`
- Create: `features/theme/ThemeProvider.tsx`
- Modify: `app/layout.tsx:4-52`

**Interfaces:**

- Produces `Theme = "light" | "dark"`, `THEME_STORAGE_KEY`, `readTheme`, `writeTheme`, and `applyTheme`.
- Produces `ThemeContextValue { theme: Theme; setTheme(theme: Theme): void }` and `useTheme()`.
- The Settings page consumes `useTheme()` in Task 3.

- [ ] **Step 1: Write the failing pure-theme test**

```ts
import { describe, expect, it } from "vitest";
import { applyTheme, readTheme, THEME_STORAGE_KEY, writeTheme } from "./theme";

function storageWith(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("theme preference", () => {
  it("uses light mode for missing and invalid values", () => {
    expect(readTheme(storageWith())).toBe("light");
    expect(readTheme(storageWith({ [THEME_STORAGE_KEY]: "system" }))).toBe("light");
  });

  it("persists and restores dark mode", () => {
    const storage = storageWith();
    writeTheme("dark", storage);
    expect(readTheme(storage)).toBe("dark");
  });

  it("sets the root dark class only for dark mode", () => {
    const calls: Array<[string, boolean]> = [];
    const classList = { toggle: (name: string, enabled: boolean) => { calls.push([name, enabled]); return enabled; } };
    applyTheme("dark", classList);
    applyTheme("light", classList);
    expect(calls).toEqual([["dark", true], ["dark", false]]);
  });
});
```

- [ ] **Step 2: Run the focused test to confirm the module is absent**

Run: `npm test -- features/theme/theme.test.ts`

Expected: FAIL with an import error for `./theme`.

- [ ] **Step 3: Implement the pure contract and provider**

Create `features/theme/theme.ts`:

```ts
export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "kavict-theme";

export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
export type ThemeClassList = Pick<DOMTokenList, "toggle">;

export function readTheme(storage: ThemeStorage | null): Theme {
  try {
    return storage?.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function writeTheme(theme: Theme, storage: ThemeStorage | null): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is optional; the in-memory preference still changes.
  }
}

export function applyTheme(theme: Theme, classList: ThemeClassList): void {
  classList.toggle("dark", theme === "dark");
}
```

Create `features/theme/ThemeProvider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { applyTheme, readTheme, type Theme, writeTheme } from "./theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme(theme: Theme): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const nextTheme = readTheme(browserStorage());
    setThemeState(nextTheme);
    applyTheme(nextTheme, document.documentElement.classList);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme, document.documentElement.classList);
    writeTheme(nextTheme, browserStorage());
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

Wrap the existing `AuthProvider` in `ThemeProvider` inside `app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/features/theme/ThemeProvider";

<ThemeProvider>
  <AuthProvider>{children}</AuthProvider>
</ThemeProvider>
```

- [ ] **Step 4: Run the focused unit test and typecheck**

Run: `npm test -- features/theme/theme.test.ts && npm run typecheck`

Expected: three theme assertions pass and TypeScript exits 0.

- [ ] **Step 5: Check scope and commit**

Run GitNexus upstream impact for `RootLayout`; report its risk and stop if it is HIGH or CRITICAL. Then run GitNexus change detection and confirm only `features/theme/*` and `app/layout.tsx` are staged.

```bash
git add app/layout.tsx features/theme
git commit -m "feat: add persisted theme provider"
```

### Task 2: Make semantic styles respond to the root dark class

**Files:**

- Modify: `app/globals.css:1-160`
- Create: `tests/tooling/settingsSurface.test.ts`

**Interfaces:**

- Consumes the `dark` class applied by Task 1.
- Produces a class-based `dark:` variant and dark values for all existing semantic surface, text, outline, primary, secondary, tertiary, error, and background color tokens.

- [ ] **Step 1: Add a failing stylesheet regression test**

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");

describe("settings visual surface", () => {
  it("uses a root-class dark variant and semantic dark tokens", () => {
    expect(css).toContain("@custom-variant dark (&:where(.dark, .dark *));");
    expect(css).toContain("html.dark {");
    expect(css).toContain("--color-surface-container-lowest:");
    expect(css).toContain("--color-on-surface:");
    expect(css).toContain("--color-background:");
  });
});
```

- [ ] **Step 2: Run the regression test to prove the class variant is missing**

Run: `npm test -- tests/tooling/settingsSurface.test.ts`

Expected: FAIL because the root-class dark variant is absent.

- [ ] **Step 3: Change the token strategy and add the dark palette**

Replace the first declaration with `@theme {` rather than `@theme inline {` so semantic utilities retain CSS-token references. Immediately after its closing block, add the class-based variant and this complete palette:

```css
@custom-variant dark (&:where(.dark, .dark *));

html.dark {
  color-scheme: dark;
  --color-primary: #b4c5ff;
  --color-on-primary: #002c73;
  --color-primary-container: #2563eb;
  --color-on-primary-container: #eeefff;
  --color-primary-fixed: #dbe1ff;
  --color-primary-fixed-dim: #b4c5ff;
  --color-on-primary-fixed: #00174b;
  --color-on-primary-fixed-variant: #003ea8;
  --color-inverse-primary: #004ac6;
  --color-secondary: #c6c6c7;
  --color-on-secondary: #2f3131;
  --color-secondary-container: #454747;
  --color-on-secondary-container: #dfe0e0;
  --color-secondary-fixed: #e2e2e2;
  --color-secondary-fixed-dim: #c6c6c7;
  --color-on-secondary-fixed: #1a1c1c;
  --color-on-secondary-fixed-variant: #454747;
  --color-tertiary: #bec6e0;
  --color-on-tertiary: #272f44;
  --color-tertiary-container: #3f465c;
  --color-on-tertiary-container: #dae2fd;
  --color-tertiary-fixed: #dae2fd;
  --color-tertiary-fixed-dim: #bec6e0;
  --color-on-tertiary-fixed: #131b2e;
  --color-on-tertiary-fixed-variant: #3f465c;
  --color-error: #ffb4ab;
  --color-on-error: #690005;
  --color-error-container: #93000a;
  --color-on-error-container: #ffdad6;
  --color-surface: #111315;
  --color-on-surface: #e1e3e5;
  --color-surface-variant: #434655;
  --color-on-surface-variant: #c3c6d7;
  --color-surface-dim: #111315;
  --color-surface-bright: #37393c;
  --color-surface-container: #1d2022;
  --color-surface-container-low: #191c1e;
  --color-surface-container-high: #282a2d;
  --color-surface-container-highest: #333538;
  --color-surface-container-lowest: #0e0f11;
  --color-surface-tint: #b4c5ff;
  --color-inverse-surface: #e1e3e5;
  --color-inverse-on-surface: #2d3133;
  --color-outline: #8d919f;
  --color-outline-variant: #434655;
  --color-background: #111315;
  --color-on-background: #e1e3e5;
}

body {
  background-color: var(--color-background);
  color: var(--color-on-background);
}
```

Remove the existing hard-coded `body { background-color: #f7f9fb; }` rule. Retain all animations, layout, and utility class names.

- [ ] **Step 4: Run regression, type, and production checks**

Run: `npm test -- tests/tooling/settingsSurface.test.ts && npm run typecheck && npm run build`

Expected: stylesheet test passes, typecheck exits 0, and Next.js production build succeeds.

- [ ] **Step 5: Check scope and commit**

Run GitNexus upstream impact for the global theme surface; report its risk and stop if it is HIGH or CRITICAL. Then run GitNexus change detection and confirm only `app/globals.css` and `tests/tooling/settingsSurface.test.ts` are staged.

```bash
git add app/globals.css tests/tooling/settingsSurface.test.ts
git commit -m "feat: add semantic dark theme tokens"
```

### Task 3: Add the Settings route and remove quick settings from Profile

**Files:**

- Create: `app/dashboard/settings/page.tsx`
- Modify: `app/dashboard/profile/page.tsx:9-109`
- Modify: `tests/tooling/settingsSurface.test.ts`

**Interfaces:**

- Consumes `useTheme(): ThemeContextValue`.
- Produces the protected route `/dashboard/settings` through the existing dashboard layout.
- Keeps static rows as non-anchor, non-button containers; only the theme checkbox changes state.

- [ ] **Step 1: Extend the failing surface test with route and Profile assertions**

```ts
const settingsPath = path.resolve(process.cwd(), "app/dashboard/settings/page.tsx");
const profilePath = path.resolve(process.cwd(), "app/dashboard/profile/page.tsx");

it("moves settings from Profile to the dedicated protected route", () => {
  const settings = readFileSync(settingsPath, "utf8");
  const profile = readFileSync(profilePath, "utf8");
  for (const label of ["Thông báo", "Ngôn ngữ", "Chế độ tối", "Bảo mật", "Billing"]) {
    expect(settings).toContain(label);
  }
  expect(settings).toContain('type="checkbox"');
  expect(settings).toContain("useTheme");
  expect(profile).not.toContain("Cài đặt chung");
});
```

- [ ] **Step 2: Run the route regression test before adding the route**

Run: `npm test -- tests/tooling/settingsSurface.test.ts`

Expected: FAIL because the Settings route does not exist and Profile still contains the old card.

- [ ] **Step 3: Create the client Settings page and remove the old Profile card**

Create `app/dashboard/settings/page.tsx` with a `StaticSetting` display component and this functional switch:

```tsx
"use client";

import { useTheme } from "@/features/theme/ThemeProvider";

function StaticSetting({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 text-on-surface-variant">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{icon}</span>
        <span className="font-body-md text-body-md">{label}</span>
      </div>
      {value ? <span className="font-label-sm text-label-sm">{value}</span> : <span className="material-symbols-outlined text-outline-variant" aria-hidden="true">chevron_right</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft">
        <h1 className="mb-6 font-headline-md text-headline-md text-on-surface">Cài đặt chung</h1>
        <div className="space-y-2">
          <StaticSetting icon="notifications" label="Thông báo" />
          <StaticSetting icon="language" label="Ngôn ngữ" value="Tiếng Việt" />
          <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 text-on-surface-variant hover:bg-surface-container">
            <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[24px]" aria-hidden="true">dark_mode</span><span className="font-body-md text-body-md">Chế độ tối</span></span>
            <input aria-label="Bật chế độ tối" checked={isDark} className="peer sr-only" onChange={(event) => setTheme(event.target.checked ? "dark" : "light")} type="checkbox" />
            <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-surface-variant transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-checked:bg-primary-container after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
          <StaticSetting icon="security" label="Bảo mật" />
          <StaticSetting icon="receipt_long" label="Billing" />
        </div>
      </div>
    </section>
  );
}
```

Delete the complete `Cài đặt chung` card in `app/dashboard/profile/page.tsx`, from its `{/* 7. Cài đặt nhanh */}` comment through its closing card `<div>`. Update the left-column comment to omit “Quick Settings”; leave profile, membership, statistics, and activity markup unchanged.

- [ ] **Step 4: Run route checks and build**

Run: `npm test -- tests/tooling/settingsSurface.test.ts && npm run typecheck && npm run build`

Expected: the route exists, all five labels are present, Profile no longer has the settings card, and the production build succeeds.

- [ ] **Step 5: Check scope and commit**

Run GitNexus upstream impact for `UserProfile`; report its risk and stop if it is HIGH or CRITICAL. Then run GitNexus change detection and confirm only the Settings route, Profile page, and regression test are staged.

```bash
git add app/dashboard/profile/page.tsx app/dashboard/settings/page.tsx tests/tooling/settingsSurface.test.ts
git commit -m "feat: add dashboard settings screen"
```

### Task 4: Extend the avatar menu with Settings and the Help sub-popover

**Files:**

- Create: `app/components/accountMenuItems.ts`
- Modify: `app/components/Sidebar.tsx:1-205`
- Modify: `tests/tooling/settingsSurface.test.ts`

**Interfaces:**

- Produces `ACCOUNT_MENU_ITEMS` and `HELP_MENU_ITEMS`.
- `Sidebar` consumes those descriptors while preserving its `signOut()` then `/login` redirect.
- The Help descriptors have no `href`; every Help entry is non-navigating.

- [ ] **Step 1: Add a failing menu-content regression test**

```ts
import { ACCOUNT_MENU_ITEMS, HELP_MENU_ITEMS } from "@/app/components/accountMenuItems";

it("exposes only the requested account and Help menu items", () => {
  expect(ACCOUNT_MENU_ITEMS).toEqual([
    { label: "Hồ sơ", icon: "person", href: "/dashboard/profile" },
    { label: "Cài đặt", icon: "settings", href: "/dashboard/settings" },
  ]);
  expect(HELP_MENU_ITEMS.map((item) => item.label)).toEqual([
    "Help center", "Release notes", "Download apps", "Keyboard shortcuts",
    "Terms of Service", "Privacy Policy", "Report a bug",
  ]);
  expect(HELP_MENU_ITEMS.filter((item) => item.dividerBefore)).toEqual([
    { label: "Terms of Service", icon: "article", dividerBefore: true },
  ]);
});
```

- [ ] **Step 2: Run the focused test before creating the descriptor module**

Run: `npm test -- tests/tooling/settingsSurface.test.ts`

Expected: FAIL with an import error for `@/app/components/accountMenuItems`.

- [ ] **Step 3: Implement descriptors and Sidebar behavior**

Create `app/components/accountMenuItems.ts`:

```ts
export const ACCOUNT_MENU_ITEMS = [
  { label: "Hồ sơ", icon: "person", href: "/dashboard/profile" },
  { label: "Cài đặt", icon: "settings", href: "/dashboard/settings" },
] as const;

export const HELP_MENU_ITEMS = [
  { label: "Help center", icon: "help" },
  { label: "Release notes", icon: "edit" },
  { label: "Download apps", icon: "download" },
  { label: "Keyboard shortcuts", icon: "keyboard" },
  { label: "Terms of Service", icon: "article", dividerBefore: true },
  { label: "Privacy Policy", icon: "info" },
  { label: "Report a bug", icon: "bug_report" },
] as const;
```

In `Sidebar`, import both arrays and add `const [helpMenuOpen, setHelpMenuOpen] = useState(false);`. Close both menus in an effect when `pathname` or `collapsed` changes. Replace the current open user-menu body with account links mapped from `ACCOUNT_MENU_ITEMS`, the Help trigger, this dark sub-popover, and the unchanged logout button:

```tsx
<button aria-controls="sidebar-help-menu" aria-expanded={helpMenuOpen} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary ${helpMenuOpen ? "bg-surface-container-high text-primary" : ""}`} onClick={() => setHelpMenuOpen((open) => !open)} type="button">
  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help</span><span className="flex-1 text-left text-label-md font-label-md">Help</span><span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_right</span>
</button>
{helpMenuOpen && (
  <div id="sidebar-help-menu" role="menu" className="absolute bottom-0 left-full z-50 ml-2 w-72 rounded-2xl bg-[#333333] p-2 text-white shadow-xl">
    {HELP_MENU_ITEMS.map((item) => (
      <div className={item.dividerBefore ? "mt-2 border-t border-white/15 pt-2" : ""} key={item.label} role="none">
        <button aria-disabled="true" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-white/90" role="menuitem" type="button">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{item.icon}</span><span className="text-body-md">{item.label}</span>
        </button>
      </div>
    ))}
  </div>
)}
```

Add `aria-expanded` to the avatar trigger. When that trigger closes the account menu, also call `setHelpMenuOpen(false)`. Do not alter `handleLogout`, `NAV_ITEMS`, or collapse width behavior.

- [ ] **Step 4: Run menu regression and static checks**

Run: `npm test -- tests/tooling/settingsSurface.test.ts && npm run lint && npm run typecheck && npm run build`

Expected: exact menu labels/routes pass; lint, typecheck, and build exit 0.

- [ ] **Step 5: Check impact, verify the user flow, and commit**

Run GitNexus upstream impact for `Sidebar`; report its risk and stop if it is HIGH or CRITICAL. Then verify manually:

1. Avatar menu opens to Hồ sơ, Cài đặt, Help, and Đăng xuất only.
2. Hồ sơ and Cài đặt use their exact dashboard routes.
3. Help toggles the dark right-side sub-popover; all seven entries remain non-navigating.
4. Help closes when the account menu closes, navigation changes, or the sidebar collapses.
5. Logout still redirects to `/login`.

Run GitNexus change detection and confirm only the three task files are staged.

```bash
git add app/components/Sidebar.tsx app/components/accountMenuItems.ts tests/tooling/settingsSurface.test.ts
git commit -m "feat: add sidebar settings and help menu"
```

### Task 5: Validate complete behavior and hand off

**Files:**

- Verify: `app/layout.tsx`, `app/globals.css`, `app/components/Sidebar.tsx`, `app/dashboard/profile/page.tsx`, `app/dashboard/settings/page.tsx`, `features/theme/*`, and `tests/tooling/settingsSurface.test.ts`

**Interfaces:**

- Verifies all contracts introduced in Tasks 1-4 without a new dependency or extra product scope.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test && npm run lint && npm run typecheck && npm run build`

Expected: every Vitest suite passes, lint and typecheck exit 0, and the production build succeeds.

- [ ] **Step 2: Run the visual and persistence acceptance check**

Run: `npm run dev`

Verify in a browser at `/dashboard/settings`: toggle dark mode, reload, navigate to Profile, Dashboard, Learning, AI Assistant, Games, Leaderboard, and Upgrade, then toggle back to light. Confirm readable text, background/card contrast, preserved navigation, and that Profile has no settings card.

- [ ] **Step 3: Review the final diff before handoff**

Run GitNexus change detection against `main`; inspect any unexpected execution flow. Then run:

```bash
git diff --check main...HEAD
git status --short
git log --oneline main..HEAD
```

Expected: no whitespace errors; only feature commits exist on the branch; pre-existing user changes remain unstaged and excluded.
