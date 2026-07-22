import React from "react";
import { motion } from "framer-motion";

export interface MoneyIQStats {
  savingsScore: number; // 0 - 100
  intelligenceScore: number; // 0 - 100
  happinessScore: number; // 0 - 100
  disciplineScore: number; // 0 - 100
}

interface MoneyIQBoardProps {
  stats?: MoneyIQStats;
  className?: string;
  layout?: "vertical" | "horizontal"; // horizontal = matches camera height, metrics in 2x2 grid
}

const DEFAULT_STATS: MoneyIQStats = {
  savingsScore: 0,
  intelligenceScore: 0,
  happinessScore: 50,
  disciplineScore: 100, // starts at 100% since no budget exceeded yet
};

export default function MoneyIQBoard({ stats = DEFAULT_STATS, className = "", layout = "vertical" }: MoneyIQBoardProps) {

  const metrics = [
    { icon: "savings",       label: "Tiết kiệm",  value: stats.savingsScore,      colorClass: "text-yellow-600", bgClass: "bg-yellow-500" },
    { icon: "lightbulb",     label: "Thông minh", value: stats.intelligenceScore,  colorClass: "text-blue-600",   bgClass: "bg-blue-500" },
    { icon: "favorite",      label: "Hạnh phúc",  value: stats.happinessScore,    colorClass: "text-rose-500",   bgClass: "bg-rose-500" },
    { icon: "verified_user", label: "Kỷ luật",    value: stats.disciplineScore,   colorClass: "text-emerald-600",bgClass: "bg-emerald-500" },
  ];

  if (layout === "horizontal") {
    // 2x2 grid, same height as camera (h-36 = 144px)
    return (
      <div className={`h-36 bg-surface/90 backdrop-blur-md border border-surface-variant rounded-2xl p-3 shadow-md flex flex-col justify-between ${className}`}>
        <div className="flex items-center gap-1 pb-1.5 border-b border-surface-variant/50 shrink-0">
          <span className="material-symbols-outlined text-primary text-[14px]">psychology</span>
          <h4 className="font-bold text-xs text-on-surface">Money IQ</h4>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 pt-1.5">
          {metrics.map(({ icon, label, value, colorClass, bgClass }) => (
            <div key={label} className="flex flex-col gap-1 justify-center">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-0.5 text-[10px] text-on-surface-variant font-medium`}>
                  <span className={`material-symbols-outlined text-[12px] ${colorClass}`}>{icon}</span>
                  {label}
                </span>
                <span className="font-bold text-[11px] text-on-surface">{Math.round(value)}</span>
              </div>
              <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${bgClass}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default vertical layout (solo mode)
  return (
    <div className={`w-48 bg-surface/90 backdrop-blur-md border border-surface-variant rounded-2xl p-3 shadow-md flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-surface-variant/50 pb-2">
        <h4 className="font-bold text-sm text-on-surface flex items-center gap-1">
          <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
          Money IQ
        </h4>
      </div>

      <div className="flex flex-col gap-3">
        {metrics.map(({ icon, label, value, colorClass, bgClass }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                <span className={`material-symbols-outlined text-[14px] ${colorClass}`}>{icon}</span>
                {label}
              </span>
              <span className="font-bold text-on-surface">{Math.round(value)}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${bgClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

