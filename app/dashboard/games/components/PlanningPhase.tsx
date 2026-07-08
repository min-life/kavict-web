import { useState, useEffect, useMemo } from "react";
import { GameConfig } from "../services/roomService";
import { CHARACTERS } from "./GameConfigForm";

interface PlanningPhaseProps {
  config: GameConfig;
  planningEndTime?: number;
  onTimeUp: (allocations?: Record<string, number>) => void;
  isHost: boolean;
  onSkip: () => void;
}

export const CATEGORIES: Record<string, string[]> = {
  student: [
    "Ăn uống",
    "Đi lại",
    "Nhu yếu phẩm cá nhân",
    "Học tập",
    "Ăn vặt - Cà phê",
    "Giải trí",
    "Mua sắm quần áo",
    "Quà tặng",
    "Y tế",
    "Chi phí khác"
  ],
  fresh_grad: [
    "Ăn uống",
    "Đi lại",
    "Nhu yếu phẩm cá nhân",
    "Trang phục công sở",
    "Ăn trưa - Cà phê cùng đồng nghiệp",
    "Giải trí",
    "Mua sắm",
    "Thể thao - Tập gym",
    "Quà tặng - Hiếu hỉ",
    "Y tế",
    "Chi phí khác"
  ],
  stable_income: [
    "Ăn uống",
    "Đi lại",
    "Nhu yếu phẩm cá nhân",
    "Chăm sóc sức khỏe",
    "Ăn uống ngoài - Gặp gỡ bạn bè",
    "Giải trí",
    "Mua sắm",
    "Du lịch - Trải nghiệm",
    "Quà tặng - Hiếu hỉ",
    "Đầu tư",
    "Chi phí khác"
  ]
};

export const CATEGORY_STYLES: Record<string, { icon: string; bg: string; text: string }> = {
  "Ăn uống": { icon: "restaurant", bg: "bg-orange-100", text: "text-orange-600" },
  "Đi lại": { icon: "directions_car", bg: "bg-blue-100", text: "text-blue-600" },
  "Nhu yếu phẩm cá nhân": { icon: "shopping_basket", bg: "bg-teal-100", text: "text-teal-600" },
  "Học tập": { icon: "school", bg: "bg-emerald-100", text: "text-emerald-600" },
  "Ăn vặt - Cà phê": { icon: "local_cafe", bg: "bg-amber-100", text: "text-amber-700" },
  "Giải trí": { icon: "movie", bg: "bg-purple-100", text: "text-purple-600" },
  "Mua sắm quần áo": { icon: "checkroom", bg: "bg-pink-100", text: "text-pink-600" },
  "Mua sắm": { icon: "shopping_bag", bg: "bg-pink-100", text: "text-pink-600" },
  "Quà tặng": { icon: "redeem", bg: "bg-red-100", text: "text-red-500" },
  "Quà tặng - Hiếu hỉ": { icon: "volunteer_activism", bg: "bg-red-100", text: "text-red-500" },
  "Y tế": { icon: "medical_services", bg: "bg-rose-100", text: "text-rose-600" },
  "Chăm sóc sức khỏe": { icon: "health_and_safety", bg: "bg-rose-100", text: "text-rose-600" },
  "Chi phí khác": { icon: "category", bg: "bg-gray-100", text: "text-gray-600" },
  "Trang phục công sở": { icon: "work", bg: "bg-indigo-100", text: "text-indigo-600" },
  "Ăn trưa - Cà phê cùng đồng nghiệp": { icon: "groups", bg: "bg-orange-100", text: "text-orange-600" },
  "Thể thao - Tập gym": { icon: "fitness_center", bg: "bg-green-100", text: "text-green-600" },
  "Ăn uống ngoài - Gặp gỡ bạn bè": { icon: "celebration", bg: "bg-yellow-100", text: "text-yellow-600" },
  "Du lịch - Trải nghiệm": { icon: "flight", bg: "bg-sky-100", text: "text-sky-600" },
  "Đầu tư": { icon: "trending_up", bg: "bg-emerald-100", text: "text-emerald-600" },
  "Tiết kiệm": { icon: "savings", bg: "bg-yellow-100", text: "text-yellow-600" }
};

