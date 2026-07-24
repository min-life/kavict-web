"use client";

import { useMemo, useState } from "react";
import type { FinancialPlan, Transaction, TransactionType } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import type { QuickTransactionParseResponse, QuickTransactionReady } from "@/features/finance/quickTransaction";
import { saveTransactionAndUpdateBalance } from "@/features/finance/transactionMutation";
import MoneyInput from "./MoneyInput";

const EXPENSE_CATEGORIES = ["Ăn uống", "Nhà ở", "Đi lại", "Học tập", "Mua sắm", "Sức khỏe", "Khác"];
const INCOME_CATEGORIES = ["Tiền lương", "Làm thêm", "Thưởng", "Khác"];

type TransactionEntryTabProps = {
  userId: string;
  plan: FinancialPlan | null;
  transactions: Transaction[];
  onSaved: () => Promise<void>;
  showRecentTransactions?: boolean;
};

const formatVnd = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

export default function TransactionEntryTab({ userId, plan, transactions, onSaved, showRecentTransactions = true }: TransactionEntryTabProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Ăn uống");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [quickResult, setQuickResult] = useState<QuickTransactionParseResponse | null>(null);
  const [quickError, setQuickError] = useState("");
  const [isParsingQuick, setIsParsingQuick] = useState(false);

  const categories = useMemo(() => {
    if (type === "income") return INCOME_CATEGORIES;
    return Array.from(new Set([...(plan?.budgets.map((budget) => budget.category) ?? []), ...EXPENSE_CATEGORIES]));
  }, [plan, type]);

  const quickCategories = useMemo(() => Array.from(new Set([
    ...(plan?.budgets.map((budget) => budget.category) ?? []),
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  ])), [plan]);

  const selectType = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(nextType === "income" ? "Tiền lương" : plan?.budgets[0]?.category ?? "Ăn uống");
  };

  const saveTransaction = async (transaction: QuickTransactionReady["transaction"]) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const repository = getFinanceRepository();
      await saveTransactionAndUpdateBalance(repository, userId, plan, transaction);
      await onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (amount <= 0 || !date || isSaving) return;
    await saveTransaction({ amount, type, category, note: note.trim(), date: new Date(`${date}T12:00:00`).getTime() });
    setAmount(0);
    setNote("");
  };

  const parseQuickTransaction = async () => {
    const message = quickMessage.trim();
    if (!message || isParsingQuick) return;
    setIsParsingQuick(true);
    setQuickError("");
    setQuickResult(null);
    try {
      const response = await fetch("/api/finance-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, categories: quickCategories, now: Date.now() }),
      });
      const data = await response.json() as QuickTransactionParseResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể phân tích giao dịch.");
      setQuickResult(data);
    } catch (error) {
      setQuickError(error instanceof Error ? error.message : "Không thể phân tích giao dịch.");
    } finally {
      setIsParsingQuick(false);
    }
  };

  const saveQuickTransaction = async () => {
    if (!quickResult || quickResult.status !== "ready") return;
    await saveTransaction(quickResult.transaction);
    setQuickMessage("");
    setQuickResult(null);
  };

  const remove = async (transaction: Transaction) => {
    if (!transaction.id || !window.confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    const repository = getFinanceRepository();
    await repository.deleteTransaction(userId, transaction.id);
    if (plan) {
      const currentBalance = plan.currentBalance + (transaction.type === "income" ? -transaction.amount : transaction.amount);
      await repository.savePlan(userId, { currentBalance });
    }
    await onSaved();
  };

  return (
    <div className={showRecentTransactions ? "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)]" : undefined}>
      <form onSubmit={submit} className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Nhập giao dịch</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Ghi nhận khoản thu và chi ngay cả khi bạn chưa lập kế hoạch.</p>
          </div>
          <span className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary">edit_note</span>
        </div>

        <section className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4" aria-label="Nhập nhanh bằng AI">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-primary">auto_awesome</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-on-surface">Nhập nhanh bằng AI</h3>
              <p className="mt-1 text-xs text-on-surface-variant">Ví dụ: “tôi tiêu 20k ăn bánh mì hôm nay”. Kavi chỉ tạo bản nháp, bạn luôn xác nhận trước khi lưu.</p>
              <div className="mt-3 flex gap-2">
                <input value={quickMessage} onChange={(event) => setQuickMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void parseQuickTransaction(); } }} placeholder="Mô tả khoản thu hoặc chi..." className="min-w-0 flex-1 rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />
                <button type="button" onClick={() => void parseQuickTransaction()} disabled={!quickMessage.trim() || isParsingQuick} className="rounded-xl bg-primary px-3 text-on-primary disabled:opacity-50" aria-label="Phân tích giao dịch bằng AI">
                  <span className="material-symbols-outlined">{isParsingQuick ? "progress_activity" : "arrow_forward"}</span>
                </button>
              </div>
              {quickError && <p role="alert" className="mt-2 text-sm text-error">{quickError}</p>}
              {quickResult?.status === "needs_clarification" && <p role="status" className="mt-2 text-sm text-on-surface-variant">{quickResult.question}</p>}
              {quickResult?.status === "ready" && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-surface p-3"><p className="text-sm font-medium text-on-surface"><span className={quickResult.transaction.type === "income" ? "text-success" : "text-error"}>{quickResult.transaction.type === "income" ? "Thu" : "Chi"} {formatVnd(quickResult.transaction.amount)}₫</span> · {quickResult.transaction.category} · {new Date(quickResult.transaction.date).toLocaleDateString("vi-VN")}<span className="block text-xs font-normal text-on-surface-variant">{quickResult.transaction.note}</span></p><button type="button" onClick={() => void saveQuickTransaction()} disabled={isSaving} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary disabled:opacity-50">Lưu giao dịch</button></div>}
            </div>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-surface-container p-1">
          <button type="button" onClick={() => selectType("expense")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${type === "expense" ? "bg-error text-white shadow-sm" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined mr-1 align-middle text-base">arrow_downward</span> Khoản chi
          </button>
          <button type="button" onClick={() => selectType("income")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${type === "income" ? "bg-success text-white shadow-sm" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined mr-1 align-middle text-base">arrow_upward</span> Khoản thu
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-on-surface">Ngày
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary" />
          </label>
          <label className="text-sm font-bold text-on-surface">Số tiền
            <div className="relative mt-2 flex items-center rounded-xl border border-outline-variant/50 bg-surface px-3 focus-within:border-primary">
              <MoneyInput value={amount} onChange={setAmount} className="w-full bg-transparent py-2.5 font-bold text-on-surface outline-none" placeholder="0" />
              <span className="text-sm font-bold text-on-surface-variant">₫</span>
            </div>
          </label>
        </div>

        <label className="mt-5 block text-sm font-bold text-on-surface">Ghi chú
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: ăn trưa với bạn" className="mt-2 w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none placeholder:text-outline focus:border-primary" />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-on-surface">Danh mục</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${category === item ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"}`}>{item}</button>)}
          </div>
        </fieldset>

        <button type="submit" disabled={amount <= 0 || isSaving} className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-50">
          {isSaving ? "Đang lưu..." : `Lưu ${type === "income" ? "khoản thu" : "khoản chi"}`}
        </button>
      </form>

      {showRecentTransactions && <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-on-surface">Giao dịch gần đây</h2><p className="mt-1 text-sm text-on-surface-variant">{transactions.length} giao dịch đã ghi nhận</p></div>
          <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
        </div>
        <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
          {transactions.map((transaction) => <article key={transaction.id ?? `${transaction.date}-${transaction.category}`} className="flex items-center gap-3 rounded-xl border border-outline-variant/20 p-3">
            <span className={`material-symbols-outlined rounded-full p-2 ${transaction.type === "income" ? "bg-success/15 text-success" : "bg-error/10 text-error"}`}>{transaction.type === "income" ? "arrow_upward" : "arrow_downward"}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-bold text-on-surface">{transaction.category}</p><p className="truncate text-xs text-on-surface-variant">{new Date(transaction.date).toLocaleDateString("vi-VN")}{transaction.note ? ` · ${transaction.note}` : ""}</p></div>
            <div className="text-right"><p className={`font-bold ${transaction.type === "income" ? "text-success" : "text-error"}`}>{transaction.type === "income" ? "+" : "-"}{formatVnd(transaction.amount)} ₫</p><button type="button" onClick={() => void remove(transaction)} className="mt-1 text-xs font-medium text-on-surface-variant hover:text-error">Xóa</button></div>
          </article>)}
          {transactions.length === 0 && <p className="rounded-xl border border-dashed border-outline-variant/50 px-4 py-10 text-center text-sm text-on-surface-variant">Chưa có giao dịch nào. Hãy bắt đầu với khoản đầu tiên của bạn.</p>}
        </div>
      </section>}
    </div>
  );
}
