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
