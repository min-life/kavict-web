# KAVICT Local Adapter Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve KAVICT's existing routes and UI while isolating Firebase behind feature contracts and making `npm run dev` work without `.env.local` through a local browser-data adapter.

**Architecture:** Route files remain Next.js App Router entry points and compose feature UI. Feature contracts define the data each screen needs; a centralized runtime factory selects browser-local adapters when Firebase configuration is absent and Firebase adapters otherwise. Next route handlers remain the server boundary and use server-only Gemini configuration.

**Tech Stack:** Next.js 16.2.9 App Router, React 19.2.4, TypeScript strict mode, Firebase 12.15.0, localStorage, Vitest, Tailwind CSS 4, Google GenAI SDK.

## Global Constraints

- Keep every existing `app/` route path, visual screen, and public API path unchanged.
- Do not import Firebase SDK modules from page files, presentational components, hooks, or contexts; Firebase belongs only in Firebase adapter modules.
- With no Firebase environment variables, local mode is automatic and persists editable demo data in `localStorage`.
- `NEXT_PUBLIC_KAVICT_MODE=local` overrides valid Firebase configuration for safe UI development.
- Firebase is the production adapter; do not introduce Express, Nest, or another deployed backend.
- Gemini reads `GOOGLE_GENAI_API_KEY` only in server code. Never use a `NEXT_PUBLIC_*` Gemini key.
- Local mode keeps solo gameplay; it must visibly explain that multiplayer is unavailable and must not open a Firebase room.
- Preserve `/api/chat` and `/api/gemini` request/response shapes.
- Do not touch the existing untracked `TASK.md`.
- Use test-first development for every contract, adapter, and route behavior in this plan.

---

## Planned file structure

```text
app/                                Next route composition and existing endpoints
features/
  runtime/                          mode selection, capabilities, demo banner
  auth/                             auth models, gateway, adapters, provider
  finance/                          finance models, repository, adapters
  learning/                         note/chat models, repository, adapters
  games/                            room contract, Firebase implementation, local capability
  ai/                               client response types and fallback copy
lib/server/                         server-only Gemini implementation
tests/                              Vitest contract and route tests
scripts/                            only documented, retained developer scripts
```

## Task 1: Add the test harness and runtime-mode contract

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `features/runtime/config.ts`
- Create: `features/runtime/config.test.ts`
- Create: `features/runtime/capabilities.ts`

**Interfaces:**
- Produces `RuntimeMode = "local" | "firebase"` and `resolveRuntimeMode(env)`.
- Produces `RuntimeCapabilities` with `usesLocalData`, `aiAvailable`, and `multiplayerAvailable`.
- All feature factories consume `resolveRuntimeMode()` rather than reading `process.env` themselves.

- [ ] **Step 1: Add a failing mode-selection test**

```ts
import { describe, expect, it } from "vitest";
import { resolveRuntimeMode } from "./config";

describe("resolveRuntimeMode", () => {
  it("uses local mode when Firebase configuration is absent", () => {
    expect(resolveRuntimeMode({})).toBe("local");
  });

  it("uses Firebase mode only when all client Firebase values exist", () => {
    expect(resolveRuntimeMode({
      NEXT_PUBLIC_FIREBASE_API_KEY: "key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://demo.firebaseio.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
    })).toBe("firebase");
  });

  it("honors the explicit local override", () => {
    expect(resolveRuntimeMode({
      NEXT_PUBLIC_KAVICT_MODE: "local",
      NEXT_PUBLIC_FIREBASE_API_KEY: "key",
    })).toBe("local");
  });
});
```

- [ ] **Step 2: Install Vitest and run the test to verify it fails because the module does not exist**

Run:

```bash
npm install --save-dev vitest
npm run test -- features/runtime/config.test.ts
```

Expected: the command finds Vitest but fails with `Cannot find module './config'`.

- [ ] **Step 3: Add test scripts, Vitest config, and the runtime implementation**

Add these package scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"typecheck": "tsc --noEmit"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Create `features/runtime/config.ts` with the exact required key list and a pure resolver:

