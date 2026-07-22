import { getApp, getApps, initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import type { FinancialPlan, Transaction } from "./domain";
import type { FinanceRepository } from "./repository";

export function createFirebaseFinanceRepository(): FinanceRepository {
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
    async getPlan(uid) {
      const snapshot = await getDoc(doc(db, "financial_plans", uid));
      return snapshot.exists() ? snapshot.data() as FinancialPlan : null;
    },
    async savePlan(uid, plan) {
      await setDoc(doc(db, "financial_plans", uid), { ...plan, updatedAt: Date.now() }, { merge: true });
    },
    async getTransactions(uid) {
      const snapshot = await getDocs(query(collection(db, "transactions", uid, "records"), orderBy("date", "desc")));
      return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Transaction));
    },
    async addTransaction(uid, transaction) {
      const snapshot = await addDoc(collection(db, "transactions", uid, "records"), { ...transaction, createdAt: Date.now() });
      return snapshot.id;
    },
    async deleteTransaction(uid, transactionId) {
      await deleteDoc(doc(db, "transactions", uid, "records", transactionId));
    },
    async updateTransaction(uid, transactionId, updates) {
      await updateDoc(doc(db, "transactions", uid, "records", transactionId), updates);
    },
  };
}
