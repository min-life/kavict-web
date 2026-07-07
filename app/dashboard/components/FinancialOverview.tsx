"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { FinancialPlan, Transaction } from "@/lib/financeTypes";
import { AnimatedCounter, AnimatedProgressBar } from "./SharedUI";

type ChartFilterState = { type: 'year' | 'month', year: number, month?: number };

export function FinancialOverview({ plan, transactions, onEditPlan, titleAction }: { plan: FinancialPlan, transactions: Transaction[], onEditPlan?: () => void, titleAction?: React.ReactNode }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  const currentYear = new Date().getFullYear();
  const [chartFilter, setChartFilter] = useState<ChartFilterState>({ type: 'year', year: currentYear });
  
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        let chartInstance = Chart.getChart(chartRef.current);
        if (chartInstance) chartInstance.destroy();

        let labels: string[] = [];
        let data: number[] = [];
        const now = new Date();

        if (chartFilter.type === 'year') {
          labels = Array.from({length: 12}, (_, i) => `T${i + 1}`);
          let balances = new Array(12).fill(0);
          
          for (let m = 0; m < 12; m++) {
            const startOfMonth = new Date(chartFilter.year, m, 1).getTime();
            
            if (startOfMonth > now.getTime()) {
              balances[m] = null;
            } else {
              const endOfMonth = new Date(chartFilter.year, m + 1, 0, 23, 59, 59, 999).getTime();
              const targetTime = Math.min(endOfMonth, now.getTime());
              const txAfter = transactions.filter(tx => tx.date > targetTime);
              const netAfter = txAfter.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
              balances[m] = plan.currentBalance - netAfter;
            }
          }
          data = balances.map(b => b !== null ? b / 1000000 : null) as number[];
        } else {
          const year = chartFilter.year;
          const month = chartFilter.month !== undefined ? chartFilter.month : new Date().getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());
          let balances = new Array(daysInMonth).fill(0);
          
          for (let d = 1; d <= daysInMonth; d++) {
            const startOfDay = new Date(year, month, d).getTime();
            if (startOfDay > now.getTime()) {
              balances[d - 1] = null;
            } else {
              const endOfDay = new Date(year, month, d, 23, 59, 59, 999).getTime();
              const targetTime = Math.min(endOfDay, now.getTime());
              const txAfter = transactions.filter(tx => tx.date > targetTime);
              const netAfter = txAfter.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
              balances[d - 1] = plan.currentBalance - netAfter;
            }
          }
          data = balances.map(b => b !== null ? b / 1000000 : null) as number[];
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Tổng tài sản',
                    data,
                    borderColor: '#2563eb',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4,
                    spanGaps: true
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
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        return () => chartInstance?.destroy();
      }
    }
  }, [transactions, plan.currentBalance, chartFilter]);

  const isTargetPeriod = (ts: number) => {
    const d = new Date(ts);
    if (chartFilter.type === 'year') {
      return d.getFullYear() === chartFilter.year;
    }
    return d.getFullYear() === chartFilter.year && d.getMonth() === chartFilter.month;
  };

  const incomeThisPeriod = transactions
    .filter(tx => tx.type === 'income' && isTargetPeriod(tx.date))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenseThisPeriod = transactions
    .filter(tx => tx.type === 'expense' && isTargetPeriod(tx.date))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netThisPeriod = incomeThisPeriod - expenseThisPeriod;
  const prevPeriodBalance = plan.currentBalance - netThisPeriod;
  const assetGrowth = prevPeriodBalance === 0 ? 0 : ((plan.currentBalance - prevPeriodBalance) / prevPeriodBalance) * 100;
  const assetGrowthText = `${assetGrowth > 0 ? '+' : ''}${assetGrowth.toFixed(1)}% trong kỳ này`;
  const assetGrowthColor = assetGrowth >= 0 ? 'text-success' : 'text-error';

  const totalGoalsTarget = plan.goals?.reduce((sum, g) => sum + g.targetAmount, 0) || 1;
  const totalGoalsProgress = totalGoalsTarget > 0 
    ? Math.min((plan.currentBalance / totalGoalsTarget) * 100, 100) 
    : 0;

  const startLimit = new Date(plan.createdAt || Date.now());
  const minYear = startLimit.getFullYear();
  const minMonthStr = `${minYear}-${(startLimit.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const endLimit = new Date();
  const maxYear = endLimit.getFullYear();
  const maxMonthStr = `${maxYear}-${(endLimit.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient flex flex-col h-full">
      <div className="flex justify-between items-center p-6 pb-2">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-md text-headline-md text-on-surface">Tổng quan tài chính</h2>
          {titleAction}
        </div>
        <div className="bg-surface-container rounded-lg p-1 flex gap-2 items-center">
          <div className="flex gap-1">
            <button 
              onClick={() => setChartFilter({ ...chartFilter, type: 'year' })}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartFilter.type === 'year' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >Theo năm</button>
            <button 
              onClick={() => setChartFilter({ ...chartFilter, type: 'month', month: chartFilter.month !== undefined ? chartFilter.month : new Date().getMonth() })}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartFilter.type === 'month' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >Theo tháng</button>
          </div>
          {chartFilter.type === 'month' ? (
            <input 
              type="month" 
              min={minMonthStr}
              max={maxMonthStr}
              value={`${chartFilter.year}-${(chartFilter.month !== undefined ? chartFilter.month + 1 : new Date().getMonth() + 1).toString().padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m] = e.target.value.split('-');
                  setChartFilter({ type: 'month', year: parseInt(y), month: parseInt(m) - 1 });
                }
              }}
              className="px-2 py-1 bg-surface rounded-md text-sm font-medium outline-none border-none cursor-pointer text-on-surface"
            />
          ) : (
            <input 
              type="number" 
              min={minYear}
              max={maxYear}
              value={chartFilter.year}
              onChange={(e) => {
                if (e.target.value) {
                  setChartFilter({ type: 'year', year: parseInt(e.target.value) });
                }
              }}
              className="px-2 py-1 bg-surface rounded-md text-sm font-medium outline-none border-none cursor-pointer text-on-surface w-20"
            />
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 w-full p-4 flex-grow">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm p-4 mt-auto">
        {/* Metric 1 */}
        <div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors flex flex-col justify-between">
          <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
            <span>💰</span> Tổng tài sản
          </div>
          <div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={plan.currentBalance} /></div>
          <div className={`text-[12px] mt-1 ${assetGrowthColor}`}>{assetGrowthText}</div>
        </div>
        {/* Metric 2 */}
        <div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors flex flex-col justify-between">
          <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
            <span>📈</span> Tăng trưởng
          </div>
          <div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={incomeThisPeriod} /></div>
          <div className="text-[12px] text-on-surface-variant mt-1">Thu vào kỳ này</div>
        </div>
        {/* Metric 3 */}
        <div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors flex flex-col justify-between">
          <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm mb-xs">
            <span>💳</span> Chi tiêu
          </div>
          <div className="font-headline-md text-headline-md text-on-surface font-bold"><AnimatedCounter target={expenseThisPeriod} /></div>
          <div className="text-[12px] text-on-surface-variant mt-1">Trong kỳ này</div>
        </div>
        {/* Metric 4 */}
        <div className="p-sm bg-surface rounded-xl border border-surface-variant hover:border-primary-fixed-dim transition-colors flex flex-col justify-between relative group">
          <div className="flex justify-between items-center mb-xs">
            <div className="flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm">
              <span>🎯</span> Mục tiêu tiết kiệm
            </div>
            {onEditPlan && (
              <button onClick={onEditPlan} className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-primary bg-surface-container w-6 h-6 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            )}
          </div>
          <div className="w-full bg-surface-variant rounded-full h-2 mt-2 mb-1 overflow-hidden">
            <AnimatedProgressBar percent={totalGoalsProgress} className="bg-primary h-2 rounded-full" />
          </div>
          <div className="font-label-md text-label-md text-on-surface text-right mt-1">
            <AnimatedCounter target={plan.currentBalance} /> / {new Intl.NumberFormat('vi-VN').format(totalGoalsTarget)} đ
          </div>
        </div>
      </div>
    </div>
  );
}