```ts
export type RuntimeMode = "local" | "firebase";
export type RuntimeEnvironment = Record<string, string | undefined>;

const firebaseKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export function resolveRuntimeMode(env: RuntimeEnvironment = process.env): RuntimeMode {
  if (env.NEXT_PUBLIC_KAVICT_MODE === "local") return "local";
  return firebaseKeys.every((key) => Boolean(env[key])) ? "firebase" : "local";
}

export const runtimeMode = resolveRuntimeMode();
```

Create `features/runtime/capabilities.ts`:

```ts
import type { RuntimeMode } from "./config";

export interface RuntimeCapabilities {
  usesLocalData: boolean;
  aiAvailable: boolean;
  multiplayerAvailable: boolean;
}

export function getRuntimeCapabilities(mode: RuntimeMode): RuntimeCapabilities {
  return mode === "local"
    ? { usesLocalData: true, aiAvailable: false, multiplayerAvailable: false }
    : { usesLocalData: false, aiAvailable: true, multiplayerAvailable: true };
}
```

- [ ] **Step 4: Run the focused test and static checks**

Run:

```bash
npm run test -- features/runtime/config.test.ts
npm run typecheck
```

Expected: all three mode assertions pass and TypeScript exits with status 0.

- [ ] **Step 5: Commit the test harness and runtime contract**

```bash
git add package.json package-lock.json vitest.config.ts features/runtime
git commit -m "test: add runtime mode contract"
```

## Task 2: Introduce the authentication gateway and local demo session

**Files:**
- Create: `features/auth/domain.ts`
- Create: `features/auth/gateway.ts`
- Create: `features/auth/localGateway.ts`
- Create: `features/auth/firebaseGateway.ts`
- Create: `features/auth/AuthProvider.tsx`
- Create: `features/auth/localGateway.test.ts`
- Modify: `app/layout.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/register/page.tsx`
- Modify: `app/components/Sidebar.tsx`
- Modify: `app/components/ProtectedRoute.tsx`
- Delete: `contexts/AuthContext.tsx`
- Delete: `lib/firebase.ts`

**Interfaces:**
- Produces `AppUser`, `UserProfile`, `OnboardingInput`, and `AuthGateway`.
- `useAuth()` returns `{ user, userProfile, loading, signInWithEmail, registerWithEmail, signInWithGoogle, signOut, completeOnboarding }`.
- Later finance, learning, and games features consume `user.uid`; they never import Firebase user types.

- [ ] **Step 1: Write the failing local-auth persistence test**

