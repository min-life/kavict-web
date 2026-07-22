import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { AppUser, OnboardingInput, UserProfile } from "./domain";
import type { AuthGateway } from "./gateway";

function toAppUser(user: User | null): AppUser | null {
  return user && { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL };
}

export function createFirebaseAuthGateway(): AuthGateway {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const getProfile = async (): Promise<UserProfile | null> => {
    if (!auth.currentUser) return null;
    const snapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
    return snapshot.exists() ? snapshot.data() as UserProfile : null;
  };

  return {
    async getCurrentUser() { return toAppUser(auth.currentUser); },
    getProfile,
    async signInWithEmail(email, password) { await signInWithEmailAndPassword(auth, email, password); },
    async registerWithEmail(email, password, displayName) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
    },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try { await signInWithPopup(auth, provider); }
      catch (error: unknown) {
        const code = (error as { code?: string }).code;
        if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") await signInWithRedirect(auth, provider);
        else throw error;
      }
    },
    async signOut() { await signOut(auth); },
    async completeOnboarding(input) {
      if (!auth.currentUser) throw new Error("No authenticated user");
      await updateProfile(auth.currentUser, { displayName: input.preferredName });
      await setDoc(doc(db, "users", auth.currentUser.uid), { ...input, onboarded: true, createdAt: serverTimestamp() }, { merge: true });
    },
    subscribe(listener) {
      let unsubscribeProfile: (() => void) | undefined;
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        unsubscribeProfile?.();
        if (!user) { listener(null, null); return; }
        unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => listener(toAppUser(user), snapshot.exists() ? snapshot.data() as UserProfile : null));
      });
      getRedirectResult(auth).catch((error) => console.error("Redirect auth error:", error));
      return () => { unsubscribeAuth(); unsubscribeProfile?.(); };
    },
  };
}
