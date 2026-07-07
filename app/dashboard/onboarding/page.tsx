"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

const STEPS_DATA = [
  {
    step: 1,
    title: "Bạn tên là gì?",
    icon: "person",
  },
  {
    step: 2,
    title: "Hiện tại bạn thuộc nhóm nào?",
    icon: "groups",
  },
  {
    step: 3,
    title: "Thu nhập trung bình mỗi tháng?",
    icon: "payments",
  },
  {
    step: 4,
    title: "Khoản chi tiêu nhiều nhất hàng tháng?",
    icon: "shopping_cart",
  },
  {
    step: 5,
    title: "Mục tiêu tài chính gần nhất của bạn?",
    icon: "track_changes",
  }
];

const OCCUPATION_OPTIONS = [
  { label: "Sinh viên", icon: "school" },
  { label: "Người mới đi làm", icon: "work_history" },
  { label: "Freelancer", icon: "laptop_mac" },
  { label: "Nhân viên văn phòng", icon: "business" },
  { label: "Chủ doanh nghiệp", icon: "storefront" },
  { label: "Khác", icon: "more_horiz" }
];

const INCOME_OPTIONS = [
  { label: "Chưa có thu nhập", icon: "money_off" },
  { label: "Dưới 3 triệu", icon: "savings" },
  { label: "3 - 5 triệu", icon: "account_balance_wallet" },
  { label: "5 - 8 triệu", icon: "monetization_on" },
  { label: "8 - 12 triệu", icon: "credit_card" },
  { label: "Trên 12 triệu", icon: "diamond" }
];

const EXPENSE_OPTIONS = [
  { label: "Ăn uống", icon: "restaurant" },
  { label: "Đi lại", icon: "directions_car" },
  { label: "Cà phê / trà sữa / ăn ngoài", icon: "local_cafe" },
  { label: "Mua sắm", icon: "local_mall" },
  { label: "Học tập / công việc", icon: "auto_stories" },
  { label: "Giải trí", icon: "theater_comedy" },
  { label: "Tiền thuê nhà / sinh hoạt cố định", icon: "home" },
  { label: "Khác", icon: "more_horiz" }
];

const GOAL_OPTIONS = [
  { label: "Tiết kiệm một khoản tiền", icon: "savings" },
  { label: "Mua một món đồ cụ thể", icon: "shopping_bag" },
  { label: "Trả nợ", icon: "receipt_long" },
  { label: "Tạo quỹ khẩn cấp", icon: "health_and_safety" },
  { label: "Kiểm soát chi tiêu tốt hơn", icon: "query_stats" },
  { label: "Chưa rõ, muốn được gợi ý", icon: "help_outline" }
];