```ts
import { describe, expect, it } from "vitest";
import { createLocalAuthGateway, createMemoryStorage } from "./localGateway";

describe("local auth gateway", () => {
  it("creates a deterministic demo session and persists onboarding", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);

    await gateway.signInWithEmail("demo@kavict.local", "ignored");
    await gateway.completeOnboarding({
      preferredName: "Kavi Demo",
      occupationGroup: "Sinh viên",
      monthlyIncome: "3 - 5 triệu",
      highestExpenses: ["Ăn uống"],
      financialGoal: "Tiết kiệm một khoản tiền",
    });

    expect(await gateway.getCurrentUser()).toMatchObject({ uid: "local-demo-user" });
    expect(await gateway.getProfile()).toMatchObject({ preferredName: "Kavi Demo", onboarded: true });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the gateway is absent**

Run:

```bash
npm run test -- features/auth/localGateway.test.ts
```

Expected: FAIL with an unresolved `./localGateway` import.

- [ ] **Step 3: Implement the domain contract and local gateway**

Create `features/auth/domain.ts`:

```ts
export interface AppUser { uid: string; displayName: string | null; email: string | null; photoURL: string | null; }
export interface UserProfile {
  preferredName?: string; occupationGroup?: string; monthlyIncome?: string;
  highestExpenses?: string[]; financialGoal?: string; onboarded?: boolean;
}
export interface OnboardingInput {
  preferredName: string; occupationGroup: string; monthlyIncome: string;
  highestExpenses: string[]; financialGoal: string;
}
```

Create `features/auth/gateway.ts`:

```ts
import type { AppUser, OnboardingInput, UserProfile } from "./domain";
export interface AuthGateway {
  getCurrentUser(): Promise<AppUser | null>;
  getProfile(): Promise<UserProfile | null>;
  signInWithEmail(email: string, password: string): Promise<void>;
  registerWithEmail(email: string, password: string, displayName: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  completeOnboarding(input: OnboardingInput): Promise<void>;
  subscribe(listener: (user: AppUser | null, profile: UserProfile | null) => void): () => void;
}
```

Implement `createLocalAuthGateway(storage)` with the keys `kavict:local:user` and `kavict:local:profile`, a user `{ uid: "local-demo-user", displayName: "Kavi Demo", email: "demo@kavict.local", photoURL: null }`, and synchronous subscriber notifications after each mutation. `createMemoryStorage()` implements the browser `Storage` shape with a `Map` so the test does not require JSDOM.

Implement `firebaseGateway.ts` as the sole Firebase Auth/Firestore adapter. Construct Firebase only inside `createFirebaseAuthGateway()` after runtime mode selected; map Firebase `User` fields into `AppUser` and use the existing `users/{uid}` profile document schema.

- [ ] **Step 4: Implement the provider and migrate all auth consumers**

`AuthProvider` selects `createLocalAuthGateway(window.localStorage)` in local mode and `createFirebaseAuthGateway()` otherwise. It exposes the context methods listed above. Replace direct SDK calls in login/register/sidebar/onboarding usage with those context methods. Replace `contexts/AuthContext` imports with `@/features/auth/AuthProvider`; replace root layout provider import accordingly. Preserve existing redirects and Vietnamese messages.

- [ ] **Step 5: Run the focused tests and ensure no UI file imports Firebase**

Run:

```bash
npm run test -- features/auth/localGateway.test.ts
rg -n "from [\"']firebase|@/lib/firebase" app contexts features --glob '!features/**/firebaseGateway.ts'
npm run typecheck
```

Expected: auth test passes, `rg` prints no application consumers, and type checking passes.

- [ ] **Step 6: Commit the auth boundary**

```bash
git add app features/auth contexts/AuthContext.tsx lib/firebase.ts
git commit -m "refactor: isolate authentication adapters"
```

## Task 3: Isolate finance persistence behind a repository

**Files:**
- Create: `features/finance/domain.ts`
- Create: `features/finance/repository.ts`
- Create: `features/finance/localRepository.ts`
- Create: `features/finance/firebaseRepository.ts`
- Create: `features/finance/provider.ts`
- Create: `features/finance/localRepository.test.ts`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/ai-assistant/page.tsx`
- Modify: `app/dashboard/ai-assistant/components/OnboardingPlanner.tsx`
- Modify: `app/dashboard/ai-assistant/components/FinancialDashboard.tsx`
- Modify: `app/dashboard/components/FinancialOverview.tsx`
- Delete: `lib/financeStore.ts`
- Delete: `lib/financeTypes.ts`

**Interfaces:**
- Produces `FinancialPlan`, `Transaction`, `TransactionType`, and `FinanceRepository`.
- `getFinanceRepository()` returns a local or Firebase implementation once per browser runtime.
- Finance UI accepts the same plan/transaction data and calls repository methods rather than Firestore.

- [ ] **Step 1: Write a failing repository round-trip test**

```ts
import { describe, expect, it } from "vitest";
import { createLocalFinanceRepository } from "./localRepository";
import { createMemoryStorage } from "@/features/auth/localGateway";

describe("local finance repository", () => {
  it("persists a plan and returns transactions in descending date order", async () => {
    const repo = createLocalFinanceRepository(createMemoryStorage());
    await repo.savePlan("local-demo-user", { currentBalance: 2_000_000, monthlyIncome: 5_000_000 });
    await repo.addTransaction("local-demo-user", { amount: 20_000, type: "expense", category: "Ăn uống", date: 20, createdAt: 20 });
    await repo.addTransaction("local-demo-user", { amount: 50_000, type: "expense", category: "Đi lại", date: 50, createdAt: 50 });

    expect((await repo.getPlan("local-demo-user"))?.currentBalance).toBe(2_000_000);
    expect((await repo.getTransactions("local-demo-user")).map((item) => item.date)).toEqual([50, 20]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the repository is absent**

Run:

```bash
npm run test -- features/finance/localRepository.test.ts
```

Expected: FAIL with unresolved `./localRepository`.

- [ ] **Step 3: Implement the contract and both adapters**

Move the current types from `lib/financeTypes.ts` unchanged into `features/finance/domain.ts`. Define this repository:

```ts
import type { FinancialPlan, Transaction } from "./domain";
export interface FinanceRepository {
  getPlan(uid: string): Promise<FinancialPlan | null>;
  savePlan(uid: string, plan: Partial<FinancialPlan>): Promise<void>;
  getTransactions(uid: string): Promise<Transaction[]>;
  addTransaction(uid: string, transaction: Omit<Transaction, "id">): Promise<string>;
  deleteTransaction(uid: string, transactionId: string): Promise<void>;
  updateTransaction(uid: string, transactionId: string, updates: Partial<Transaction>): Promise<void>;
  resetDemoData?(): Promise<void>;
}
```

The local adapter stores `{ plans: Record<string, FinancialPlan>, transactions: Record<string, Transaction[]> }` under `kavict:local:finance:v1`, generates IDs with `crypto.randomUUID()`, merges `updatedAt: Date.now()`, and sorts all returned transactions by descending `date`. The Firebase adapter moves the current `lib/financeStore.ts` operations unchanged behind this interface.

- [ ] **Step 4: Migrate finance UI without changing its rendered contract**

Replace `getFinancialPlan`, `getTransactions`, and mutation imports in every listed component with `getFinanceRepository()`. Keep prop types from `features/finance/domain.ts`, preserve all existing labels and calculations, and call repository methods only after `user` is available. Delete the legacy `lib/financeStore.ts` and `lib/financeTypes.ts` only after every import has moved.

- [ ] **Step 5: Verify the adapter and consumer migration**

Run:

```bash
npm run test -- features/finance/localRepository.test.ts
rg -n "financeStore|financeTypes|firebase/firestore" app lib contexts features --glob '!features/**/firebaseRepository.ts'
npm run typecheck
```

Expected: finance test passes, no legacy or direct Firestore consumer remains, and type checking passes.

- [ ] **Step 6: Commit finance persistence isolation**

```bash
git add app features/finance lib/financeStore.ts lib/financeTypes.ts
git commit -m "refactor: add local finance repository"
```

## Task 4: Move onboarding and learning notes/chat into feature repositories

**Files:**
- Create: `features/learning/domain.ts`
- Create: `features/learning/repository.ts`
- Create: `features/learning/localRepository.ts`
- Create: `features/learning/firebaseRepository.ts`
- Create: `features/learning/provider.ts`
- Create: `features/learning/localRepository.test.ts`
- Modify: `app/dashboard/onboarding/page.tsx`
- Modify: `app/dashboard/learning/lesson/[id]/page.tsx`

**Interfaces:**
- Produces `LearningMessage`, `LessonNote`, `LearningRepository`, and `ProfileRepository`.
- Learning page gets and saves notes/chat through `LearningRepository`.
- Onboarding calls `AuthGateway.completeOnboarding`; it does not import Firestore or Firebase Auth.

- [ ] **Step 1: Write a failing local-learning persistence test**

```ts
import { describe, expect, it } from "vitest";
import { createLocalLearningRepository } from "./localRepository";
import { createMemoryStorage } from "@/features/auth/localGateway";

describe("local learning repository", () => {
  it("keeps notes and chat isolated by user and lesson", async () => {
    const repo = createLocalLearningRepository(createMemoryStorage());
    await repo.saveNotes("user-a", 4, [{ id: "note-1", text: "Lãi kép", timestamp: "09:00" }]);
    await repo.saveChat("user-a", 4, [{ id: "chat-1", sender: "user", text: "Ví dụ", timestamp: "09:01" }]);

    expect(await repo.getNotes("user-a", 4)).toHaveLength(1);
    expect(await repo.getChat("user-b", 4)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the repository is absent**

Run:

```bash
npm run test -- features/learning/localRepository.test.ts
```

Expected: FAIL with unresolved `./localRepository`.

- [ ] **Step 3: Implement learning contracts and adapters**

Create `features/learning/domain.ts`:

```ts
export interface LearningMessage { id: string; sender: "user" | "ai"; text: string; timestamp: string; }
export interface LessonNote { id: string; text: string; timestamp: string; [key: string]: unknown; }
```

Create `features/learning/repository.ts`:

```ts
import type { LearningMessage, LessonNote } from "./domain";
export interface LearningRepository {
  getChat(uid: string, lessonId: number): Promise<LearningMessage[]>;
  saveChat(uid: string, lessonId: number, messages: LearningMessage[]): Promise<void>;
  getNotes(uid: string, lessonId: number): Promise<LessonNote[]>;
  saveNotes(uid: string, lessonId: number, notes: LessonNote[]): Promise<void>;
}
```

The local adapter uses the versioned keys `kavict:local:learning:v1:chat:<uid>:<lessonId>` and `kavict:local:learning:v1:notes:<uid>:<lessonId>`. The Firebase adapter retains the existing `learning_chat_sessions/session_<uid>_lesson_<id>` and `learning_notes/notes_<uid>_lesson_<id>` documents, returning empty arrays rather than leaking SDK errors into UI state.

- [ ] **Step 4: Migrate onboarding and lesson page calls**

In onboarding, replace `updateProfile` and `setDoc` with `completeOnboarding({ preferredName, occupationGroup, monthlyIncome, highestExpenses, financialGoal: finalGoal })`. In the lesson page, replace `getDoc`/`setDoc` calls and the ad-hoc `localStorage` fallback with `getLearningRepository()`. Preserve initial lesson chat messages when the returned chat is empty and preserve every current note interaction.

- [ ] **Step 5: Verify persistence behavior and Firebase import removal**

Run:

```bash
npm run test -- features/learning/localRepository.test.ts
rg -n "firebase/(auth|firestore)|@/lib/firebase" app/dashboard/onboarding app/dashboard/learning contexts
npm run typecheck
```

Expected: learning test passes, the `rg` command prints no direct Firebase imports, and type checking passes.

- [ ] **Step 6: Commit learning and onboarding migration**

```bash
git add app/dashboard/onboarding app/dashboard/learning features/learning
git commit -m "refactor: isolate learning and onboarding data"
```

## Task 5: Make AI a server-only integration with local fallback

**Files:**
- Create: `features/ai/fallback.ts`
- Create: `lib/server/gemini.ts`
- Create: `tests/api/gemini.test.ts`
- Modify: `app/api/chat/route.ts`
- Modify: `app/api/gemini/route.ts`
- Modify: `app/dashboard/ai-assistant/components/FinancialDashboard.tsx`
- Modify: `app/dashboard/ai-assistant/components/OnboardingPlanner.tsx`

**Interfaces:**
- Produces `getGeminiResponse(input)` returning `Promise<{ text: string }>`.
- Both existing endpoints return `{ text: string }` on success and retain their current JSON error shapes for malformed input.
- Local mode returns `getLocalAiFallback()` without constructing `GoogleGenAI`.

- [ ] **Step 1: Write a failing API fallback test**

```ts
import { describe, expect, it } from "vitest";
import { getLocalAiFallback } from "@/features/ai/fallback";

describe("local AI fallback", () => {
  it("returns useful Vietnamese copy without an API key", () => {
    expect(getLocalAiFallback("lập ngân sách").text).toContain("chế độ demo local");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the fallback module is absent**

Run:

```bash
npm run test -- tests/api/gemini.test.ts
```

Expected: FAIL with unresolved `@/features/ai/fallback`.

- [ ] **Step 3: Implement fallback and the server-only Gemini wrapper**

Create `features/ai/fallback.ts`:

```ts
export function getLocalAiFallback(context: string) {
  return { text: `Bạn đang ở chế độ demo local. Hãy thử chia mục tiêu "${context}" thành khoản cần thiết, tiết kiệm và linh hoạt; thêm GOOGLE_GENAI_API_KEY để nhận tư vấn AI trực tiếp.` };
}
```

Create `lib/server/gemini.ts` with a lazy `GoogleGenAI` construction. If `process.env.GOOGLE_GENAI_API_KEY` is absent, call `getLocalAiFallback(context)`; otherwise call `gemini.models.generateContent` with the current model `gemini-2.5-flash` and return `{ text: response.text ?? "" }`. Mark the module server-only with `import "server-only";`.

- [ ] **Step 4: Preserve endpoint contracts and update UI copy only where needed**

Replace duplicated GenAI construction in both route handlers with `getGeminiResponse`. Keep `/api/chat` validation of `message`, history mapping, lesson-context system instruction, and current HTTP status codes. Keep `/api/gemini` `prompt` and `systemInstruction` request fields. The existing finance UI continues calling `/api/gemini`; add a local-demo notice based on runtime capabilities, not on a failed network request.

- [ ] **Step 5: Verify fallback and secret placement**

Run:

```bash
npm run test -- tests/api/gemini.test.ts
rg -n "NEXT_PUBLIC_AI_API_KEY|GOOGLE_GENAI_API_KEY" app features lib
npm run typecheck
```

Expected: test passes, only `lib/server/gemini.ts` reads `GOOGLE_GENAI_API_KEY`, no `NEXT_PUBLIC_AI_API_KEY` remains, and type checking passes.

- [ ] **Step 6: Commit server-only AI handling**

```bash
git add app/api app/dashboard/ai-assistant features/ai lib/server tests/api
git commit -m "refactor: move Gemini integration server-side"
```

## Task 6: Separate multiplayer transport and make local capabilities explicit

**Files:**
- Create: `features/games/domain.ts`
- Create: `features/games/roomGateway.ts`
- Create: `features/games/firebaseRoomGateway.ts`
- Create: `features/games/localGameCapabilities.ts`
- Create: `features/games/roomGateway.test.ts`
- Create: `features/runtime/components/LocalDemoNotice.tsx`
- Modify: `app/dashboard/games/page.tsx`
- Modify: `app/dashboard/games/components/MultiplayerModal.tsx`
- Modify: `app/dashboard/games/hooks/useGameRoom.ts`
- Modify: `app/dashboard/games/hooks/useMultiplayerGameEngine.ts`
- Modify: `app/dashboard/games/services/roomService.ts`
- Modify: `app/dashboard/games/services/webrtcService.ts`
- Modify: `app/dashboard/layout.tsx`

**Interfaces:**
- Produces `GameRoom`, `GameConfig`, `Player`, `RoomStatus`, and `GameRoomGateway`.
- `getGameRoomGateway()` returns Firebase implementation only in Firebase mode.
- `getLocalMultiplayerMessage()` gives UI a stable Vietnamese explanation in local mode.

- [ ] **Step 1: Write a failing capability test**

```ts
import { describe, expect, it } from "vitest";
import { getLocalMultiplayerMessage } from "./localGameCapabilities";

describe("local multiplayer capability", () => {
  it("explains why browser-local mode cannot create a room", () => {
    expect(getLocalMultiplayerMessage()).toContain("Firebase");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the capability module is absent**

Run:

```bash
npm run test -- features/games/roomGateway.test.ts
```

Expected: FAIL with unresolved `./localGameCapabilities`.

- [ ] **Step 3: Move transport types and Firebase calls behind a gateway**

Move the exported room types from `app/dashboard/games/services/roomService.ts` into `features/games/domain.ts`. Define a `GameRoomGateway` containing the existing room actions (`createRoom`, `joinRoom`, `leaveRoom`, `kickPlayer`, `configureGame`, `submitGameConfig`, `startGame`, `deleteRoom`, `subscribeToRoom`, `setupOnDisconnect`, `cancelOnDisconnect`, `updatePlayerMediaState`, `savePlayerAllocations`). Move the current Realtime Database implementation into `features/games/firebaseRoomGateway.ts`; the gateway is the sole allowed location for `firebase/database` room imports.

Keep WebRTC transport in `features/games/firebaseWebRtcService.ts` and have hooks receive it through a Firebase-only factory. Do not create a fake WebRTC implementation.

Create `features/games/localGameCapabilities.ts`:

```ts
export function getLocalMultiplayerMessage() {
  return "Chơi cùng bạn cần Firebase Realtime Database. Hãy thêm cấu hình Firebase để tạo hoặc tham gia phòng.";
}
```

- [ ] **Step 4: Preserve solo game and block only multiplayer in local mode**

In `app/dashboard/games/page.tsx`, always retain the existing Solo card/link. In local mode, replace the multiplayer card click handler with a non-destructive notice using `getLocalMultiplayerMessage`; do not mount `MultiplayerModal`, request camera/microphone, or call room hooks. In Firebase mode, retain current modal behavior. Add `LocalDemoNotice` to the dashboard layout so all dashboard screens visibly identify editable local demo data and provide a reset action through local repositories.

- [ ] **Step 5: Verify capability behavior and transport isolation**

Run:

```bash
npm run test -- features/games/roomGateway.test.ts
rg -n "firebase/database|@/lib/firebase" app features --glob '!features/games/firebase*.ts'
npm run typecheck
```

Expected: capability test passes, database imports occur only inside Firebase game adapter files, and type checking passes.

- [ ] **Step 6: Commit local game capability handling**

```bash
git add app/dashboard/games app/dashboard/layout.tsx features/games features/runtime/components
git commit -m "refactor: isolate multiplayer transport"
```

## Task 7: Complete route composition cleanup and remove obsolete conversion artefacts

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `docs/architecture.md`
- Delete: `fix_aria.js`
- Delete: `fix_checked.js`
- Delete: `fix_disabled.js`
- Delete: `fix_max_w.js`
- Delete: `fix_onclick.js`
- Delete: `fix_query_selector.js`
- Delete: `fix_required.js`
- Delete: `fix_rows.js`
- Delete: `fix_svg_attrs.js`
- Delete: `fix_variants.js`
- Delete: `convert_screens.js`
- Delete: `_stitch_raw/`

**Interfaces:**
- Produces documented `npm run dev`, Firebase mode, forced local mode, and production environment setup.
- Produces a concise architecture map with the same provider boundaries implemented above.
- Removes only source-generation artefacts verified unused by package scripts, docs, CI, and imports.

- [ ] **Step 1: Write a failing artefact-reference test**

Create `tests/tooling/obsoleteArtifacts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

describe("repository tooling", () => {
  it("does not retain one-off Stitch conversion scripts", () => {
    for (const name of ["convert_screens.js", "fix_aria.js", "fix_variants.js", "_stitch_raw"]) {
      expect(existsSync(path.resolve(process.cwd(), name))).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because old artefacts still exist**

Run:

```bash
npm run test -- tests/tooling/obsoleteArtifacts.test.ts
```

Expected: FAIL because `convert_screens.js` and `_stitch_raw` exist.

- [ ] **Step 3: Verify no supported workflow references the artefacts, then remove them**

Run before deletion:

```bash
rg -n "fix_(aria|checked|disabled|max_w|onclick|query_selector|required|rows|svg_attrs|variants)|convert_screens|_stitch_raw" package.json README.md .github . --glob '!_stitch_raw/**' --glob '!fix_*.js' --glob '!convert_screens.js'
```

Expected: no runtime, package-script, CI, or documentation reference. Then remove exactly the listed files/directories with `git rm`, not wildcard deletion.

Create `.env.example` containing blank keys for `NEXT_PUBLIC_KAVICT_MODE`, all seven Firebase values, and `GOOGLE_GENAI_API_KEY`. Update README with these exact commands:

```bash
npm ci
npm run dev
# http://localhost:3000; no .env.local starts local demo mode

# Optional: force local mode even when Firebase values exist
NEXT_PUBLIC_KAVICT_MODE=local npm run dev
```

Document that Vercel receives the same Firebase variables plus `GOOGLE_GENAI_API_KEY`, while `NEXT_PUBLIC_*` values are not secrets. `docs/architecture.md` must name the route, feature contract, adapter, and server boundaries.

- [ ] **Step 4: Run the cleanup test and documentation checks**

Run:

```bash
npm run test -- tests/tooling/obsoleteArtifacts.test.ts
rg -n "NEXT_PUBLIC_AI_API_KEY|@/lib/firebase|from [\"']firebase" app contexts lib features --glob '!features/**/firebase*.ts'
git diff --check
```

Expected: artefact test passes, the import scan has no disallowed hits, and `git diff --check` emits no whitespace errors.

- [ ] **Step 5: Commit the cleanup and contributor documentation**

```bash
git add README.md .gitignore .env.example docs/architecture.md tests/tooling
git rm fix_aria.js fix_checked.js fix_disabled.js fix_max_w.js fix_onclick.js fix_query_selector.js fix_required.js fix_rows.js fix_svg_attrs.js fix_variants.js convert_screens.js
git rm -r _stitch_raw
git commit -m "chore: remove obsolete Stitch conversion tooling"
```

## Task 8: Run integration verification in both runtime modes

**Files:**
- Create: `tests/smoke/localMode.test.ts`
- Modify: `README.md`

**Interfaces:**
- Confirms all route/API contracts remained intact after refactoring.
- Confirms local mode is a supported development path, not an undocumented fallback.

- [ ] **Step 1: Write a failing local-mode smoke test**

```ts
import { describe, expect, it } from "vitest";
import { resolveRuntimeMode } from "@/features/runtime/config";
import { getRuntimeCapabilities } from "@/features/runtime/capabilities";

describe("local development mode", () => {
  it("enables editable local data and disables only external capabilities", () => {
    const mode = resolveRuntimeMode({});
    expect(getRuntimeCapabilities(mode)).toEqual({
      usesLocalData: true,
      aiAvailable: false,
      multiplayerAvailable: false,
    });
  });
});
```

- [ ] **Step 2: Run the smoke test to verify the expected behavior**

Run:

```bash
npm run test -- tests/smoke/localMode.test.ts
```

Expected: PASS; if it fails, the runtime-capability implementation has regressed and must be fixed before continuing.

- [ ] **Step 3: Start local mode without `.env.local` and perform browser smoke checks**

Run:

```bash
env -u NEXT_PUBLIC_FIREBASE_API_KEY -u NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN -u NEXT_PUBLIC_FIREBASE_DATABASE_URL -u NEXT_PUBLIC_FIREBASE_PROJECT_ID -u NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET -u NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID -u NEXT_PUBLIC_FIREBASE_APP_ID npm run dev
```

Verify manually at `http://localhost:3000`:

1. Landing page renders without a Firebase initialization error.
2. Login enters the deterministic demo session.
3. Onboarding saves profile and dashboard remains accessible after reload.
4. A plan, transaction, and lesson note remain after reload.
5. Solo game opens; multiplayer shows the explicit Firebase requirement.
6. `/api/chat` and `/api/gemini` return local fallback `{ "text": "..." }` when no Gemini key exists.

- [ ] **Step 4: Run the production-quality suite and Firebase-mode selection test**

Run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
NEXT_PUBLIC_FIREBASE_API_KEY=x NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=x NEXT_PUBLIC_FIREBASE_DATABASE_URL=x NEXT_PUBLIC_FIREBASE_PROJECT_ID=x NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=x NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=x NEXT_PUBLIC_FIREBASE_APP_ID=x npm run test -- features/runtime/config.test.ts
```

Expected: all tests, lint, type check, and build succeed; the Firebase-configured mode assertion passes without making a network request.

- [ ] **Step 5: Commit final validation-only documentation update**

```bash
git add README.md tests/smoke/localMode.test.ts
git commit -m "test: verify local development mode"
```

## Self-review checklist

- Task 1 implements centralized mode selection and a test harness.
- Task 2 isolates Auth and onboarding identity state from UI.
- Task 3 isolates financial plans and transactions from UI.
- Task 4 isolates learning notes and chat from UI.
- Task 5 preserves API paths while securing Gemini server configuration.
- Task 6 preserves solo games and isolates Firebase realtime/WebRTC multiplayer.
- Task 7 removes only verified one-off conversion artefacts and documents developer setup.
- Task 8 verifies no-env local mode, configured Firebase selection, API shape, lint, types, and production build.
- Every later interface is named and introduced in an earlier task.
- The plan contains no deferred implementation markers and does not modify `TASK.md`.
