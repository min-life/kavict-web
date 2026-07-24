"use client";

import { useState } from "react";
import type { FinancialPlan } from "@/features/finance/domain";
import type { BudgetProgressItem } from "@/features/finance/workspace";
import IconPicker from "./IconPicker";

type EditableBudget = { category: string; amount: number; icon?: string; color?: string };
export type SpendingPlanDraft = Pick<FinancialPlan, "monthlyIncome" | "budgets">;
type SpendingPlanSectionProps = {
  plan: FinancialPlan | null;
  categories: BudgetProgressItem[];
  onSave: (draft: SpendingPlanDraft) => Promise<void>;
};

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatBudgetPercentage(item: BudgetProgressItem) {
  return item.budget === 0 && item.spent > 0 ? "∞%" : `${item.percent}%`;
}

export function sanitizeSpendingPlanDraft(monthlyIncome: number, budgets: EditableBudget[]): SpendingPlanDraft {
  return {
    monthlyIncome: Number.isFinite(monthlyIncome) && monthlyIncome >= 0 ? monthlyIncome : 0,
    budgets: budgets
      .map((budget) => ({ ...budget, category: budget.category.trim() }))
      .filter((budget) => budget.category && Number.isFinite(budget.amount) && budget.amount >= 0),
  };
}

export default function SpendingPlanSection({ plan, categories, onSave }: SpendingPlanSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftMonthlyIncome, setDraftMonthlyIncome] = useState(plan?.monthlyIncome ?? 0);
  const [draftBudgets, setDraftBudgets] = useState<EditableBudget[]>(plan?.budgets ?? []);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setDraftMonthlyIncome(plan?.monthlyIncome ?? 0);
    setDraftBudgets(plan?.budgets ?? []);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftMonthlyIncome(plan?.monthlyIncome ?? 0);
    setDraftBudgets(plan?.budgets ?? []);
    setIsEditing(false);
  };

  const updateBudget = (index: number, updates: Partial<EditableBudget>) => setDraftBudgets((current) => current.map((budget, itemIndex) => itemIndex === index ? { ...budget, ...updates } : budget));

  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(sanitizeSpendingPlanDraft(draftMonthlyIncome, draftBudgets));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-lg font-bold text-on-surface">Kế hoạch chi tiêu</h3><p className="mt-1 text-sm text-on-surface-variant">Theo dõi theo danh mục trong tháng đang chọn.</p></div>
        {!isEditing && <button type="button" onClick={startEditing} className="rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10">Chỉnh sửa kế hoạch</button>}
      </div>

      {isEditing && <label className="mt-5 block text-sm font-bold text-on-surface">Thu nhập dự kiến mỗi tháng<input type="number" min="0" value={draftMonthlyIncome || ""} onChange={(event) => setDraftMonthlyIncome(Number(event.target.value))} className="mt-2 block w-full rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary sm:w-64" /></label>}
      <div className="mt-5 space-y-3">
        {isEditing ? draftBudgets.map((budget, index) => <div key={`${budget.category}-${index}`} className="rounded-xl border border-outline-variant/30 p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"><input value={budget.category} onChange={(event) => updateBudget(index, { category: event.target.value })} placeholder="Tên danh mục" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><input type="number" min="0" value={budget.amount || ""} onChange={(event) => updateBudget(index, { amount: Number(event.target.value) })} placeholder="Ngân sách" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><button type="button" onClick={() => setDraftBudgets((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg px-3 py-2 text-sm font-bold text-error hover:bg-error/10">Xóa</button></div><div className="mt-3"><IconPicker currentIcon={budget.icon} currentColor={budget.color} onSelect={({ icon, color }) => updateBudget(index, { icon, color })}><button type="button" className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold text-on-surface-variant hover:bg-surface-container"><span className={`material-symbols-outlined ${budget.color ?? "text-primary"}`}>{budget.icon ?? "category"}</span>Chọn biểu tượng</button></IconPicker></div></div>) : categories.map((item) => {
          const tone = item.percent > 100 ? "error" : item.percent >= 90 ? "warning" : "success";
          const width = Math.min(item.percent, 100);
          const toneClass = tone === "error" ? "bg-error" : tone === "warning" ? "bg-yellow-500" : "bg-success";
          const textClass = tone === "error" ? "text-error" : tone === "warning" ? "text-yellow-700" : "text-success";
          const sourceBudget = plan?.budgets.find((budget) => budget.category === item.category);
          return <div key={item.category} className="rounded-xl border border-outline-variant/30 p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`material-symbols-outlined rounded-lg bg-surface-container p-2 ${sourceBudget?.color ?? "text-primary"}`}>{sourceBudget?.icon ?? "category"}</span><div className="min-w-0"><p className="truncate font-bold text-on-surface">{item.category}</p><p className="mt-1 text-sm text-on-surface-variant">{formatVnd(item.spent)} / {formatVnd(item.budget)} ₫</p></div></div><span className={`shrink-0 text-sm font-bold ${textClass}`}>{formatBudgetPercentage(item)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className={`h-full rounded-full ${toneClass}`} style={{ width: `${width}%` }} /></div></div>;
        })}
        {((isEditing && draftBudgets.length === 0) || (!isEditing && categories.length === 0)) && <p className="rounded-xl border border-dashed border-outline-variant/50 px-4 py-8 text-center text-sm text-on-surface-variant">Chưa có danh mục. Hãy tạo kế hoạch để bắt đầu theo dõi.</p>}
      </div>

      {isEditing && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setDraftBudgets((current) => [...current, { category: "", amount: 0, icon: "category", color: "text-primary" }])} className="rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10">Thêm danh mục</button><button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu kế hoạch"}</button><button type="button" onClick={cancelEditing} disabled={isSaving} className="rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button></div>}
    </section>
  );
}
