import { describe, expect, it } from "vitest";
import { shouldRedirectCompletedOnboarding } from "./onboardingRedirect";

describe("shouldRedirectCompletedOnboarding", () => {
  it("redirects only after onboarding is complete", () => {
    expect(shouldRedirectCompletedOnboarding({ onboarded: true })).toBe(true);
    expect(shouldRedirectCompletedOnboarding({ onboarded: false })).toBe(false);
    expect(shouldRedirectCompletedOnboarding(null)).toBe(false);
  });
});
