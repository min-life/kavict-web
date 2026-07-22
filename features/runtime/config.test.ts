import { describe, expect, it } from "vitest";
import { getRuntimeCapabilities } from "./capabilities";
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

  it("uses local mode when any required Firebase client value is missing", () => {
    const firebaseEnvironment = {
      NEXT_PUBLIC_FIREBASE_API_KEY: "key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://demo.firebaseio.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
    };

    for (const key of Object.keys(firebaseEnvironment)) {
      const incompleteEnvironment = { ...firebaseEnvironment, [key]: undefined };
      expect(resolveRuntimeMode(incompleteEnvironment)).toBe("local");
    }
  });

  it("honors the explicit local override", () => {
    expect(resolveRuntimeMode({
      NEXT_PUBLIC_KAVICT_MODE: "local",
      NEXT_PUBLIC_FIREBASE_API_KEY: "key",
    })).toBe("local");
  });
});

describe("getRuntimeCapabilities", () => {
  it("maps local mode to local-only capabilities", () => {
    expect(getRuntimeCapabilities("local")).toEqual({
      usesLocalData: true,
      aiAvailable: false,
      multiplayerAvailable: false,
    });
  });

  it("maps Firebase mode to connected capabilities", () => {
    expect(getRuntimeCapabilities("firebase")).toEqual({
      usesLocalData: false,
      aiAvailable: true,
      multiplayerAvailable: true,
    });
  });
});
