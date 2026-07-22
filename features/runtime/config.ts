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
