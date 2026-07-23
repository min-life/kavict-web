"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { runtimeMode } from "@/features/runtime/config";
import type { AppUser, OnboardingInput, ProfilePreferencesInput, UserProfile } from "./domain";
import type { AuthGateway } from "./gateway";
import { createFirebaseAuthGateway } from "./firebaseGateway";
import { createLocalAuthGateway } from "./localGateway";

interface AuthContextType {
  user: AppUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail(email: string, password: string): Promise<void>;
  registerWithEmail(email: string, password: string, displayName: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  completeOnboarding(input: OnboardingInput): Promise<void>;
  updateProfilePreferences(input: ProfilePreferencesInput): Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const gatewayRef = useRef<AuthGateway | null>(null);

  useEffect(() => {
    const selectedGateway = runtimeMode === "local"
      ? createLocalAuthGateway(window.localStorage)
      : createFirebaseAuthGateway();
    gatewayRef.current = selectedGateway;
    return selectedGateway.subscribe((nextUser, nextProfile) => {
      setUser(nextUser);
      setUserProfile(nextProfile);
      setLoading(false);
    });
  }, []);

  const requireGateway = () => {
    if (!gatewayRef.current) throw new Error("Authentication is still initializing");
    return gatewayRef.current;
  };
  const value: AuthContextType = {
    user, userProfile, loading,
    signInWithEmail: (email, password) => requireGateway().signInWithEmail(email, password),
    registerWithEmail: (email, password, displayName) => requireGateway().registerWithEmail(email, password, displayName),
    signInWithGoogle: () => requireGateway().signInWithGoogle(),
    signOut: () => requireGateway().signOut(),
    completeOnboarding: (input) => requireGateway().completeOnboarding(input),
    updateProfilePreferences: (input) => requireGateway().updateProfilePreferences(input),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
