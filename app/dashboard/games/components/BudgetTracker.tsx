import { motion } from "framer-motion";

interface BudgetTrackerProps {
  allCategories: string[];              // Full list of character's categories
  plannedAllocations: Record<string, number>; // category -> planned monthly amount (may be missing keys)
  actualSpending: Record<string, number>;     // category -> actual spent so far
  totalAssets: number;                  // Current total assets (balance) of the player
  compact?: boolean;                    // Smaller text/padding for multiplayer mode
}

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  "Ăn uống":                             { icon: "restaurant",        color: "text-orange-500" },
  "Đi lại":                              { icon: "directions_car",    color: "text-blue-500" },
  "Nhu yếu phẩm cá nhân":               { icon: "shopping_basket",   color: "text-teal-500" },
  "Học tập":                             { icon: "school",             color: "text-emerald-500" },
  "Ăn vặt - Cà phê":                    { icon: "local_cafe",         color: "text-amber-600" },
  "Giải trí":                            { icon: "movie",              color: "text-purple-500" },
  "Mua sắm quần áo":                    { icon: "checkroom",          color: "text-pink-500" },
  "Mua sắm":                             { icon: "shopping_bag",      color: "text-pink-500" },
  "Quà tặng":                            { icon: "redeem",             color: "text-red-400" },
  "Quà tặng - Hiếu hỉ":                 { icon: "volunteer_activism", color: "text-red-400" },
  "Y tế":                                { icon: "medical_services",  color: "text-rose-500" },
  "Chăm sóc sức khỏe":                  { icon: "health_and_safety", color: "text-rose-500" },
  "Chi phí khác":                        { icon: "category",           color: "text-gray-400" },
  "Trang phục công sở":                 { icon: "work",               color: "text-indigo-500" },
  "Ăn trưa - Cà phê cùng đồng nghiệp": { icon: "groups",             color: "text-orange-500" },
  "Thể thao - Tập gym":                 { icon: "fitness_center",     color: "text-green-500" },
  "Ăn uống ngoài - Gặp gỡ bạn bè":     { icon: "celebration",        color: "text-yellow-500" },
  "Du lịch - Trải nghiệm":              { icon: "flight",             color: "text-sky-500" },
  "Đầu tư":                              { icon: "trending_up",        color: "text-emerald-500" },
};

export default function BudgetTracker({
  allCategories,
  plannedAllocations,
  actualSpending,
  totalAssets,
  compact = false,
}: BudgetTrackerProps) {
  const p = compact ? "px-3 py-2" : "px-4 py-3";
  const pBody = compact ? "px-3 pb-2 gap-1.5" : "px-4 pb-3 gap-2";
  const iconSize = compact ? "text-[13px]" : "text-[15px]";
  const textSize = compact ? "text-[10px]" : "text-xs";

  return (
    <div className={`bg-surface/95 backdrop-blur-md border border-surface-variant rounded-2xl shadow-lg flex flex-col overflow-hidden ${textSize}`}>
      {/* Header — title + total assets */}
      <div className={`shrink-0 flex items-center justify-between border-b border-surface-variant/50 ${p}`}>
        <div className="flex items-center gap-1.5">
          <span className={`material-symbols-outlined text-primary ${compact ? "text-[15px]" : "text-[17px]"}`}>account_balance_wallet</span>
          <span className="font-bold text-on-surface">Phân bổ ngân sách</span>
        </div>
        <span className="font-bold text-primary">
          {totalAssets.toLocaleString()}đ
        </span>
      </div>

      {/* Category rows — ALL categories, show planned/actual */}
      <div className={`flex flex-col ${pBody}`}>
        {allCategories.map((category) => {
          const planned = plannedAllocations[category] ?? 0;
          const actual  = actualSpending[category]     ?? 0;
          const pct     = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
          const style   = ICON_MAP[category] || { icon: "category", color: "text-gray-400" };

          // Color based on spend ratio
          let barColor = "bg-primary";
          let amountColor = planned === 0 ? "text-on-surface-variant/40" : "text-on-surface";
          if (planned > 0) {
            if (pct >= 90) {
              barColor = "bg-error";
              amountColor = "text-error";
            } else if (pct >= 75) {
              barColor = "bg-amber-400";
              amountColor = "text-amber-600";
            }
          }

          return (
            <div key={category}>
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-on-surface-variant font-medium truncate flex-1">
                  <span className={`material-symbols-outlined ${iconSize} ${style.color} shrink-0`}>{style.icon}</span>
                  <span className="truncate">{category}</span>
                </span>
                <span className={`font-semibold shrink-0 ${amountColor}`}>
                  {planned > 0 ? `${planned.toLocaleString()}đ` : "—"}
                </span>
              </div>
              {/* Always show progress bar */}
              <div className={`w-full bg-surface-variant rounded-full overflow-hidden mt-0.5 ${compact ? "h-0.5" : "h-1"}`}>
                <motion.div
                  className={`h-full rounded-full transition-colors duration-500 ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