export default function PlanningPhase({ config, planningEndTime, onTimeUp, isHost, onSkip }: PlanningPhaseProps) {
  const character = CHARACTERS.find(c => c.id === config.characterId);
  const categories = CATEGORIES[config.characterId] || CATEGORIES["student"];
  const totalIncomeMonthly = character?.income || 0;
  
  const [timeLeft, setTimeLeft] = useState<number>(config.planningTimeSeconds);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [touchedCategories, setTouchedCategories] = useState<Record<string, boolean>>({});

  const handleAllocationChange = (category: string, value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    setAllocations(prev => ({
      ...prev,
      [category]: numericValue
    }));
    setTouchedCategories(prev => ({
      ...prev,
      [category]: true
    }));
  };

  useEffect(() => {
    if (!planningEndTime) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((planningEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        
        // Auto-fill logic when time is up
        const hasTouchedAny = Object.keys(touchedCategories).length > 0;
        let finalAllocations = { ...allocations };
        
        if (!hasTouchedAny) {
          // If no categories were filled, allocate (income - savingsGoal) evenly
          const unallocated = Math.max(0, totalIncomeMonthly - config.savingsGoal);
          const amountPerCategory = Math.floor(unallocated / categories.length);
          categories.forEach(c => {
            finalAllocations[c] = amountPerCategory;
          });
        }
        
        onTimeUp(finalAllocations);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [planningEndTime, onTimeUp, allocations, touchedCategories, categories, totalIncomeMonthly, config.savingsGoal]);

  const targetTotalSavings = config.savingsGoal * config.durationMonths;
  
  const hasTouchedAny = Object.keys(touchedCategories).length > 0;

  const handleDone = () => {
    onTimeUp(allocations);
  };
  
  const monthlySpending = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + val, 0);
  }, [allocations]);
  
  const totalIncome = totalIncomeMonthly * config.durationMonths;
  const totalPlannedSpending = monthlySpending * config.durationMonths;
  const projectedSavings = totalIncome - totalPlannedSpending;
  
  const isFeasible = projectedSavings >= targetTotalSavings;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (timeLeft / config.planningTimeSeconds) * circumference;

  return (
    <div className="flex-1 w-full h-full flex flex-col p-4 md:p-6 bg-surface overflow-hidden animate-fade-in relative" style={{ width: '100%', minWidth: 0 }}>
      <div className="w-full h-full max-w-6xl mx-auto flex flex-col gap-4 md:gap-6" style={{ width: '100%' }}>
        
        {/* Horizontal Banner Header */}
        <div className="bg-surface-container-low p-4 md:p-6 rounded-2xl border border-surface-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] md:text-[32px]">{character?.icon}</span>
            </div>
            <div>
              <h2 className="font-bold text-lg md:text-xl text-on-surface mb-1">{character?.name}</h2>
              <div className="flex items-center gap-4 text-xs md:text-sm text-on-surface-variant flex-wrap">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">payments</span> Thu nhập: <strong className="text-on-surface">{totalIncomeMonthly.toLocaleString()}đ/tháng</strong></span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_month</span> Thời gian: <strong className="text-on-surface">{config.durationMonths} tháng</strong></span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="var(--color-surface-variant)" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke={timeLeft <= 10 ? "var(--color-error)" : "var(--color-primary)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display font-bold text-xl md:text-2xl ${timeLeft <= 10 ? "text-error animate-pulse" : "text-primary"}`}>
                  {timeLeft}
                </span>
                <span className="text-[9px] md:text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">giây</span>
              </div>
            </div>
            
            <button 
              onClick={handleDone}
              disabled={!hasTouchedAny}
              className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold transition-all shadow-sm shrink-0 ${hasTouchedAny ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
            >
              Xong
            </button>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Left Column: Spending Allocation */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="bg-surface-container-low p-4 md:p-6 rounded-2xl border border-surface-variant shadow-sm flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-variant shrink-0">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">pie_chart</span>
                  Bảng phân bổ chi tiêu
                </h3>
                <span className="text-sm text-on-surface-variant">
                  Còn dư: <strong className="text-primary">{(totalIncomeMonthly - monthlySpending).toLocaleString()}đ</strong>
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 md:pr-3 flex flex-col gap-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-surface-variant/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-outline transition-colors">
                {categories.map((category) => {
                  const style = CATEGORY_STYLES[category] || { icon: "label", bg: "bg-surface-variant", text: "text-on-surface" };
                  const currentVal = allocations[category] || 0;
                  const otherSpending = monthlySpending - currentVal;
                  const maxAllowed = totalIncomeMonthly - otherSpending;

                  return (
                    <div key={category} className="flex flex-col gap-2 py-3 border-b border-surface-variant/50 last:border-0 hover:bg-surface/50 px-2 rounded-xl transition-colors shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
                            <span className="material-symbols-outlined text-[18px] md:text-[20px]">{style.icon}</span>
                          </div>
                          <span className="font-bold text-xs md:text-sm text-on-surface">{category}</span>
                        </div>
                        <span className="font-bold text-sm md:text-base text-primary">{currentVal.toLocaleString()}đ</span>
                      </div>
                      
                      <div className="w-full flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max={Math.max(0, maxAllowed)}
                          step="10000"
                          value={currentVal}
                          onChange={(e) => handleAllocationChange(category, e.target.value)}
                          className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-surface-variant flex justify-between items-center bg-surface px-4 py-3 rounded-xl border shrink-0">
                <span className="font-bold text-on-surface-variant text-xs md:text-sm uppercase">Tổng chi tiêu mỗi tháng</span>
                <span className="font-bold text-lg md:text-xl text-primary">{monthlySpending.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Forecasting */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <div className="bg-surface-container-low p-4 md:p-6 rounded-2xl border border-surface-variant shadow-sm flex-1 flex flex-col min-h-0">
              <h3 className="font-bold text-on-surface mb-3 md:mb-4 flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-tertiary">analytics</span>
                Dự báo cuối game ({config.durationMonths} tháng)
              </h3>
              
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className="flex flex-col gap-1 p-3 bg-surface rounded-xl border border-surface-variant justify-center">
                    <span className="text-xs text-on-surface-variant">Tổng thu nhập</span>
                    <span className="font-bold text-base text-primary truncate">+{totalIncome.toLocaleString()}đ</span>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-3 bg-surface rounded-xl border border-surface-variant justify-center">
                    <span className="text-xs text-on-surface-variant">Tổng chi tiêu</span>
                    <span className="font-bold text-base text-error truncate">-{totalPlannedSpending.toLocaleString()}đ</span>
                  </div>
                </div>
                
                <div className="mt-auto flex flex-col gap-3 shrink-0">
                  <div className="h-px bg-surface-variant w-full my-1"></div>
                  
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-medium text-on-surface">Mục tiêu đề ra</span>
                    <span className="font-bold text-on-surface-variant">{targetTotalSavings.toLocaleString()}đ</span>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${isFeasible ? 'bg-primary-container border-primary/20 text-on-primary-container' : 'bg-error-container border-error/20 text-error'} flex justify-between items-center transition-colors duration-300`}>
                    <span className="text-sm font-medium opacity-80">Tiết kiệm khả thi</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl">{projectedSavings.toLocaleString()}đ</span>
                      <span className="material-symbols-outlined text-[20px]">
                        {isFeasible ? 'check_circle' : 'warning'}
                      </span>
                    </div>
                  </div>
                  
                  {!isFeasible && (
                    <p className="text-xs text-error mt-1 text-center animate-fade-in">
                      Kế hoạch chi tiêu đang vượt mức cho phép. Bạn cần cắt giảm chi tiêu!
                    </p>
                  )}
                  {isFeasible && projectedSavings > targetTotalSavings && (
                    <p className="text-xs text-primary mt-1 text-center animate-fade-in">
                      Tuyệt vời! Bạn đang vượt mục tiêu đề ra.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
