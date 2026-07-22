import type { AppUser, OnboardingInput, UserProfile } from "./domain";
import type { AuthGateway } from "./gateway";

const USER_KEY = "kavict:local:user";
const PROFILE_KEY = "kavict:local:profile";
const demoUser: AppUser = {
  uid: "local-demo-user",
  displayName: "Kavi Demo",
  email: "demo@kavict.local",
  photoURL: null,
};

export function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function read<T>(storage: Storage, key: string): T | null {
  const value = storage.getItem(key);
  return value ? JSON.parse(value) as T : null;
}

export function createLocalAuthGateway(storage: Storage): AuthGateway {
  const listeners = new Set<(user: AppUser | null, profile: UserProfile | null) => void>();
  const getCurrentUser = async () => read<AppUser>(storage, USER_KEY);
  const getProfile = async () => read<UserProfile>(storage, PROFILE_KEY);
  const notify = () => {
    const user = read<AppUser>(storage, USER_KEY);
    const profile = read<UserProfile>(storage, PROFILE_KEY);
    listeners.forEach((listener) => listener(user, profile));
  };
  const setUser = (user: AppUser | null) => {
    if (user) storage.setItem(USER_KEY, JSON.stringify(user));
    else storage.removeItem(USER_KEY);
    notify();
  };

  return {
    getCurrentUser,
    getProfile,
    async signInWithEmail() { setUser(demoUser); },
    async registerWithEmail(_email, _password, displayName) {
      setUser({ ...demoUser, displayName: displayName || demoUser.displayName });
    },
    async signInWithGoogle() { setUser(demoUser); },
    async signOut() {
      storage.removeItem(USER_KEY);
      storage.removeItem(PROFILE_KEY);
      notify();
    },
    async completeOnboarding(input: OnboardingInput) {
      storage.setItem(PROFILE_KEY, JSON.stringify({ ...input, onboarded: true }));
      const user = read<AppUser>(storage, USER_KEY);
      if (user) storage.setItem(USER_KEY, JSON.stringify({ ...user, displayName: input.preferredName }));
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(read<AppUser>(storage, USER_KEY), read<UserProfile>(storage, PROFILE_KEY));
      return () => listeners.delete(listener);
    },
  };
}
