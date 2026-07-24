"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { buildCashflowChartData } from "@/features/finance/chartData";
import { AnimatedCounter, AnimatedProgressBar } from "./SharedUI";

type ChartFilterState = { type: 'year' | 'month', year: number, month?: number };
type ChartDisplayMode = "expense" | "income" | "aggregate";

export function FinancialOverview({ plan, transactions, onEditPlan, title = "Quản lý tài chính", titleAction }: { plan: FinancialPlan, transactions: Transaction[], onEditPlan?: () => void, title?: string, titleAction?: React.ReactNode }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [mountedAt] = useState(Date.now);
  
  const currentYear = new Date().getFullYear();
  const [chartFilter, setChartFilter] = useState<ChartFilterState>({ type: 'year', year: currentYear });
  const [chartMode, setChartMode] = useState<ChartDisplayMode>("expense");
  
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        let chartInstance = Chart.getChart(chartRef.current);
        if (chartInstance) chartInstance.destroy();

        const cashflow = buildCashflowChartData(transactions, chartFilter);
        const selectedChart = chartMode === "expense"
          ? { label: "Chi tiêu", data: cashflow.expense, barColor: "#3b82f6", lineColor: "#2563eb" }
          : chartMode === "income"
            ? { label: "Thu nhập", data: cashflow.income, barColor: "#ef4444", lineColor: "#dc2626" }
            : { label: "Tổng hợp", data: cashflow.net, barColor: cashflow.net.map((amount) => amount >= 0 ? "#3b82f6" : "#ef4444"), lineColor: "#6366f1" };
        const formatCurrency = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(Math.abs(amount))} ₫`;
        const xGrid = { display: false, drawBorder: false };
        const yGrid = {
          color: (context: { tick: { value: number } }) => context.tick.value === 0 ? '#9ca3af' : '#e6e8ea',
          lineWidth: (context: { tick: { value: number } }) => context.tick.value === 0 ? 2 : 1,
          drawBorder: false,
          borderDash: [5, 5],
        };

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                 labels: cashflow.labels,
                 datasets: [
                   {
                     label: selectedChart.label,
                     data: selectedChart.data,
                     backgroundColor: selectedChart.barColor,
                     borderColor: selectedChart.barColor,
                     borderWidth: 1,
                     borderRadius: 5,
                   },
                   {
                     type: "line",
                     label: "Xu hướng",
                     data: selectedChart.data,
                     borderColor: selectedChart.lineColor,
                     backgroundColor: selectedChart.lineColor,
                     borderWidth: 2,
                     pointRadius: 2,
                     pointHoverRadius: 4,
                     tension: 0.25,
                   },
                 ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                      display: false,
                      position: 'top',
                      labels: { font: { family: 'Geist', size: 12 }, usePointStyle: true, pointStyle: 'rectRounded' },
                    },
                    tooltip: {
                        backgroundColor: '#2d3133',
                        titleFont: { family: 'Geist', size: 12 },
                        bodyFont: { family: 'Geist', size: 14, weight: 'bold' },
                        padding: 12,
                        displayColors: true,
                        filter: (context) => context.datasetIndex === 0,
                        callbacks: {
                            label: function(context) {
                                const amount = context.parsed.y ?? 0;
                                const prefix = amount < 0 ? '-' : '';
                                return `${context.dataset.label}: ${prefix}${formatCurrency(amount)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: xGrid,
                        ticks: { font: { family: 'Geist', size: 12 }, color: '#737686' }
                    },
                    y: {
                        grid: yGrid,
                        beginAtZero: true,
                        ticks: {
                          font: { family: 'Geist', size: 12 },
                          color: '#737686',
                          maxTicksLimit: 5,
                          callback: (value) => `${new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))} ₫`,
                        },
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
  }, [transactions, chartFilter, chartMode]);

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

  const startLimit = new Date(plan.createdAt || mountedAt);
  const minYear = startLimit.getFullYear();
  const minMonthStr = `${minYear}-${(startLimit.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const endLimit = new Date();
  const maxYear = endLimit.getFullYear();
  const maxMonthStr = `${maxYear}-${(endLimit.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-ambient flex flex-col h-full">
      <div className="flex justify-between items-center p-6 pb-2">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
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

      <div className="flex gap-1 px-6 pb-2" role="tablist" aria-label="Loại biểu đồ tài chính">
        {([
          ["expense", "Chi tiêu"],
          ["income", "Thu nhập"],
          ["aggregate", "Tổng hợp"],
        ] as const).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={chartMode === mode}
            onClick={() => setChartMode(mode)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${chartMode === mode ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}
          >{label}</button>
        ))}
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
