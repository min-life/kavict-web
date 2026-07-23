"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import { AnimatedCounter, AnimatedProgressRing } from "./components/SharedUI";
import { FinancialOverview } from "./components/FinancialOverview";
import TransactionEntryTab from "./finance-management/components/TransactionEntryTab";

export default function DashboardHome() {
  const [currentDate] = useState(() => {
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("vi-VN", dateOptions);
  });
  const { user } = useAuth();
  const userName = user?.displayName || "Người dùng";
  const [loadedFinance, setLoadedFinance] = useState<{
    userId: string;
    plan: FinancialPlan | null;
    transactions: Transaction[];
  } | null>(null);

  const readFinance = useCallback(async () => {
    if (!user) return null;

    try {
      const repository = getFinanceRepository();
      const [plan, transactions] = await Promise.all([
        repository.getPlan(user.uid),
        repository.getTransactions(user.uid),
      ]);
      return { userId: user.uid, plan, transactions };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { userId: user.uid, plan: null, transactions: [] };
    }
  }, [user]);

  const refreshFinance = useCallback(async () => {
    setLoadedFinance(await readFinance());
  }, [readFinance]);

  useEffect(() => {
    let active = true;
    void readFinance().then((finance) => {
      if (active) setLoadedFinance(finance);
    });
    return () => { active = false; };
  }, [readFinance]);

  const financeMatchesUser = Boolean(user && loadedFinance?.userId === user.uid);
  const plan = financeMatchesUser ? loadedFinance?.plan ?? null : null;
  const transactions = financeMatchesUser ? loadedFinance?.transactions ?? [] : [];
  const isLoading = !financeMatchesUser;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".fade-in").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="mb-lg fade-in">
        <div className="flex flex-col justify-between gap-sm md:flex-row md:items-end">
          <div>
            <h1 className="mb-xs font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">Xin chào, {userName} 👋</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Tiếp tục hành trình làm chủ tài chính của bạn.</p>
          </div>
          <div className="inline-flex items-center gap-xs rounded-full bg-surface-container px-sm py-xs font-label-md text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span id="current-date">{currentDate}</span>
          </div>
        </div>
      </header>

      <div className="mb-lg grid grid-cols-1 gap-gutter lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="fade-in delay-100">
          {isLoading || !user ? (
            <LoadingCard />
          ) : (
            <TransactionEntryTab
              userId={user.uid}
              plan={plan}
              transactions={transactions}
              onSaved={refreshFinance}
              showRecentTransactions={false}
            />
          )}
        </section>

        <section className="fade-in delay-200">
          {isLoading ? (
            <LoadingCard />
          ) : plan ? (
            <FinancialOverview
              plan={plan}
              transactions={transactions}
              title="Thống kê"
              titleAction={
                <Link href="/dashboard/finance-management" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-label-sm text-label-sm text-on-primary transition-colors hover:bg-primary-fixed-variant">
                  Quản lý tài chính
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              }
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-surface-variant bg-surface-container-lowest p-md text-center shadow-ambient">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[40px]">savings</span>
              </div>
              <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">Chưa có kế hoạch tài chính</h2>
              <p className="mb-8 max-w-[300px] text-on-surface-variant">Lập kế hoạch ngay hôm nay để KAVICT AI đồng hành cùng bạn trên con đường tự do tài chính.</p>
              <Link href="/dashboard/finance-management" className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-fixed-variant">
                Lập kế hoạch tài chính
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <section className="flex flex-col rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-ambient fade-in delay-300 lg:col-span-4">
          <div className="mb-md flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface">Nhiệm vụ tuần</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/learning" className="group flex items-center justify-between rounded-xl border border-surface-variant bg-surface p-3 transition-colors hover:border-primary-fixed-dim">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success"><span className="material-symbols-outlined text-[20px]">check</span></div>
                <div><div className="text-sm font-bold text-on-surface-variant line-through transition-colors group-hover:text-primary">Hoàn thành 3 bài học</div><div className="text-xs font-medium text-success">Đã nhận 150 XP</div></div>
              </div>
            </Link>
            <Link href="/dashboard/learning" className="group flex items-center justify-between rounded-xl border border-surface-variant bg-surface p-3 transition-colors hover:border-primary-fixed-dim">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">menu_book</span></div>
                <div><div className="text-sm font-bold text-on-surface transition-colors group-hover:text-primary">Đọc 1 bài báo tài chính</div><div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-1.5 rounded-full bg-primary" style={{ width: "0%" }} /></div></div>
              </div>
              <div className="text-sm font-bold text-primary">+50 XP</div>
            </Link>
            <Link href="/dashboard/finance-management" className="group flex items-center justify-between rounded-xl border border-surface-variant bg-surface p-3 transition-colors hover:border-primary-fixed-dim">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">savings</span></div>
                <div><div className="text-sm font-bold text-on-surface transition-colors group-hover:text-primary">Cập nhật chi tiêu 5 ngày</div><div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-1.5 rounded-full bg-primary" style={{ width: "40%" }} /></div></div>
              </div>
              <div className="text-sm font-bold text-primary">+100 XP</div>
            </Link>
          </div>
        </section>

        <section className="flex h-full flex-col items-center rounded-2xl border border-surface-variant bg-surface-container-lowest p-md text-center shadow-ambient transition-shadow duration-300 hover:shadow-hover fade-in delay-400 lg:col-span-4">
          <h2 className="mb-md w-full self-start text-left font-headline-md text-headline-md text-on-surface">Học tập</h2>
          <div className="mb-sm flex items-center gap-2 font-display text-display text-on-surface"><span>🔥</span><span className="font-display text-display"><AnimatedCounter target={15} /></span><span className="font-headline-md text-headline-md text-on-surface-variant">ngày</span></div>
          <div className="relative mb-lg h-40 w-40"><AnimatedProgressRing percent={80} /><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-headline-md text-headline-md text-on-surface">4/5</span><span className="font-label-sm text-label-sm text-on-surface-variant">ngày/tuần</span></div></div>
          <div className="mb-lg grid w-full grid-cols-3 gap-xs">
            <LearningMetric icon="📚" value={<AnimatedCounter target={28} />} label="bài học" />
            <LearningMetric icon="⏱" value={<AnimatedCounter target={16} suffix="h" />} label="thời gian" bordered />
            <LearningMetric icon="🏅" value="Tập sự" label="hạng" />
          </div>
          <Link href="/dashboard/learning" className="mt-auto flex h-12 w-full items-center justify-center gap-sm rounded-lg bg-primary font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-fixed-variant">Tiếp tục học<span className="material-symbols-outlined">arrow_forward</span></Link>
        </section>

        <section className="flex flex-col rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-ambient fade-in delay-500 lg:col-span-4">
          <div className="mb-md flex items-center justify-between"><h2 className="font-headline-md text-headline-md text-on-surface">Practice Space</h2></div>
          <div className="flex flex-grow flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined text-[40px]">target</span></div>
            <div><h3 className="font-bold text-on-surface">Thử thách Tài chính</h3><p className="mt-1 text-sm text-on-surface-variant">Luyện tập kiến thức tài chính và nhận thêm XP.</p></div>
            <Link href="/dashboard/practice-space" className="mt-2 inline-block rounded-full bg-primary px-6 py-2.5 font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-fixed-variant">Luyện tập ngay</Link>
          </div>
        </section>
      </div>
    </>
  );
}

function LoadingCard() {
  return <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-ambient"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
}

function LearningMetric({ icon, value, label, bordered = false }: { icon: string; value: React.ReactNode; label: string; bordered?: boolean }) {
  return <div className={`flex flex-col items-center ${bordered ? "border-x border-surface-variant" : ""}`}><span className="mb-1 text-[20px]">{icon}</span><span className="font-label-md text-label-md font-bold text-on-surface">{value}</span><span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span></div>;
}
