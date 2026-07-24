"use client";

import { useEffect, useMemo, useState } from "react";
import type { FinancialPlan, IncomePlan, Objective, Transaction } from "@/features/finance/domain";
import { createObjectivePersistenceQueue } from "@/features/finance/objectivePersistence";
import { getFinanceRepository } from "@/features/finance/provider";
import { getBudgetProgress, getIncomePlanProgress, getPlanStatusSummary } from "@/features/finance/workspace";
import PlanBudgetSummary from "./PlanBudgetSummary";
import SpendingPlanSection from "./SpendingPlanSection";
import type { SpendingPlanDraft } from "./SpendingPlanSection";
import IncomePlanSection from "./IncomePlanSection";
import ObjectivesSection from "./ObjectivesSection";
import { createPlanPersistenceQueue } from "./planPersistence";

type PlanBudgetTabProps = {
  userId: string;
  plan: FinancialPlan | null;
  transactions: Transaction[];
  onSaved: () => Promise<void>;
  onOpenAdvisor: (intent: "financial-planning" | "plan-adjustment") => void;
};

export default function PlanBudgetTab({ userId, plan, transactions, onSaved, onOpenAdvisor }: PlanBudgetTabProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const monthTimestamp = useMemo(() => new Date(`${selectedMonth}-01T12:00:00`).getTime(), [selectedMonth]);
  const budgetProgress = useMemo(() => getBudgetProgress(plan, transactions, monthTimestamp), [monthTimestamp, plan, transactions]);
  const incomeProgress = useMemo(() => getIncomePlanProgress(plan, transactions, monthTimestamp), [monthTimestamp, plan, transactions]);
  const statusSummary = useMemo(() => getPlanStatusSummary(plan, transactions, monthTimestamp), [monthTimestamp, plan, transactions]);
  const [planPersistenceQueue] = useState(() => createPlanPersistenceQueue(plan));
  const [objectivePersistenceQueue] = useState(() => createObjectivePersistenceQueue(plan?.objectives ?? []));

  useEffect(() => { planPersistenceQueue.acceptRemote(plan); }, [planPersistenceQueue, plan]);
  useEffect(() => { objectivePersistenceQueue.acceptRemote(plan?.objectives ?? []); }, [objectivePersistenceQueue, plan]);

  const persistPlanUpdate = (update: (currentPlan: FinancialPlan) => FinancialPlan) => {
    return planPersistenceQueue.enqueue(update, (nextPlan) => getFinanceRepository().savePlan(userId, nextPlan));
  };

  const saveSpendingPlan = async ({ monthlyIncome, budgets }: SpendingPlanDraft) => {
    await persistPlanUpdate((currentPlan) => ({ ...currentPlan, monthlyIncome, budgets, updatedAt: Date.now() }));
    await onSaved();
  };

  const saveIncomePlans = async (incomePlans: IncomePlan[]) => {
    await persistPlanUpdate((currentPlan) => ({ ...currentPlan, incomePlans, updatedAt: Date.now() }));
    await onSaved();
  };

  const persistObjectives = async (objectives: Objective[]) => {
    await persistPlanUpdate((currentPlan) => ({ ...currentPlan, objectives, updatedAt: Date.now() }));
  };

  const saveObjectives = async (objectives: Objective[]) => {
    await persistObjectives(objectives);
    objectivePersistenceQueue.acceptRemote(objectives);
    await onSaved();
  };

  const toggleObjective = (id: string, isCompleted: boolean) => {
    return objectivePersistenceQueue.enqueueToggle(id, isCompleted, persistObjectives, onSaved);
  };

  return <div className="space-y-6">
    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-on-surface">Kế hoạch & Ngân sách</h2><p className="mt-1 text-sm text-on-surface-variant">Thiết lập hạn mức theo tháng và theo dõi tiến độ chi tiêu.</p></div><label className="text-sm font-bold text-on-surface">Tháng<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="ml-3 rounded-xl border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /></label></div>
      <div className="mt-6"><PlanBudgetSummary progress={budgetProgress} statusSummary={statusSummary} /></div>
      <p className="sr-only">Đã theo dõi {incomeProgress.length} kế hoạch thu nhập.</p>
    </section>
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined rounded-xl bg-primary/10 p-2 text-primary" aria-hidden="true">auto_awesome</span>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Kavi Advisor</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Nhận gợi ý để lập mới hoặc điều chỉnh kế hoạch tài chính của bạn.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onOpenAdvisor("financial-planning")} className="group flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <span className="material-symbols-outlined rounded-full bg-primary/10 p-3 text-2xl text-primary" aria-hidden="true">track_changes</span>
          <span className="min-w-0 flex-1"><span className="block font-bold text-on-surface">Lập kế hoạch tài chính cho bạn</span><span className="mt-1 block text-sm font-normal text-on-surface-variant">Xây dựng kế hoạch phù hợp với thu nhập, mục tiêu và thời hạn của bạn.</span></span>
          <span className="material-symbols-outlined text-on-surface-variant transition group-hover:translate-x-0.5" aria-hidden="true">chevron_right</span>
        </button>
        <button type="button" onClick={() => onOpenAdvisor("plan-adjustment")} className="group flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <span className="material-symbols-outlined rounded-full bg-amber-500/10 p-3 text-2xl text-amber-600" aria-hidden="true">edit_note</span>
          <span className="min-w-0 flex-1"><span className="block font-bold text-on-surface">Chỉnh sửa plan theo thay đổi của bạn</span><span className="mt-1 block text-sm font-normal text-on-surface-variant">Cập nhật kế hoạch khi thu nhập, mục tiêu hoặc ưu tiên thay đổi.</span></span>
          <span className="material-symbols-outlined text-on-surface-variant transition group-hover:translate-x-0.5" aria-hidden="true">chevron_right</span>
        </button>
      </div>
    </section>
    <SpendingPlanSection plan={plan} categories={budgetProgress.categories} onSave={saveSpendingPlan} />
    <IncomePlanSection incomePlans={plan?.incomePlans ?? []} progress={incomeProgress} onSave={saveIncomePlans} />
    <ObjectivesSection objectives={plan?.objectives ?? []} onSave={saveObjectives} onToggleComplete={toggleObjective} />
  </div>;
}