export default function OnboardingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0); // Step 0 = Welcome Card
  const [preferredName, setPreferredName] = useState(user?.displayName || "");
  const [occupationGroup, setOccupationGroup] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [highestExpenses, setHighestExpenses] = useState<string[]>([]);
  const [financialGoal, setFinancialGoal] = useState("");
  const [financialGoalOther, setFinancialGoalOther] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);

  const triggerStepChange = (nextStep: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimating(false);
    }, 180);
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (currentStep === 0) {
      triggerStepChange(1);
      return;
    }
    if (currentStep === 1 && !preferredName.trim()) {
      setError("Vui lòng nhập tên của bạn.");
      return;
    }
    if (currentStep === 2 && !occupationGroup) {
      setError("Vui lòng chọn nhóm của bạn.");
      return;
    }
    if (currentStep === 3 && !monthlyIncome) {
      setError("Vui lòng chọn mức thu nhập.");
      return;
    }
    if (currentStep === 4 && highestExpenses.length === 0) {
      setError("Vui lòng chọn ít nhất một khoản chi.");
      return;
    }
    if (currentStep === 5 && !financialGoal) {
      setError("Vui lòng chọn mục tiêu của bạn.");
      return;
    }

    if (currentStep < 5) {
      triggerStepChange(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 0) {
      triggerStepChange(currentStep - 1);
    }
  };

  const toggleExpense = (expense: string) => {
    if (highestExpenses.includes(expense)) {
      setHighestExpenses(highestExpenses.filter(e => e !== expense));
    } else {
      setHighestExpenses([...highestExpenses, expense]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Không tìm thấy thông tin đăng nhập.");
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile(user, { displayName: preferredName });
      const finalGoal = financialGoal === "Mua một món đồ cụ thể" && financialGoalOther
        ? `Mua một món đồ cụ thể: ${financialGoalOther}`
        : financialGoal;

      await setDoc(doc(db, "users", user.uid), {
        preferredName,
        occupationGroup,
        monthlyIncome,
        highestExpenses,
        financialGoal: finalGoal,
        onboarded: true,
        createdAt: serverTimestamp()
      }, { merge: true });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  if (userProfile?.onboarded) {
    router.push("/dashboard");
    return null;
  }

  const activeStepInfo = currentStep > 0 ? STEPS_DATA[currentStep - 1] : null;
  const progressPercentage = currentStep > 0 ? (currentStep / 5) * 100 : 0;

  // Validation to enable/disable Next button
  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return preferredName.trim().length > 0;
    if (currentStep === 2) return occupationGroup !== "";
    if (currentStep === 3) return monthlyIncome !== "";
    if (currentStep === 4) return highestExpenses.length > 0;
    if (currentStep === 5) {
      if (financialGoal === "Mua một món đồ cụ thể") return financialGoalOther.trim().length > 0;
      return financialGoal !== "";
    }
    return false;
  };

  return (
    <div className="min-h-screen w-full bg-surface-container-low flex flex-col items-center justify-center p-4 md:p-8">
      {/* Container Thẻ */}
      <div className="w-full max-w-[620px] bg-surface-container-lowest rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-outline-variant/20 overflow-hidden flex flex-col transition-all duration-300">

        {/* Header Thanh Tiến Trình (chỉ hiện từ bước 1 trở đi) */}
        {currentStep > 0 && (
          <div className="bg-surface px-6 py-4 md:px-8 border-b border-outline-variant/30">
            <div className="flex justify-between items-center mb-2">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                Bước {currentStep} trên 5
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {Math.round(progressPercentage)}% hoàn thành
              </span>
            </div>
            <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Khung Nội Dung Câu Hỏi */}
        {currentStep === 0 ? (
          <div className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
              <span className="material-symbols-outlined text-[42px]">rocket_launch</span>
            </div>
            <h1 className="font-headline-md text-[28px] text-on-surface font-bold mb-6 tracking-tight">
              Chào mừng đến với KAVICT! 🎉
            </h1>
            <div className="w-full p-4 bg-surface rounded-2xl border border-outline-variant/30 flex items-center gap-3 text-left mb-6">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
              <span className="font-label-md text-sm text-on-surface-variant font-medium">
                Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ dùng để cá nhân hóa gợi ý tài chính.
              </span>
            </div>
            <button
              onClick={() => handleNext()}
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold hover:bg-primary-fixed-variant transition-all flex items-center justify-center gap-1.5 shadow-sm mt-4"
            >
              Thiết lập lộ trình ngay
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
            <div className={`transition-all duration-200 transform ${animating ? "opacity-0 translate-y-2 scale-98" : "opacity-100 translate-y-0 scale-100"}`}>
              {activeStepInfo && (
                <div>
                  {/* Icon & Question Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">
                        {activeStepInfo.icon}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                        {activeStepInfo.title}
                      </h2>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2 mb-6 animate-pulse">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      {error}
                    </div>
                  )}

                  {/* Render Form chi tiết */}
                  <div className="space-y-3">

                    {/* Step 1: Nhập tên */}
                    {currentStep === 1 && (
                      <form onSubmit={handleNext}>
                        <input
                          type="text"
                          autoFocus
                          className="w-full h-14 px-4 rounded-xl border border-outline bg-surface-bright font-body-lg text-body-lg text-on-surface placeholder:text-outline/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                          placeholder="VD: Gia Vĩ"
                          value={preferredName}
                          onChange={(e) => setPreferredName(e.target.value)}
                        />
                      </form>
                    )}

                    {/* Step 2: Nhóm đối tượng (Khối vuông) */}
                    {currentStep === 2 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {OCCUPATION_OPTIONS.map(opt => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              setOccupationGroup(opt.label);
                            }}
                            className={`group flex flex-col items-center justify-center p-4 h-[124px] rounded-2xl border text-center cursor-pointer transition-all duration-200 relative ${occupationGroup === opt.label ? 'bg-primary/5 border-primary text-primary font-semibold' : 'border-outline-variant/60 bg-surface-bright hover:border-outline hover:bg-surface'}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-200 ${occupationGroup === opt.label ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'}`}>
                              <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                            </div>
                            <span className="font-body-md text-xs md:text-sm text-on-surface leading-tight select-none">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step 3: Thu nhập (Khối vuông) */}
                    {currentStep === 3 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {INCOME_OPTIONS.map(opt => (
                          <button 
                            key={opt.label}
                            onClick={() => {
                              setMonthlyIncome(opt.label);
                            }}
                            className={`group flex flex-col items-center justify-center px-1.5 py-4 sm:p-4 h-[124px] rounded-2xl border text-center cursor-pointer transition-all duration-200 relative ${monthlyIncome === opt.label
                                ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                                : 'border-outline-variant/60 bg-surface-bright hover:border-outline hover:bg-surface'
                              }`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-200 ${monthlyIncome === opt.label ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                              }`}>
                              <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                            </div>
                            <span className="font-body-md text-[11px] sm:text-xs md:text-sm text-on-surface leading-tight select-none whitespace-nowrap">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Step 4: Chi tiêu nhiều nhất (Khối vuông) */}
                    {currentStep === 4 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {EXPENSE_OPTIONS.map(opt => {
                          const isChecked = highestExpenses.includes(opt.label);
                          return (
                            <button
                              key={opt.label}
                              onClick={() => toggleExpense(opt.label)}
                              className={`group flex flex-col items-center justify-center p-4 h-[124px] rounded-2xl border text-center cursor-pointer transition-all duration-200 relative ${isChecked
                                  ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                                  : 'border-outline-variant/60 bg-surface-bright hover:border-outline hover:bg-surface'
                                }`}
                            >
                              {isChecked && (
                                <span className="absolute top-2 right-2 material-symbols-outlined text-primary text-[18px] bg-surface-container-lowest rounded-full">check_circle</span>
                              )}
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-200 ${isChecked ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                                }`}>
                                <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                              </div>
                              <span className="font-body-md text-xs md:text-sm text-on-surface leading-tight select-none">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step 5: Mục tiêu (Khối vuông) */}
                    {currentStep === 5 && (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {GOAL_OPTIONS.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => setFinancialGoal(opt.label)}
                              className={`group flex flex-col items-center justify-center p-4 h-[124px] rounded-2xl border text-center cursor-pointer transition-all duration-200 relative ${financialGoal === opt.label
                                  ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                                  : 'border-outline-variant/60 bg-surface-bright hover:border-outline hover:bg-surface'
                                }`}
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors duration-200 ${financialGoal === opt.label ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                                }`}>
                                <span className="material-symbols-outlined text-[22px]">{opt.icon}</span>
                              </div>
                              <span className="font-body-md text-xs md:text-sm text-on-surface leading-tight select-none">{opt.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Extra input for specific purchase goal */}
                        {financialGoal === 'Mua một món đồ cụ thể' && (
                          <div className="mt-2 transition-all duration-300">
                            <input
                              type="text"
                              autoFocus
                              className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-bright font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                              placeholder="Món đồ đó là gì? VD: Màn hình phụ..."
                              value={financialGoalOther}
                              onChange={(e) => setFinancialGoalOther(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="pt-6 border-t border-outline-variant/30 flex gap-4 mt-8">
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 h-12 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-xl font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại
              </button>

              {isStepValid() && (
                <button
                  onClick={() => handleNext()}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold hover:bg-primary-fixed-variant transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Đang xử lý...
                    </>
                  ) : currentStep === 5 ? (
                    <>
                      Hoàn thành
                      <span className="material-symbols-outlined text-[18px]">done</span>
                    </>
                  ) : (
                    <>
                      Tiếp tục
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
