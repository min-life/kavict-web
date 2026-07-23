"use client";

import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { FinancialOverview } from "@/app/dashboard/components/FinancialOverview";

type ReportsTabProps = { plan: FinancialPlan | null; transactions: Transaction[] };

const EMPTY_PLAN: FinancialPlan = { currentBalance: 0, monthlyIncome: 0, fixedExpenses: [], goals: [], budgets: [], createdAt: 0, updatedAt: 0 };

export default function ReportsTab({ plan, transactions }: ReportsTabProps) {
  return <div className="space-y-5"><div className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm"><h2 className="text-xl font-bold text-on-surface">Thống kê và Báo cáo</h2><p className="mt-1 text-sm text-on-surface-variant">Xem xu hướng thu – chi của bạn theo tháng hoặc năm.</p>{transactions.length === 0 && <p className="mt-4 rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">Chưa có giao dịch trong báo cáo. Hãy nhập khoản thu hoặc chi ở tab Nhập liệu để xem biểu đồ.</p>}</div><FinancialOverview plan={plan ?? EMPTY_PLAN} transactions={transactions} /></div>;
}
