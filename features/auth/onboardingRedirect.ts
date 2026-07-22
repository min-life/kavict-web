import type { UserProfile } from "./domain";

export function shouldRedirectCompletedOnboarding(profile: UserProfile | null | undefined) {
  return profile?.onboarded === true;
}
