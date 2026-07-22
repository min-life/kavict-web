"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FinancialPlan } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import OnboardingPlanner from "./components/OnboardingPlanner";
import FinancialDashboard from "./components/FinancialDashboard";

export default function AIAssistantPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        getFinanceRepository().getPlan(user.uid).then((p) => {
          setPlan(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">lock</span>
        <h2 className="text-xl font-bold mb-2">Yêu cầu Đăng nhập</h2>
        <p className="text-on-surface-variant">Bạn cần đăng nhập để sử dụng Trợ lý Tài chính AI.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md h-full min-h-[calc(100vh-80px)]">
      {!plan || isEditingPlan ? (
        <OnboardingPlanner onPlanCreated={(p) => { setPlan(p); setIsEditingPlan(false); }} initialPlan={plan || undefined} />
      ) : (
        <FinancialDashboard plan={plan} onEditPlan={() => setIsEditingPlan(true)} />
      )}
    </div>
  );
}
