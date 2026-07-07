import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, query, orderBy, deleteDoc } from "firebase/firestore";
import { FinancialPlan, Transaction } from "./financeTypes";

export const getFinancialPlan = async (uid: string): Promise<FinancialPlan | null> => {
  const docRef = doc(db, "financial_plans", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as FinancialPlan;
  }
  return null;
};

export const saveFinancialPlan = async (uid: string, plan: Partial<FinancialPlan>) => {
  const docRef = doc(db, "financial_plans", uid);
  await setDoc(docRef, { ...plan, updatedAt: Date.now() }, { merge: true });
};

export const getTransactions = async (uid: string): Promise<Transaction[]> => {
  const q = query(
    collection(db, "transactions", uid, "records"),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
};

export const addTransaction = async (uid: string, transaction: Transaction) => {
  const colRef = collection(db, "transactions", uid, "records");
  const docRef = await addDoc(colRef, { ...transaction, createdAt: Date.now() });
  return docRef.id;
};

export const deleteTransaction = async (uid: string, transactionId: string) => {
  await deleteDoc(doc(db, "transactions", uid, "records", transactionId));
};

export const updateTransaction = async (uid: string, transactionId: string, updates: Partial<Transaction>) => {
  await updateDoc(doc(db, "transactions", uid, "records", transactionId), updates);
};
