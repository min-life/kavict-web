"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function AnimatedCounter({ target, suffix = "" }: { target: number, suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / 60));
        let current = 0;
        const increment = target / (duration / stepTime);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setValue(target);
            clearInterval(timer);
          } else {
            setValue(Math.ceil(current));
          }
        }, stepTime);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{new Intl.NumberFormat('vi-VN').format(value)}{suffix}</span>;
}

function AnimatedProgressBar({ percent, className }: { percent: number, className?: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setTimeout(() => setWidth(percent), 200);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent]);

  return (
    <div ref={ref} className={className} style={{ width: `${width}%`, transition: 'width 1.5s ease-out' }}></div>
  );
}

function AnimatedProgressRing({ percent }: { percent: number }) {
  const [offset, setOffset] = useState(251.2);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setTimeout(() => {
          const radius = 40;
          const circumference = radius * 2 * Math.PI;
          setOffset(circumference - (percent / 100) * circumference);
        }, 500);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent]);

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
      <circle ref={ref} className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={offset} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dashoffset 1s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}></circle>
    </svg>
  );
}

export default function DashboardHome() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set Current Date
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('vi-VN', dateOptions));

    // Chart.js Setup
    if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

            const chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                    datasets: [{
                        label: 'Tổng tài sản',
                        data: [120, 125, 132, 130, 142, 148, 154],
                        borderColor: '#2563eb',
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2563eb',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#2d3133',
                            titleFont: { family: 'Geist', size: 12 },
                            bodyFont: { family: 'Geist', size: 14, weight: 'bold' },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + ' Tr VNĐ';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false, drawBorder: false } as any,
                            ticks: { font: { family: 'Geist', size: 12 }, color: '#737686' }
                        },
                        y: {
                            grid: { color: '#e6e8ea', drawBorder: false, borderDash: [5, 5] } as any,
                            ticks: { font: { family: 'Geist', size: 12 }, color: '#737686', maxTicksLimit: 5 }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeOutQuart'
                    }
                }
            });

            return () => chartInstance.destroy();
        }
    }
  }, []);

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
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Xin chào, Nguyễn Văn A 👋</h1>
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
<div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient hover:shadow-hover transition-shadow duration-300 p-md fade-in delay-100 flex flex-col h-full">
<div className="flex justify-between items-center mb-md">
<h2 className="font-headline-md text-headline-md text-on-surface">Tổng quan tài chính</h2>
<Link href="/dashboard/ai-assistant" className="text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết (Trợ lý tài chính AI)">
<span className="material-symbols-outlined">more_horiz</span>
</Link>
</div>
{/* Chart Area */}
<div className="relative h-64 w-full mb-lg flex-grow">
<canvas id="financeChart" ref={chartRef}></canvas>
</div>
{/* Metrics Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-sm mt-auto">
{/* Metric 1 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>💰</span> Tổng tài sản
                        </div>
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={154200000} /></div>
<div className="text-[12px] text-primary mt-1">+2.4% so với tháng trước</div>
</div>
{/* Metric 2 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>📈</span> Tăng trưởng
                        </div>
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={3600000} /></div>
<div className="text-[12px] text-on-surface-variant mt-1">Tháng này</div>
</div>
{/* Metric 3 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>💳</span> Chi tiêu
                        </div>
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={12800000} /></div>
<div className="text-[12px] text-error mt-1">-5% so với tháng trước</div>
</div>
{/* Metric 4 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors flex flex-col justify-between">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>🎯</span> Mục tiêu tiết kiệm
                        </div>
<div className="w-full bg-surface-variant rounded-full h-2 mt-2 mb-1 overflow-hidden">
<AnimatedProgressBar percent={68} className="bg-primary h-2 rounded-full" />
</div>
<div className="font-label-md text-label-md text-on-surface text-right"><AnimatedCounter target={68} suffix="%" /></div>
</div>
</div>
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
{/* Bottom Section: Bảng xếp hạng */}
<div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient p-md fade-in delay-300">
<div className="flex justify-between items-center mb-md">
<h2 className="font-headline-md text-headline-md text-on-surface">Bảng xếp hạng học tập</h2>
<button className="text-primary font-label-md text-label-md hover:text-on-primary-fixed-variant transition-colors flex items-center gap-xs">
                    Xem đầy đủ
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-surface-variant text-on-surface-variant font-label-md text-label-md">
<th className="py-sm px-md font-medium">Hạng</th>
<th className="py-sm px-md font-medium">Người dùng</th>
<th className="py-sm px-md font-medium">Chuỗi học tập</th>
<th className="py-sm px-md font-medium text-right">Điểm XP</th>
<th className="py-sm px-md font-medium text-center">Huy hiệu</th>
</tr>
</thead>
<tbody className="font-body-md text-body-md">
{/* Row 1 */}
<tr className="border-b border-surface-variant hover:bg-surface transition-colors">
<td className="py-sm px-md font-bold text-on-surface">1</td>
<td className="py-sm px-md flex items-center gap-sm">
<div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-sm">T</div>
<span>Trần Thị B</span>
</td>
<td className="py-sm px-md text-on-surface-variant">42 ngày 🔥</td>
<td className="py-sm px-md text-right font-label-md text-label-md">12,450</td>
<td className="py-sm px-md text-center"><span className="text-xl">🏆</span></td>
</tr>
{/* Row 2 */}
<tr className="border-b border-surface-variant hover:bg-surface transition-colors">
<td className="py-sm px-md font-bold text-on-surface">2</td>
<td className="py-sm px-md flex items-center gap-sm">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">L</div>
<span>Lê Văn C</span>
</td>
<td className="py-sm px-md text-on-surface-variant">38 ngày 🔥</td>
<td className="py-sm px-md text-right font-label-md text-label-md">11,200</td>
<td className="py-sm px-md text-center"><span className="text-xl">🥈</span></td>
</tr>
{/* Row 3 (Current User Highlighted) */}
<tr className="bg-primary-fixed/30 border-b border-surface-variant hover:bg-primary-fixed/50 transition-colors">
<td className="py-sm px-md font-bold text-primary">3</td>
<td className="py-sm px-md flex items-center gap-sm font-medium">
<div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">N</div>
<span>Nguyễn Văn A (Bạn)</span>
</td>
<td className="py-sm px-md text-primary font-medium">15 ngày 🔥</td>
<td className="py-sm px-md text-right font-label-md text-label-md text-primary font-bold">8,950</td>
<td className="py-sm px-md text-center"><span className="text-xl">🥉</span></td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface transition-colors">
<td className="py-sm px-md text-on-surface-variant">4</td>
<td className="py-sm px-md flex items-center gap-sm">
<div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-sm">P</div>
<span>Phạm Thị D</span>
</td>
<td className="py-sm px-md text-on-surface-variant">12 ngày 🔥</td>
<td className="py-sm px-md text-right font-label-md text-label-md">7,300</td>
<td className="py-sm px-md text-center"><span className="text-xl">🏅</span></td>
</tr>
</tbody>
</table>
</div>
</div>

    </>
  );
}
