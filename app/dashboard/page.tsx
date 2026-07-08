"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { useAuth } from "@/contexts/AuthContext";

import { FinancialPlan, Transaction } from "@/lib/financeTypes";
import { getFinancialPlan, getTransactions } from "@/lib/financeStore";
import { AnimatedCounter, AnimatedProgressBar, AnimatedProgressRing } from "./components/SharedUI";
import { FinancialOverview } from "./components/FinancialOverview";

export default function DashboardHome() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [currentDate, setCurrentDate] = useState("");
  const { user } = useAuth();
  const userName = user?.displayName || "Người dùng";

  useEffect(() => {
    // Set Current Date
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('vi-VN', dateOptions));
  }, []);

  const [plan, setPlan] = useState<FinancialPlan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        getFinancialPlan(user.uid),
        getTransactions(user.uid)
      ]).then(([fetchedPlan, fetchedTransactions]) => {
        setPlan(fetchedPlan);
        setTransactions(fetchedTransactions);
        setIsLoading(false);
      }).catch(err => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>

{/* Top Section: Greeting */}
<header className="mb-lg fade-in">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-sm">
<div>
<h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Xin chào, {userName} 👋</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Tiếp tục hành trình làm chủ tài chính của bạn.</p>
</div>
<div className="text-on-surface-variant font-label-md text-label-md bg-surface-container px-sm py-xs rounded-full inline-flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
<span id="current-date">{currentDate}</span>
</div>
</div>
</header>
{/* Mid Section: Two Columns */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-lg">
{/* Left Card: Tổng quan tài chính (70% -> 8 cols) */}
<div className="lg:col-span-8 flex flex-col h-full relative group">
  {isLoading ? (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md flex flex-col h-full items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  ) : plan ? (
    <FinancialOverview 
      plan={plan} 
      transactions={transactions} 
      titleAction={
        <Link href="/dashboard/ai-assistant" className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
        </Link>
      }
    />
  ) : (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md flex flex-col h-full items-center justify-center min-h-[400px] text-center animate-fade-in">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-[40px]">savings</span>
      </div>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Chưa có kế hoạch tài chính</h2>
      <p className="text-on-surface-variant mb-8 max-w-[300px]">
        Lập kế hoạch ngay hôm nay để KAVICT AI đồng hành cùng bạn trên con đường tự do tài chính.
      </p>
      <Link 
        href="/dashboard/ai-assistant" 
        className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 group"
      >
        Lập kế hoạch tài chính <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </Link>
    </div>
  )}
</div>
{/* Right Card: Chuỗi học tập (30% -> 4 cols) */}
<div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient hover:shadow-hover transition-shadow duration-300 p-md fade-in delay-200 flex flex-col items-center text-center h-full">
<h2 className="font-headline-md text-headline-md text-on-surface self-start w-full text-left mb-md">Chuỗi học tập</h2>
<div className="font-display text-display text-on-surface mb-sm flex items-center gap-2">
<span>🔥</span>
<span className="font-display text-display"><AnimatedCounter target={15} /></span>
<span className="font-headline-md text-headline-md text-on-surface-variant">ngày</span>
</div>
{/* Circular Progress Ring */}
<div className="relative w-40 h-40 mb-lg">
<AnimatedProgressRing percent={80} />
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-headline-md text-headline-md text-on-surface">4/5</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">ngày/tuần</span>
</div>
</div>
{/* Stats */}
<div className="w-full grid grid-cols-3 gap-xs mb-lg">
<div className="flex flex-col items-center">
<span className="text-[20px] mb-1">📚</span>
<span className="font-label-md text-label-md text-on-surface font-bold"><AnimatedCounter target={28} /></span>
<span className="font-label-sm text-label-sm text-on-surface-variant">bài học</span>
</div>
<div className="flex flex-col items-center border-l border-r border-surface-variant">
<span className="text-[20px] mb-1">⏱</span>
<span className="font-label-md text-label-md text-on-surface font-bold"><AnimatedCounter target={16} suffix="h" /></span>
<span className="font-label-sm text-label-sm text-on-surface-variant">thời gian</span>
</div>
<div className="flex flex-col items-center">
<span className="text-[20px] mb-1">🏅</span>
<span className="font-label-md text-label-md text-on-surface font-bold">Tập sự</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">hạng</span>
</div>
</div>
<Link href="/dashboard/learning" className="w-full mt-auto bg-primary text-on-primary h-12 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-sm">
                    Tiếp tục học
                    <span className="material-symbols-outlined">arrow_forward</span>
</Link>
</div>
</div>
{/* Bottom Section: 3 Columns */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
  
  {/* Game Card */}
  <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md flex flex-col fade-in delay-300">
    <div className="flex justify-between items-center mb-md">
      <h2 className="font-headline-md text-headline-md text-on-surface">Trò chơi</h2>
    </div>
    <div className="flex flex-col items-center justify-center flex-grow text-center gap-4 py-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-[40px]">stadia_controller</span>
      </div>
      <div>
        <h3 className="font-bold text-on-surface">Thử thách Tài chính</h3>
        <p className="text-sm text-on-surface-variant mt-1">Chơi game để ôn tập kiến thức và nhận thêm XP.</p>
      </div>
      <Link href="/dashboard/games" className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-fixed-variant transition-colors shadow-sm inline-block">
        Chơi ngay
      </Link>
    </div>
  </div>

  {/* Weekly Missions Card */}
  <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md flex flex-col fade-in delay-400">
    <div className="flex justify-between items-center mb-md">
      <h2 className="font-headline-md text-headline-md text-on-surface">Nhiệm vụ tuần</h2>
    </div>
    <div className="flex flex-col gap-3">
      <Link href="/dashboard/learning" className="flex items-center justify-between p-3 bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">check</span>
          </div>
          <div>
            <div className="font-bold text-sm text-on-surface-variant line-through group-hover:text-primary transition-colors">Hoàn thành 3 bài học</div>
            <div className="text-xs text-success font-medium">Đã nhận 150 XP</div>
          </div>
        </div>
      </Link>
      
      <Link href="/dashboard/learning" className="flex items-center justify-between p-3 bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
          </div>
          <div>
            <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Đọc 1 bài báo tài chính</div>
            <div className="mt-1.5 w-24 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
        <div className="text-sm font-bold text-primary">+50 XP</div>
      </Link>

      <Link href="/dashboard/ai-assistant" className="flex items-center justify-between p-3 bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">savings</span>
          </div>
          <div>
            <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Cập nhật chi tiêu 5 ngày</div>
            <div className="mt-1.5 w-24 bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>
        <div className="text-sm font-bold text-primary">+100 XP</div>
      </Link>
    </div>
  </div>

  {/* Leaderboard Card */}
  <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md flex flex-col fade-in delay-500">
    <div className="flex justify-between items-center mb-md">
      <h2 className="font-headline-md text-headline-md text-on-surface">Bảng xếp hạng</h2>
      <Link href="/dashboard/leaderboard" className="text-primary font-label-sm text-label-sm hover:text-on-primary-fixed-variant transition-colors">
        Tất cả
      </Link>
    </div>
    <div className="flex flex-col gap-2 flex-grow justify-center">
      {[
        { rank: 1, name: 'Trần Thị B', xp: '12,450', isMe: false, badge: '🏆', color: 'bg-tertiary-container text-on-tertiary-container' },
        { rank: 2, name: 'Lê Văn C', xp: '11,200', isMe: false, badge: '🥈', color: 'bg-secondary-container text-on-secondary-container' },
        { rank: 3, name: userName + ' (Bạn)', xp: '8,950', isMe: true, badge: '🥉', color: 'bg-primary text-on-primary' },
        { rank: 4, name: 'Phạm Thị D', xp: '7,300', isMe: false, badge: '🏅', color: 'bg-surface-variant text-on-surface-variant' }
      ].map(user => (
        <div key={user.rank} className={`flex items-center justify-between p-2 rounded-xl transition-colors ${user.isMe ? 'bg-primary-fixed/30 border border-primary/30' : 'hover:bg-surface'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-4 text-center font-bold text-sm ${user.isMe ? 'text-primary' : 'text-on-surface-variant'}`}>{user.rank}</div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.color}`}>
                {user.name.charAt(0)}
              </div>
              <div className={`text-sm font-medium ${user.isMe ? 'text-primary' : 'text-on-surface'}`}>{user.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-sm font-bold ${user.isMe ? 'text-primary' : 'text-on-surface-variant'}`}>{user.xp}</div>
            <div className="text-lg leading-none">{user.badge}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

</div>

    </>
  );
}
