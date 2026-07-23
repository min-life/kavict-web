# Help Center Design

## Goal

Create a public Help Center at `/help`. Selecting the Help entry in the
sidebar account menu opens the Help popover; selecting any popover item
navigates to the corresponding section on `/help`.

## Routing

The feature uses one static App Router page, `app/help/page.tsx`. Each Help
section has a stable HTML id, and sidebar links use hashes such as
`/help#faq`. This keeps one canonical Help URL while allowing direct links and
browser back/forward navigation to a specific section.

## Help popover

The existing theme-aware sidebar popover keeps its placement and accessibility
semantics. Its clickable items are ordered exactly as follows:

1. Documentation
2. FAQ
3. Terms of Service
4. Privacy Policy
5. Divider
6. Download app
7. Divider
8. Contact us

Every item is a Next.js `Link` to `/help` with the matching hash. The menu
closes on navigation through the existing pathname effect.

## Help Center page

The page has a responsive two-column layout. A sticky left section-navigation
rail mirrors the popover order and marks the current section. The content
column contains the matching sections and readable placeholder Help copy.

`Download app` does not advertise a nonexistent download. It says that
KAVICT will be available on Android and iOS soon. `Contact us` provides an
email contact link only; it does not add a support backend or form.

On narrow screens, the section navigation becomes a horizontal, scrollable
list above the content. Colors use the project's semantic theme tokens, so
the page works in both light and dark themes.

## Scope and validation

- Preserve existing dashboard routes, authentication behavior, account menu,
  theme, and logout flow.
- Add focused regression checks for Help menu order, `/help` links, hash
  targets, and the Android/iOS availability copy.
- Verify the route, section links, focused tests, typecheck, and a browser
  navigation from the sidebar to an anchored Help section.

## Out of scope

- Mobile applications or download binaries.
- Legal review of the Terms or Privacy text.
- A support ticket API, contact form submission, analytics, or release notes.
