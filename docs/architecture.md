# Architecture map

KAVICT keeps routes and UI independent of infrastructure. Runtime selection is
centralized in `features/runtime/config.ts`: an explicit
`NEXT_PUBLIC_KAVICT_MODE=local` selects local mode; otherwise a complete
Firebase configuration selects Firebase, and missing configuration selects
local mode.

## Client boundary

App routes and presentational components use feature contracts rather than
Firebase SDK APIs directly:

- Authentication uses the `AuthGateway` contract and its local or Firebase
  gateway implementation.
- Finance uses `FinanceRepository`, selected by `getFinanceRepository()`.
- Learning uses `LearningRepository`, selected by `getLearningRepository()`.
- Multiplayer uses `GameRoomGateway`; local mode returns an explicit
  unavailable capability rather than simulating network connectivity.

The provider/factory layer selects localStorage adapters in local mode and
Firebase adapters in Firebase mode. Firebase SDK imports and shared browser
client initialization remain within the Firebase adapter boundary
(`features/**/firebase*.ts`).

## Server boundary

The Next.js route handlers remain the server interface: `/api/chat` and
`/api/gemini` preserve their request and response contracts and call
`lib/server/gemini.ts`. That server-only module reads
`GOOGLE_GENAI_API_KEY`; when it is absent, it returns the local AI fallback.
Client code must not receive that key.
