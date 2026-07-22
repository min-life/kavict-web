# KAVICT

KAVICT is a Next.js application for personal-finance learning. It supports a
fully local demo mode for development and Firebase-backed services when a
complete Firebase client configuration is supplied.

## Run locally

```bash
npm ci
npm run dev
# http://localhost:3000; no .env.local starts local demo mode

# Optional: force local mode even when Firebase values exist
NEXT_PUBLIC_KAVICT_MODE=local npm run dev
```

Copy `.env.example` to `.env.local` only when you need Firebase or a live
Gemini key. Local mode is selected automatically when Firebase configuration
is incomplete. Setting `NEXT_PUBLIC_KAVICT_MODE=local` always wins, including
when Firebase values are present.

## Environment and deployment

Firebase mode requires all seven `NEXT_PUBLIC_FIREBASE_*` variables in
`.env.example`. Deployments on Vercel receive those same Firebase variables
plus `GOOGLE_GENAI_API_KEY`. Values prefixed `NEXT_PUBLIC_` are exposed to the
browser and are not secrets; keep `GOOGLE_GENAI_API_KEY` server-only.

See [the architecture map](docs/architecture.md) for provider boundaries and
route-handler responsibilities.

## Validate local mode

Run the automated local-mode smoke check with:

```bash
npm run test -- tests/smoke/localMode.test.ts
```

For an end-to-end local check, start the development server without Firebase
environment variables. The landing page and API fallback routes remain
available; browser interactions use local storage, while multiplayer clearly
reports that Firebase is required.
