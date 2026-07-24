"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { FinancialPlan, Transaction, TransactionType } from "@/features/finance/domain";
import {
  buildCashflowChartData,
  buildCategoryShareData,
  buildPeriodFinancialSummary,
  type CashflowChartFilter,
} from "@/features/finance/chartData";

type ReportsTabProps = { plan: FinancialPlan | null; transactions: Transaction[] };
type ReportChartTab = "cashflow" | "share";
type CashflowMode = "expense" | "income" | "aggregate";

const CASHFLOW_MODES = [
  ["expense", "Chi tiêu"],
  ["income", "Thu nhập"],
  ["aggregate", "Tổng hợp"],
] as const;
const SHARE_MODES = [
  ["expense", "Chi tiêu"],
  ["income", "Thu nhập"],
] as const;
const SHARE_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#ca8a04", "#475569"];

function formatVnd(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;
}

function getPeriodDescription(filter: CashflowChartFilter) {
  return filter.type === "year"
    ? `Năm ${filter.year}`
    : `Tháng ${(filter.month ?? 0) + 1}/${filter.year}`;
}

export default function ReportsTab({ plan, transactions }: ReportsTabProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const [filter, setFilter] = useState<CashflowChartFilter>({ type: "year", year: currentYear });
  const [chartTab, setChartTab] = useState<ReportChartTab>("cashflow");
  const [cashflowMode, setCashflowMode] = useState<CashflowMode>("aggregate");
  const [shareMode, setShareMode] = useState<TransactionType>("expense");

  const cashflow = buildCashflowChartData(transactions, filter);
  const categoryShare = buildCategoryShareData(transactions, filter, shareMode);
  const summary = buildPeriodFinancialSummary(transactions, filter);
  const hasCashflowData = cashflow.income.some((amount) => amount > 0) || cashflow.expense.some((amount) => amount > 0);
  const hasChartData = chartTab === "cashflow" ? hasCashflowData : categoryShare.total > 0;
  const minTransactionYear = transactions.reduce((earliest, transaction) => {
    if (!Number.isFinite(transaction.date)) return earliest;
    return Math.min(earliest, new Date(transaction.date).getFullYear());
  }, plan?.createdAt ? new Date(plan.createdAt).getFullYear() : currentYear);
  const minYear = Math.min(minTransactionYear, currentYear);
  const periodDescription = getPeriodDescription(filter);
  const growthText = summary.growthStatus === "no-previous-data"
    ? "Chưa có dữ liệu trước đó"
    : summary.growthStatus === "previous-period-zero"
      ? "Không thể tính % (kỳ trước = 0)"
      : `${summary.growthRate! > 0 ? "+" : ""}${summary.growthRate!.toFixed(1)}%`;
  const growthColor = summary.growthRate === null
    ? "text-on-surface-variant"
    : summary.growthRate > 0
      ? "text-success"
      : summary.growthRate < 0
        ? "text-error"
        : "text-on-surface-variant";

  useEffect(() => {
    const canvas = chartRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !hasChartData) return;

    Chart.getChart(canvas)?.destroy();

    if (chartTab === "cashflow") {
      const selectedData = cashflowMode === "expense"
        ? { label: "Chi tiêu", values: cashflow.expense, color: "#2563eb", lineColor: "#1d4ed8" }
        : cashflowMode === "income"
          ? { label: "Thu nhập", values: cashflow.income, color: "#ef4444", lineColor: "#dc2626" }
          : { label: "Tổng hợp", values: cashflow.net, color: cashflow.net.map((amount) => amount >= 0 ? "#2563eb" : "#ef4444"), lineColor: "#6366f1" };

      const instance = new Chart(context, {
        type: "bar",
        data: {
          labels: cashflow.labels,
          datasets: [
            { label: selectedData.label, data: selectedData.values, backgroundColor: selectedData.color, borderColor: selectedData.color, borderWidth: 1, borderRadius: 5 },
            { type: "line", label: "Xu hướng", data: selectedData.values, borderColor: selectedData.lineColor, backgroundColor: selectedData.lineColor, borderWidth: 2, pointRadius: 2, pointHoverRadius: 4, tension: 0.25 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#2d3133",
              padding: 12,
              filter: (item) => item.datasetIndex === 0,
              callbacks: { label: (item) => `${item.dataset.label}: ${formatVnd(item.parsed.y ?? 0)}` },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#737686" } },
            y: {
              beginAtZero: true,
              grid: { color: "#e6e8ea" },
              ticks: { color: "#737686", maxTicksLimit: 5, callback: (value) => `${new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value))} ₫` },
            },
          },
          interaction: { intersect: false, mode: "index" },
        },
      });

      return () => instance.destroy();
    }

    const instance = new Chart(context, {
      type: "doughnut",
      data: {
        labels: categoryShare.labels,
        datasets: [{ data: categoryShare.values, backgroundColor: categoryShare.labels.map((_, index) => SHARE_COLORS[index % SHARE_COLORS.length]), borderColor: "#ffffff", borderWidth: 3, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, padding: 16 } },
          tooltip: {
            backgroundColor: "#2d3133",
            padding: 12,
            callbacks: {
              label: (item) => `${item.label}: ${formatVnd(item.parsed)} (${categoryShare.percentages[item.dataIndex]}%)`,
            },
          },
        },
      },
    });

    return () => instance.destroy();
  }, [cashflow, cashflowMode, categoryShare, chartTab, hasChartData]);

  const switchToMonth = () => {
    setFilter((current) => ({
      type: "month",
      year: current.year,
      month: current.month ?? now.getMonth(),
    }));
  };

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Thống kê và Báo cáo</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Theo dõi dòng tiền và cơ cấu danh mục của bạn theo từng kỳ.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-container p-1">
          <div className="flex gap-1">
            <button type="button" onClick={() => setFilter((current) => ({ type: "year", year: current.year }))} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${filter.type === "year" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Theo năm</button>
            <button type="button" onClick={switchToMonth} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${filter.type === "month" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>Theo tháng</button>
          </div>
          {filter.type === "month" ? (
            <input
              aria-label="Chọn tháng thống kê"
              type="month"
              min={`${minYear}-01`}
              max={`${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`}
              value={`${filter.year}-${String((filter.month ?? now.getMonth()) + 1).padStart(2, "0")}`}
              onChange={(event) => {
                const [year, month] = event.target.value.split("-").map(Number);
                if (year && month) setFilter({ type: "month", year, month: month - 1 });
              }}
              className="rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-on-surface outline-none"
            />
          ) : (
            <input
              aria-label="Chọn năm thống kê"
              type="number"
              min={minYear}
              max={currentYear}
              value={filter.year}
              onChange={(event) => {
                const year = Number(event.target.value);
                if (Number.isInteger(year) && year >= minYear && year <= currentYear) setFilter({ type: "year", year });
              }}
              className="w-24 rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-on-surface outline-none"
            />
          )}
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="payments" label="Tổng thu nhập" value={formatVnd(summary.income)} description={periodDescription} />
        <MetricCard icon="credit_card" label="Tổng chi tiêu" value={formatVnd(summary.expense)} description={periodDescription} />
        <MetricCard icon="balance" label="Chênh lệch" value={formatVnd(summary.net)} description={periodDescription} />
        <MetricCard icon="trending_up" label="% tăng trưởng" value={growthText} description={filter.type === "year" ? "So với năm trước" : "So với tháng trước"} valueClassName={growthColor} />
      </div>

      <div className="mt-6 border-t border-outline-variant/30 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-1 rounded-xl bg-surface-container p-1 sm:w-auto" role="tablist" aria-label="Biểu đồ báo cáo tài chính">
            <button type="button" role="tab" aria-selected={chartTab === "cashflow"} onClick={() => setChartTab("cashflow")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none ${chartTab === "cashflow" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>Diễn biến thu chi</button>
            <button type="button" role="tab" aria-selected={chartTab === "share"} onClick={() => setChartTab("share")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none ${chartTab === "share" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>Tỷ trọng thu chi</button>
          </div>
          <div className="flex gap-1" role="tablist" aria-label={chartTab === "cashflow" ? "Loại dòng tiền" : "Loại tỷ trọng"}>
            {(chartTab === "cashflow" ? CASHFLOW_MODES : SHARE_MODES).map(([mode, label]) => {
              const isSelected = chartTab === "cashflow" ? cashflowMode === mode : shareMode === mode;
              return <button key={mode} type="button" role="tab" aria-selected={isSelected} onClick={() => chartTab === "cashflow" ? setCashflowMode(mode as CashflowMode) : setShareMode(mode as TransactionType)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isSelected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{label}</button>;
            })}
          </div>
        </div>

        {hasChartData ? (
          <div className="relative mt-4 h-72"><canvas ref={chartRef} /></div>
        ) : (
          <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-xl bg-surface-container text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">insert_chart</span>
            <p className="mt-3 font-semibold text-on-surface">Chưa có dữ liệu cho {periodDescription}</p>
            <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{chartTab === "share" ? `Hãy thêm giao dịch ${shareMode === "expense" ? "chi tiêu" : "thu nhập"} để xem tỷ trọng danh mục.` : "Hãy nhập giao dịch để xem diễn biến thu chi."}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, description, valueClassName = "text-on-surface" }: { icon: string; label: string; value: string; description: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl border border-surface-variant bg-surface-container-low p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant"><span className="material-symbols-outlined text-base">{icon}</span>{label}</div>
      <p className={`mt-3 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
    </div>
  );
}
