"use client";

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

export default function DashboardOverview() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Chart.js Setup (Modern Area Chart)
    if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)'); // primary color with opacity
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

            const chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                    datasets: [{
                        label: 'Tổng tài sản',
                        data: [120, 125, 132, 130, 142, 148, 154],
                        borderColor: '#2563eb', // primary container
                        backgroundColor: gradient,
                        borderWidth: 2,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#2563eb',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4 // Smooth curves
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#2d3133', // inverse-surface
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
                            grid: { color: '#e6e8ea', drawBorder: false, borderDash: [5, 5] } as any, // surface-container-high
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

  return (
    <div className="flex flex-col gap-md">

{/* ROW 1: Overview & AI Coach */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
{/* Financial Health Overview */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm lg:col-span-2 p-md flex flex-col gap-sm"><div className="flex justify-between items-center mb-md">
<h2 className="font-headline-md text-headline-md text-on-surface">Tổng quan tài chính</h2>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
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
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={154200000} suffix=" ₫" /></div>
<div className="text-[12px] text-primary mt-1">+2.4% so với tháng trước</div>
</div>
{/* Metric 2 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>📈</span> Tăng trưởng
                        </div>
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={3600000} suffix=" ₫" /></div>
<div className="text-[12px] text-on-surface-variant mt-1">Tháng này</div>
</div>
{/* Metric 3 */}
<div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors">
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
<span>💳</span> Chi tiêu
                        </div>
<div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={12800000} suffix=" ₫" /></div>
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
</div></div>
{/* AI Financial Coach */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm lg:col-span-1 p-md flex flex-col gap-sm relative overflow-hidden group">
<div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
<div className="flex items-center gap-sm">
<div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm">
<img alt="AI Financial Assistant Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLviK1C5QGY-MA8toZfN83_xj_Tv-j83xb2hIeLmALyJaxGqmmn4Mg2CwQClzCZ00epE7Rxt3Vusl5lrbLhXggBZo3DSCPH5EJN0b9a2jWB_1oZywKkPabIkbgzue149DG4di-zSU0K_rIBmMfrCdtTaYuBCtCTuAnSO2PD5-1VE5J7tkWV58euJVs4oyVCo0w_n0Kxknv7lot-NZj9LN0LbSd8aBnxVPxlIqmc3ChTgm5XIFoDwoSjyOLg"/>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-on-surface text-[20px]">Kavi AI Coach</h3>
<p className="font-label-md text-label-md text-primary flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Đang trực tuyến</p>
</div>
</div>
<div className="flex-grow flex flex-col gap-xs mt-xs">
{/* AI Message Alert */}
<div className="bg-error-container/30 border border-error/20 p-sm rounded-xl flex items-start gap-xs">
<span className="material-symbols-outlined text-error text-[20px] mt-0.5">warning</span>
<div>
<span className="font-label-md text-label-md text-error block font-bold">Cảnh báo</span>
<p className="font-body-md text-body-md text-on-surface-variant text-[14px]">Chi tiêu ăn uống tháng này tăng 35% so với tháng trước. Vượt ngân sách dự kiến 500k ₫.</p>
</div>
</div>
{/* AI Suggestion */}
<div className="bg-primary-fixed/20 border border-primary-fixed p-sm rounded-xl flex items-start gap-xs">
<span className="material-symbols-outlined text-primary text-[20px] mt-0.5">lightbulb</span>
<div>
<span className="font-label-md text-label-md text-primary block font-bold">Đề xuất</span>
<p className="font-body-md text-body-md text-on-surface-variant text-[14px]">Bạn nên chuyển 200k ₫ vào Quỹ Khẩn Cấp ngay hôm nay để đạt mục tiêu tháng.</p>
</div>
</div>
</div>
<button className="w-full mt-auto bg-primary-container text-on-primary font-label-md text-label-md py-sm rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2 h-12 shadow-sm">
<span className="material-symbols-outlined text-[20px]">chat</span> Trao đổi với AI
                </button>
</div>
</div>
{/* ROW 2: Goals & Transactions */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
{/* Financial Goals */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm p-md flex flex-col gap-sm">
<div className="flex justify-between items-center mb-xs">
<h2 className="font-headline-md text-headline-md text-on-surface text-[20px] flex items-center gap-2"><span className="material-symbols-outlined text-primary">flag</span> Mục tiêu tài chính</h2>
<button className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">add</span> Thêm</button>
</div>
{/* Goal 1 */}
<div className="bg-surface p-sm rounded-xl border border-surface-variant hover:border-outline-variant transition-colors">
<div className="flex justify-between items-center mb-2">
<div className="flex items-center gap-2">
<span className="text-2xl">🏠</span>
<span className="font-label-md text-label-md text-on-surface font-bold">Mua nhà</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Đạt <AnimatedCounter target={45} suffix="%" /></span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
<AnimatedProgressBar percent={45} className="h-full bg-primary rounded-full" />
</div>
<div className="flex justify-between text-label-sm font-label-sm">
<span className="text-on-surface-variant">Đã tích lũy: <strong className="text-on-surface font-label-md"><AnimatedCounter target={450} suffix="M ₫" /></strong></span>
<span className="text-outline">Mục tiêu: 1T ₫</span>
</div>
</div>
{/* Goal 2 */}
<div className="bg-surface p-sm rounded-xl border border-surface-variant hover:border-outline-variant transition-colors">
<div className="flex justify-between items-center mb-2">
<div className="flex items-center gap-2">
<span className="text-2xl">💰</span>
<span className="font-label-md text-label-md text-on-surface font-bold">Quỹ khẩn cấp</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Đạt <AnimatedCounter target={80} suffix="%" /></span>
</div>
<div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
<AnimatedProgressBar percent={80} className="h-full bg-success rounded-full" />
</div>
<div className="flex justify-between text-label-sm font-label-sm">
<span className="text-on-surface-variant">Đã tích lũy: <strong className="text-on-surface font-label-md"><AnimatedCounter target={80} suffix="M ₫" /></strong></span>
<span className="text-outline">Mục tiêu: 100M ₫</span>
</div>
</div>
</div>
{/* Income & Expense Transactions */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm p-md flex flex-col gap-sm relative">
<div className="flex justify-between items-center mb-xs">
<h2 className="font-headline-md text-headline-md text-on-surface text-[20px] flex items-center gap-2"><span className="material-symbols-outlined text-primary">receipt_long</span> Giao dịch gần đây</h2>
<button className="w-10 h-10 bg-primary text-on-primary rounded-full shadow-sm flex items-center justify-center hover:bg-primary-fixed-variant transition-transform hover:scale-105 active:scale-95">
  <span className="material-symbols-outlined text-[20px]">add</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<tbody>
<tr className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
<td className="py-sm">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined">restaurant</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface font-bold">Ăn uống</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Hôm nay, 12:30</p>
</div>
</div>
</td>
<td className="py-sm text-right font-label-md text-label-md text-error font-bold">- 150,000 ₫</td>
</tr>
<tr className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
<td className="py-sm">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center">
<span className="material-symbols-outlined">directions_car</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface font-bold">Di chuyển</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">Hôm qua, 08:15</p>
</div>
</div>
</td>
<td className="py-sm text-right font-label-md text-label-md text-error font-bold">- 50,000 ₫</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="py-sm">
<div className="flex items-center gap-sm">
<div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center">
<span className="material-symbols-outlined">account_balance</span>
</div>
<div>
<p className="font-label-md text-label-md text-on-surface font-bold">Lương</p>
<p className="font-label-sm text-label-sm text-on-surface-variant">25 Thg 10</p>
</div>
</div>
</td>
<td className="py-sm text-right font-label-md text-label-md text-success font-bold">+ 25,000,000 ₫</td>
</tr>
</tbody>
</table>
</div>

</div>
</div>
{/* ROW 3: Insights & Actions */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
{/* Financial Insights */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm p-md flex flex-col gap-sm">
<h2 className="font-headline-md text-headline-md text-on-surface text-[20px] flex items-center gap-2 mb-xs"><span className="material-symbols-outlined text-primary">analytics</span> Phân tích AI</h2>
<div className="grid grid-cols-2 gap-sm h-full">
{/* Mock Pie Chart for Spend Category */}
<div className="bg-surface p-sm rounded-xl border border-surface-variant flex flex-col items-center justify-center relative">
<span className="font-label-sm text-label-sm text-on-surface-variant absolute top-sm left-sm">Danh mục chi tiêu</span>
<div className="w-24 h-24 rounded-full border-[8px] border-surface-container-highest relative mt-md">
{/* CSS pure mock pie segment */}
<div className="absolute inset-0 rounded-full border-[8px] border-primary" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)'}}></div>
<div className="absolute inset-0 rounded-full border-[8px] border-warning" style={{clipPath: 'polygon(50% 50%, 0 100%, 0 0, 50% 0)', transform: 'rotate(45deg)'}}></div>
</div>
<div className="flex gap-2 mt-xs text-[10px] font-label-sm">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Ăn uống</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block"></span> Khác</span>
</div>
</div>
{/* Mock Line Chart for Cashflow */}
<div className="bg-surface p-sm rounded-xl border border-surface-variant flex flex-col relative overflow-hidden">
<span className="font-label-sm text-label-sm text-on-surface-variant mb-2">Dự báo dòng tiền</span>
<div className="flex-grow w-full mt-auto relative">
<svg className="w-full h-16" preserveAspectRatio="none" viewBox="0 0 100 40">
<path d="M0,35 Q25,20 50,25 T100,5" fill="none" stroke="#2563EB" strokeDasharray="4,2" strokeWidth="2"></path>
<path d="M0,30 Q25,35 50,15 T100,20" fill="none" stroke="#E2E8F0" strokeWidth="2"></path>
</svg>
<div className="absolute bottom-0 right-0 bg-primary/10 text-primary font-label-sm text-[10px] px-1 rounded">Dự kiến: +5M</div>
</div>
</div>
</div>
</div>
{/* Recommended Actions */}
<div className="bg-surface-container-lowest rounded-[24px] border border-surface-variant shadow-sm p-md flex flex-col gap-sm">
<h2 className="font-headline-md text-headline-md text-on-surface text-[20px] flex items-center gap-2 mb-xs"><span className="material-symbols-outlined text-primary">task_alt</span> Hành động đề xuất</h2>
<div className="flex flex-col gap-2">
<label className="flex items-start gap-sm p-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant cursor-pointer group">
<input className="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-background transition duration-150 ease-in-out" type="checkbox"/>
<div className="flex-grow">
<p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Hoàn thành bài học 'Ngân sách cá nhân'</p>
<p className="font-body-md text-body-md text-on-surface-variant text-[12px] mt-0.5">Tăng điểm tín nhiệm tài chính</p>
</div>
<span className="bg-error-container text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Cao</span>
</label>
<label className="flex items-start gap-sm p-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant cursor-pointer group">
<input className="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-background transition duration-150 ease-in-out" type="checkbox"/>
<div className="flex-grow">
<p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Thiết lập tự động chuyển quỹ dự phòng</p>
<p className="font-body-md text-body-md text-on-surface-variant text-[12px] mt-0.5">Mục tiêu 20% thu nhập</p>
</div>
<span className="bg-warning/20 text-warning px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">TB</span>
</label>
<label className="flex items-start gap-sm p-sm rounded-xl bg-surface hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant cursor-pointer group">
<input defaultChecked className="mt-1 form-checkbox h-5 w-5 text-success rounded border-outline-variant opacity-50" disabled type="checkbox"/>
<div className="flex-grow opacity-50">
<p className="font-label-md text-label-md text-on-surface line-through">Cập nhật số dư cuối tháng</p>
<p className="font-body-md text-body-md text-on-surface-variant text-[12px] mt-0.5">Đã hoàn thành</p>
</div>
</label>
</div>
</div>
</div>

    </div>
  );
}
