import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { LearningMessage, LessonNote } from "./domain";
import type { LearningRepository } from "./repository";

export function createFirebaseLearningRepository(): LearningRepository {
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
  const db = getFirestore(app);

  return {
    async getChat(uid, lessonId) {
      try {
        const snapshot = await getDoc(doc(db, "learning_chat_sessions", `session_${uid}_lesson_${lessonId}`));
        return snapshot.exists() ? snapshot.data().messages as LearningMessage[] : [];
      } catch { return []; }
    },
    async saveChat(uid, lessonId, messages) {
      await setDoc(doc(db, "learning_chat_sessions", `session_${uid}_lesson_${lessonId}`), {
        lessonId, userId: uid, messages, updatedAt: new Date().toISOString(),
      }, { merge: true });
    },
    async getNotes(uid, lessonId) {
      try {
        const snapshot = await getDoc(doc(db, "learning_notes", `notes_${uid}_lesson_${lessonId}`));
        return snapshot.exists() ? snapshot.data().notes as LessonNote[] : [];
      } catch { return []; }
    },
    async saveNotes(uid, lessonId, notes) {
      await setDoc(doc(db, "learning_notes", `notes_${uid}_lesson_${lessonId}`), {
        lessonId, userId: uid, notes, updatedAt: new Date().toISOString(),
      }, { merge: true });
    },
  };
}
