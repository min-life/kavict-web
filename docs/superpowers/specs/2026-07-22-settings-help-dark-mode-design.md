# Settings, Help, and Dark Mode Design

## Goal

Move general settings out of the profile dashboard, make settings reachable from
the avatar menu, add the requested Help sub-menu, and provide a persistent
application-wide dark mode. Existing routes and functionality remain intact.

## Scope and route behavior

- Keep `/dashboard/profile` as the profile and achievement dashboard. Remove
  its `Cài đặt chung` card entirely.
- Add `/dashboard/settings` as the dedicated Settings screen. The avatar menu's
  `Cài đặt` entry navigates there.
- Keep the existing `/dashboard/profile` and logout behavior unchanged.
- Do not add unrequested account-menu entries such as Upgrade plan or
  Personalization.

## Avatar menu and Help sub-menu

The avatar menu in the dashboard sidebar contains, in order:

1. `Hồ sơ`, linked to `/dashboard/profile`.
2. `Cài đặt`, linked to `/dashboard/settings`.
3. `Help`, a button with a chevron.
4. `Đăng xuất`, preserving the current sign-out flow.

Selecting `Help` marks that row as active and opens a dark sub-popover next to
the account menu, matching the supplied reference: rounded corners, compact
rows, white outline icons, and a divider before legal/reporting links. It
contains these display-only items:

- Help center
- Release notes
- Download apps
- Keyboard shortcuts
- Terms of Service
- Privacy Policy
- Report a bug

These entries have no links or actions in this phase. The Help popover closes
when the avatar menu is closed, Help is selected again, or the sidebar changes
to its collapsed state. The Help row and popover remain keyboard accessible.

## Settings screen

The page follows the supplied `Cài đặt chung` layout and visual language. It
contains the following rows:

- Thông báo — display-only.
- Ngôn ngữ — display-only, showing `Tiếng Việt`.
- Chế độ tối — a functional, accessible switch.
- Bảo mật — display-only.
- Billing — display-only.

The display-only rows are deliberately non-navigating and retain the visual
treatment from the supplied reference without implying an unfinished setting
can be configured.

## Theme architecture and data flow

Introduce a focused client `ThemeProvider` at the root, alongside the existing
authentication provider. It owns a `light` or `dark` preference and exposes a
small theme hook for the Settings switch.

On first client load, the provider reads the saved preference from
`localStorage`; absent a saved preference, it uses the current light appearance.
Whenever the value changes, it stores the preference and adds or removes a
single `dark` class on the document root. The root layout continues to be a
server component; browser APIs and switch state stay inside client components,
which follows the Next.js App Router client-boundary guidance.

`app/globals.css` defines semantic dark variants for the existing color tokens
used across the dashboard (surfaces, text, outlines, primary colors, and
scrollbar). Existing semantic Tailwind classes therefore adapt without changing
URLs, feature logic, authentication, or data adapters. Pages that use literal
light-only color utilities will receive targeted dark counterparts only where
they are visible and materially affect readability.

## Error handling and accessibility

- Storage access is guarded so privacy-mode or storage failures leave the app in
  light mode without breaking rendering.
- The switch has a labelled checkbox and reports its checked state to assistive
  technology.
- Menu and Help buttons use native buttons, clear focus states, and meaningful
  accessible labels.
- The settings route remains protected by the existing dashboard layout.

## Validation

- Automated checks cover theme preference read/write, document-class updates,
  and the Settings switch state.
- Component checks cover account-menu routes, Help sub-menu contents, and
  display-only rows having no navigation side effect.
- Run lint, typecheck, and production build.
- Manually verify in both themes: dashboard pages, profile page without the
  settings card, Settings screen, avatar menu, Help sub-popover, persistence
  after reload, and logout.

## Out of scope

- Configuring notifications, language, security, billing, or any Help item.
- Adding new external URLs, support integrations, payment flows, or account
  personalization.
