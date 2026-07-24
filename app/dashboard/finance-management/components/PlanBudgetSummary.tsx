import type { BudgetProgress, PlanStatusSummary } from "@/features/finance/workspace";

type PlanBudgetSummaryProps = {
  progress: BudgetProgress;
  statusSummary: PlanStatusSummary;
};

function formatVnd(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;
}

function statusToneClass(tone: "complete" | "progress" | "warning" | "danger" | "neutral") {
  if (tone === "danger") return "bg-error/10 text-error";
  if (tone === "warning") return "bg-yellow-500/10 text-yellow-700";
  if (tone === "complete") return "bg-success/10 text-success";
  if (tone === "progress") return "bg-primary/10 text-primary";
  return "bg-surface-container text-on-surface-variant";
}

export default function PlanBudgetSummary({ progress, statusSummary }: PlanBudgetSummaryProps) {
  const expenseIsWithinPlan = progress.expense <= progress.allocated;
  const statusCards = [
    { heading: "Kế hoạch chi tiêu", count: `${statusSummary.spending.onTrack}/${statusSummary.spending.total}`, percent: `${statusSummary.spending.percent}%`, description: "Danh mục trong hạn mức", tone: statusSummary.spending.tone },
    { heading: "Kế hoạch thu nhập", count: `${statusSummary.income.completed}/${statusSummary.income.total}`, percent: `${statusSummary.income.percent}%`, description: "Mục tiêu đã hoàn thành", tone: statusSummary.income.tone },
    { heading: "Mục tiêu tài chính", count: `${statusSummary.objectives.completed}/${statusSummary.objectives.total}`, percent: `${statusSummary.objectives.percent}%`, description: "Mục tiêu đã hoàn thành", tone: statusSummary.objectives.tone },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-primary/10 p-4"><p className="text-sm text-on-surface-variant">Tổng thu nhập</p><p className="mt-1 text-xl font-bold text-primary">{formatVnd(progress.income)}</p></div>
        <div className="rounded-xl bg-surface-container p-4"><p className="text-sm text-on-surface-variant">Tổng plan tháng này</p><p className="mt-1 text-xl font-bold text-on-surface">{formatVnd(progress.allocated)}</p></div>
        <div className={`rounded-xl p-4 ${expenseIsWithinPlan ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}><p className="text-sm text-on-surface-variant">Đã tiêu dùng</p><p className="mt-1 text-xl font-bold">{formatVnd(progress.expense)}</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {statusCards.map((card) => <div key={card.heading} className={`rounded-xl p-4 ${statusToneClass(card.tone)}`}><p className="text-sm font-semibold">{card.heading}</p><p className="mt-2 text-2xl font-bold">{card.count}</p><p className="mt-1 text-sm font-semibold">{card.percent}</p><p className="mt-1 text-xs opacity-80">{card.description}</p></div>)}
      </div>
    </div>
  );
}
