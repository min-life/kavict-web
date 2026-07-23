"use client";

import { useMemo, useState } from "react";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import { getBudgetProgress } from "@/features/finance/workspace";

type PlanBudgetTabProps = { userId: string; plan: FinancialPlan | null; transactions: Transaction[]; onSaved: () => Promise<void> };
type EditableBudget = { category: string; amount: number; icon?: string; color?: string };
const formatVnd = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);

function makeBasePlan(plan: FinancialPlan | null): FinancialPlan {
  return plan ?? { currentBalance: 0, monthlyIncome: 0, fixedExpenses: [], goals: [], budgets: [], createdAt: Date.now(), updatedAt: Date.now() };
}

export default function PlanBudgetTab({ userId, plan, transactions, onSaved }: PlanBudgetTabProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [monthlyIncome, setMonthlyIncome] = useState(plan?.monthlyIncome ?? 0);
  const [budgets, setBudgets] = useState<EditableBudget[]>(plan?.budgets ?? []);
  const [isSaving, setIsSaving] = useState(false);

  const monthTimestamp = new Date(`${selectedMonth}-01T12:00:00`).getTime();
  const draftPlan = useMemo(() => ({ ...makeBasePlan(plan), monthlyIncome, budgets }), [budgets, monthlyIncome, plan]);
  const progress = useMemo(() => getBudgetProgress(draftPlan, transactions, monthTimestamp), [draftPlan, monthTimestamp, transactions]);
  const remaining = progress.allocated - progress.expense;

  const updateBudget = (index: number, updates: Partial<EditableBudget>) => setBudgets((current) => current.map((budget, itemIndex) => itemIndex === index ? { ...budget, ...updates } : budget));

  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const nextPlan = { ...draftPlan, budgets: budgets.filter((budget) => budget.category.trim() && budget.amount >= 0), updatedAt: Date.now() };
      await getFinanceRepository().savePlan(userId, nextPlan);
      await onSaved();
    } finally { setIsSaving(false); }
  };

  return <div className="space-y-6">
    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-on-surface">Kế hoạch & Ngân sách</h2><p className="mt-1 text-sm text-on-surface-variant">Thiết lập hạn mức theo tháng và theo dõi tiến độ chi tiêu.</p></div><label className="text-sm font-bold text-on-surface">Tháng<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="ml-3 rounded-xl border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /></label></div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-primary/10 p-4"><p className="text-sm text-on-surface-variant">Đã phân bổ</p><p className="mt-1 text-xl font-bold text-primary">{formatVnd(progress.allocated)} ₫</p></div><div className="rounded-xl bg-surface-container p-4"><p className="text-sm text-on-surface-variant">Đã chi trong tháng</p><p className="mt-1 text-xl font-bold text-on-surface">{formatVnd(progress.expense)} ₫</p></div><div className={`rounded-xl p-4 ${remaining < 0 ? "bg-error/10" : "bg-success/10"}`}><p className="text-sm text-on-surface-variant">Còn lại</p><p className={`mt-1 text-xl font-bold ${remaining < 0 ? "text-error" : "text-success"}`}>{formatVnd(remaining)} ₫</p></div></div>
    </section>

    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><label className="text-sm font-bold text-on-surface">Thu nhập tháng<input type="number" min="0" value={monthlyIncome || ""} onChange={(event) => setMonthlyIncome(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary sm:w-64" /></label><button type="button" onClick={() => setBudgets((current) => [...current, { category: "", amount: 0, icon: "category", color: "text-primary" }])} className="rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"><span className="material-symbols-outlined mr-1 align-middle text-base">add</span>Thêm danh mục</button></div>
      <div className="mt-5 space-y-3">{budgets.map((budget, index) => { const status = progress.categories.find((item) => item.category === budget.category); const width = Math.min(status?.percent ?? 0, 100); const barClass = status?.status === "over-budget" ? "bg-error" : status?.status === "near-limit" ? "bg-orange-500" : "bg-primary"; return <div key={`${budget.category}-${index}`} className="rounded-xl border border-outline-variant/30 p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"><input value={budget.category} onChange={(event) => updateBudget(index, { category: event.target.value })} placeholder="Tên danh mục" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><input type="number" min="0" value={budget.amount || ""} onChange={(event) => updateBudget(index, { amount: Number(event.target.value) })} placeholder="Ngân sách" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><button type="button" onClick={() => setBudgets((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg px-3 py-2 text-sm font-bold text-error hover:bg-error/10">Xóa</button></div><div className="mt-3 flex justify-between text-sm"><span className="text-on-surface-variant">{formatVnd(status?.spent ?? 0)} / {formatVnd(budget.amount)} ₫</span><span className={`font-bold ${status?.status === "over-budget" ? "text-error" : status?.status === "near-limit" ? "text-orange-500" : "text-success"}`}>{status?.status === "over-budget" ? "Đã vượt ngân sách" : status?.status === "near-limit" ? "Sắp chạm hạn mức" : "Đúng tiến độ"}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className={`h-full rounded-full ${barClass}`} style={{ width: `${width}%` }} /></div></div>; })}{budgets.length === 0 && <p className="rounded-xl border border-dashed border-outline-variant/50 px-4 py-8 text-center text-sm text-on-surface-variant">Chưa có danh mục. Thêm ngân sách đầu tiên để bắt đầu theo dõi.</p>}</div>
      <button type="button" onClick={() => void save()} disabled={isSaving} className="mt-6 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary shadow-sm hover:bg-primary-fixed-variant disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu kế hoạch & ngân sách"}</button>
    </section>
  </div>;
}
