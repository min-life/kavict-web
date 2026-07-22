# KAVICT local-adapter refactor design

## Objective

Refactor KAVICT into a feature-oriented application with explicit data
adapters. Preserve every current URL, screen, and user-visible workflow while
allowing the application to run locally without a Firebase or Vercel `.env`
file.

Firebase remains the production identity, document-store, and realtime
provider. It must not be imported by page components, presentational
components, or domain hooks.

## Scope and invariants

- Keep all existing `app/` route paths and their visual output intact.
- Keep Firebase support when valid Firebase configuration is present.
- Use a local browser-backed mode when Firebase configuration is absent, with
  editable demo data persisted in `localStorage`.
- Keep solo gameplay available locally. Mark AI and multiplayer as unavailable
  or provide an explicit local fallback; do not pretend that they are connected
  to external services.
- Preserve the `/api/chat` and `/api/gemini` endpoint paths.
- Do not add a separate Express or Nest deployment. Next.js route handlers are
  the server boundary.
- Remove or archive only tooling and raw source artefacts proven not to be
  required by build, runtime, or documented contributor workflows.

## Target architecture

```text
app/ routes and route handlers
        |
feature UI and hooks
        |
domain contracts and use cases
        |
provider factory
  +-----+-------------------+
  |                         |
browser-local adapter   Firebase adapter
localStorage             Auth, Firestore, Realtime Database
        |
server-only route handlers
  - Gemini client and secret
  - validation and authorization
  - future Firebase Admin operations
```

`app/` remains at the repository root because it is the Next.js route entry
point. It is limited to route composition, layouts, and API endpoints.

Feature modules own their data contracts, adapters, and feature-specific UI:

```text
features/
  auth/
  finance/
  learning/
  games/
  ai/
components/              shared presentational components only
lib/config/              runtime-mode detection and provider creation
lib/server/              server-only integrations
types/                   genuinely cross-feature types
scripts/                 retained developer tooling only
```

The exact physical moves are incremental. Existing components may remain under
their route while contracts and provider boundaries are introduced; route URLs
and component behavior must not change during a move.

## Contracts and adapters

The first contracts cover the current direct Firebase usage:

- `AuthGateway`: current user, sign-in, registration, sign-out, and profile.
- `FinanceRepository`: financial plan and transactions.
- `LearningRepository`: lesson progress, notes, and chat history.
- `GameRoomGateway`: room lifecycle and realtime state.
- `AiClient`: requests to the existing AI endpoints.

Each feature consumes its contract through a provider or hook. Firebase
implementations contain the current SDK calls. Local implementations use
versioned `localStorage` records and a deterministic demo user. The local
adapter stores only browser-local demo data and never attempts to synchronize
with Firebase later.

## Runtime modes

Mode selection is centralized:

1. `NEXT_PUBLIC_KAVICT_MODE=local` explicitly selects browser-local mode.
2. Otherwise, valid Firebase configuration selects the Firebase adapter.
3. Missing Firebase configuration selects browser-local mode automatically.

This makes `npm run dev` usable with no `.env.local`, while allowing a
developer who has Firebase credentials to test real integration locally. The
mode is exposed to the UI only as a capability/state indicator, not through
Firebase-specific conditions.

Local capabilities are:

- demo authentication and editable profile/finance/learning data;
- solo game;
- a visible local-demo label and reset-demo-data action;
- AI fallback responses without calling Gemini;
- a disabled or explanatory multiplayer entry point.

Firebase capabilities are the existing authentication, Firestore-backed data,
Realtime Database multiplayer, and Gemini API calls through server routes.

## Server boundary and secrets

The current Gemini route handlers remain the public endpoint contract. Their
implementation moves under `lib/server/` and reads a server-only environment
variable named `GOOGLE_GENAI_API_KEY`; it must no longer use a
`NEXT_PUBLIC_*` name.

Client components call only `/api/chat` or `/api/gemini`. Future privileged
operations are added to route handlers, validate the Firebase ID token, and
use Firebase Admin there. Direct client Firebase access remains only for the
adapter operations that need client realtime behavior, guarded by Firebase
rules. No unrelated backend service is introduced.

## Tooling cleanup

`fix_*.js` and `convert_screens.js` are one-off HTML-to-JSX conversion scripts
and are not runtime imports. Before removal, the implementation verifies they
are absent from package scripts, documentation, CI, and imports. `_stitch_raw/`
is handled by the same evidence-based rule. Retained scripts move to
`scripts/` and receive a documented command; obsolete scripts are removed in a
separate cleanup commit.

## Validation and acceptance criteria

- Add contract-level tests before each adapter implementation.
- Run type checking, linting, production build, and route smoke checks.
- With no `.env.local`, `npm run dev` renders the landing page and a demo user
  can access/edit dashboard financial and learning data after reload.
- With Firebase configuration, the same routes use Firebase rather than local
  records.
- `/api/chat` and `/api/gemini` retain their request/response shapes; without
  a Gemini server key they return a safe, user-facing fallback.
- No retained application file imports Firebase outside Firebase adapter and
  server-integration modules.
- Git history separates architecture/data-adapter changes from obsolete-tooling
  cleanup and leaves the existing untracked `TASK.md` untouched.
