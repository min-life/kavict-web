"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import { getBudgetProgress } from "@/features/finance/workspace";
import KaviAdvisorTab from "./KaviAdvisorTab";
import PlanBudgetTab from "./PlanBudgetTab";
import ReportsTab from "./ReportsTab";
import TransactionEntryTab from "./TransactionEntryTab";

const TABS = [
  { id: "entry", label: "Nhập liệu", icon: "edit_note" },
  { id: "plan", label: "Kế hoạch & Ngân sách", icon: "account_balance_wallet" },
  { id: "reports", label: "Thống kê và Báo cáo", icon: "bar_chart" },
  { id: "advisor", label: "Kavi Advisor", icon: "smart_toy" },
] as const;
type TabId = (typeof TABS)[number]["id"];
export type AdvisorLaunchRequest = {
  id: number;
  useCase: "financial-planning" | "plan-adjustment";
  prompt: string;
} | null;

const PLAN_ADVISOR_PROMPTS = {
  "financial-planning": "Hãy giúp tôi lập kế hoạch chi tiêu, kế hoạch kiếm thêm thu nhập và các objective phù hợp với dữ liệu tài chính hiện tại của tôi.",
  "plan-adjustment": "Tôi cần chỉnh sửa kế hoạch chi tiêu, kế hoạch kiếm thêm thu nhập hoặc objective vì tình hình tài chính của tôi đã thay đổi.",
} as const;

export default function FinanceWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("entry");
  const [advisorLaunchRequest, setAdvisorLaunchRequest] = useState<AdvisorLaunchRequest>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [currentMonthTimestamp] = useState(() => Date.now());

  const readFinance = useCallback(async () => {
    if (!user) return { plan: null, transactions: [] as Transaction[] };
    try {
      const repository = getFinanceRepository();
      const [loadedPlan, loadedTransactions] = await Promise.all([repository.getPlan(user.uid), repository.getTransactions(user.uid)]);
      return { plan: loadedPlan, transactions: loadedTransactions };
    } catch (error) { console.error("Could not load finance workspace", error); return { plan: null, transactions: [] as Transaction[] }; }
  }, [user]);

  const refreshFinance = useCallback(async () => {
    setIsLoading(true);
    const loaded = await readFinance();
    setPlan(loaded.plan);
    setTransactions(loaded.transactions);
    setIsLoading(false);
  }, [readFinance]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const loaded = await readFinance();
      if (!active) return;
      setPlan(loaded.plan);
      setTransactions(loaded.transactions);
      setIsLoading(false);
    };
    void load();
    return () => { active = false; };
  }, [readFinance]);

  const alerts = useMemo(() => getBudgetProgress(plan, transactions, currentMonthTimestamp).categories.filter((item) => item.status !== "on-track"), [currentMonthTimestamp, plan, transactions]);
  const handleSaved = async () => { setDismissedAlerts([]); await refreshFinance(); };
  const applyPlan = async (nextPlan: FinancialPlan) => { setDismissedAlerts([]); setPlan(nextPlan); await refreshFinance(); setActiveTab("plan"); };
  const openAdvisor = (useCase: "financial-planning" | "plan-adjustment") => {
    setAdvisorLaunchRequest((current) => ({ id: (current?.id ?? 0) + 1, useCase, prompt: PLAN_ADVISOR_PROMPTS[useCase] }));
    setActiveTab("advisor");
  };
  const consumeAdvisorLaunchRequest = useCallback(() => {
    setAdvisorLaunchRequest(null);
  }, []);

  if (authLoading || isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!user) return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><span className="material-symbols-outlined text-[64px] text-outline-variant">lock</span><h2 className="mt-4 text-xl font-bold text-on-surface">Yêu cầu đăng nhập</h2><p className="mt-2 text-on-surface-variant">Bạn cần đăng nhập để quản lý tài chính cá nhân.</p></div>;

  return <div className="min-h-[calc(100vh-80px)] space-y-6"><header><h1 className="text-2xl font-bold text-on-surface sm:text-3xl">Quản lý tài chính</h1><p className="mt-2 text-on-surface-variant">Chủ động ghi nhận, lập ngân sách và nhận tư vấn phù hợp với bạn.</p></header>{alerts.filter((item) => !dismissedAlerts.includes(item.category)).map((item) => <div key={item.category} className={`flex items-center gap-3 rounded-xl border p-4 ${item.status === "over-budget" ? "border-error/30 bg-error/10" : "border-orange-500/30 bg-orange-500/10"}`}><span className="material-symbols-outlined text-error">warning</span><p className="flex-1 text-sm text-on-surface">{item.status === "over-budget" ? `${item.category} đã vượt ngân sách` : `${item.category} sắp chạm hạn mức`} ({item.percent}%).</p><button onClick={() => setDismissedAlerts((current) => [...current, item.category])} className="text-sm font-bold text-on-surface-variant">Đóng</button></div>)}<div role="tablist" aria-label="Quản lý tài chính" className="grid grid-cols-2 gap-2 rounded-2xl border border-outline-variant/30 bg-surface p-2 lg:grid-cols-4">{TABS.map((tab) => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${activeTab === tab.id ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"}`}><span className="material-symbols-outlined text-lg">{tab.icon}</span>{tab.label}</button>)}</div><div role="tabpanel">{activeTab === "entry" && <TransactionEntryTab userId={user.uid} plan={plan} transactions={transactions} onSaved={handleSaved} />}{activeTab === "plan" && <PlanBudgetTab userId={user.uid} plan={plan} transactions={transactions} onSaved={handleSaved} onOpenAdvisor={openAdvisor} />}{activeTab === "reports" && <ReportsTab plan={plan} transactions={transactions} />}{activeTab === "advisor" && <KaviAdvisorTab userId={user.uid} plan={plan} transactions={transactions} onPlanApplied={applyPlan} launchRequest={advisorLaunchRequest} onLaunchRequestConsumed={consumeAdvisorLaunchRequest} />}</div></div>;
}
