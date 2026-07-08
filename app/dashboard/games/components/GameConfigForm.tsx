"use client";

import { useState } from "react";
import { GameConfig } from "../services/roomService";

export interface GameConfigFormProps {
  isHost?: boolean;
  onSubmit: (config: GameConfig) => void;
}

export const CHARACTERS = [
  {
    id: "student",
    name: "Sinh viên",
    description: "Nhận tiền chu cấp hàng tháng. Bắt đầu tập quản lý tài chính cơ bản.",
    icon: "school",
    income: 3000000,
    minSavings: 500000
  },
  {
    id: "fresh_grad",
    name: "Mới đi làm",
    description: "Có thu nhập riêng đầu tiên. Thử thách cân đối chi tiêu.",
    icon: "work",
    income: 5500000,
    minSavings: 1000000
  },
  {
    id: "stable_income",
    name: "Thu nhập ổn định",
    description: "Thu nhập tốt. Yêu cầu kỷ luật tiết kiệm cao hơn.",
    icon: "account_balance_wallet",
    income: 12000000,
    minSavings: 3000000
  }
];

export default function GameConfigForm({ isHost = true, onSubmit }: GameConfigFormProps) {
  const [characterId, setCharacterId] = useState<string>("student");
  const [months, setMonths] = useState<number>(1);
  const [decisionTime, setDecisionTime] = useState<number>(15);
  const [planningTime, setPlanningTime] = useState<number>(60);
  const [error, setError] = useState<string>("");
  const [targetSavings, setTargetSavings] = useState<number>(500000);

  const handleCharacterChange = (id: string) => {
    setCharacterId(id);
    const selectedChar = CHARACTERS.find(c => c.id === id);
    if (selectedChar) {
      setTargetSavings(selectedChar.minSavings);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (months < 1) {
      setError("Số tháng phải tối thiểu là 1.");
      return;
    }
    if (decisionTime < 15) {
      setError("Thời gian ra quyết định tối thiểu 15s.");
      return;
    }
    if (planningTime < 60) {
      setError("Thời gian lên plan chi tiêu tối thiểu 1p (60s).");
      return;
    }
    
    setError("");
    const selectedChar = CHARACTERS.find(c => c.id === characterId);
    
    onSubmit({
      characterId,
      savingsGoal: targetSavings,
      durationMonths: months,
      decisionTimeSeconds: decisionTime,
      planningTimeSeconds: planningTime,
    });
  };

  if (!isHost) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-surface">
        <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] animate-spin">settings</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Chủ phòng đang thiết lập...</h2>
        <p className="text-on-surface-variant">Vui lòng đợi chủ phòng cấu hình màn chơi.</p>
      </div>
    );
  }

  const selectedChar = CHARACTERS.find(c => c.id === characterId);

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 md:p-8 bg-surface animate-fade-in">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Cấu hình màn chơi</h2>
          <p className="text-on-surface-variant text-sm">Thiết lập nhân vật và mục tiêu trước khi bắt đầu</p>
        </div>

        {error && (
          <div className="mb-6 bg-error-container text-error p-3 rounded-lg text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6" style={{ width: '100%' }}>
          
          {/* Left Column: Character & Savings */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-variant shadow-sm flex-1 flex flex-col">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                Chọn nhân vật
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {CHARACTERS.map(char => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => handleCharacterChange(char.id)}
                    className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                      characterId === char.id 
                        ? 'bg-primary/5 border-primary text-on-surface ring-1 ring-primary shadow-sm' 
                        : 'bg-surface border-surface-variant hover:border-primary/50 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center w-full mb-3">
                      <span className={`material-symbols-outlined text-[36px] mb-3 ${characterId === char.id ? 'text-primary' : 'text-on-surface-variant'}`}>{char.icon}</span>
                      <span className={`font-bold text-sm mb-2 whitespace-nowrap ${characterId === char.id ? 'text-primary' : 'text-on-surface'}`}>{char.name}</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed hidden sm:block font-medium px-1">
                        {char.description}
                      </p>
                    </div>
                    <div className="w-full pt-3 border-t border-outline-variant/30 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-on-surface-variant font-medium whitespace-nowrap">Thu nhập:</span>
                        <span className="font-bold text-primary whitespace-nowrap">{char.income.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Target Savings Slider */}
              <div className="mt-5 pt-5 border-t border-surface-variant">
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-tertiary">savings</span>
                  Mục tiêu tiết kiệm (mỗi tháng)
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-on-surface-variant">{selectedChar?.minSavings.toLocaleString()}đ</span>
                    <span className="text-tertiary font-bold text-lg">{targetSavings.toLocaleString()}đ</span>
                    <span className="text-on-surface-variant">{selectedChar?.income.toLocaleString()}đ</span>
                  </div>
                  <input 
                    type="range" 
                    min={selectedChar?.minSavings || 0} 
                    max={selectedChar?.income || 1000000} 
                    step={100000}
                    value={targetSavings}
                    onChange={(e) => setTargetSavings(Number(e.target.value))}
                    className="w-full accent-tertiary h-2 rounded-lg appearance-none cursor-pointer outline-none mt-1"
                    style={{
                      background: `linear-gradient(to right, var(--color-tertiary) ${
                        ((targetSavings - (selectedChar?.minSavings || 0)) / 
                        ((selectedChar?.income || 1) - (selectedChar?.minSavings || 0))) * 100
                      }%, var(--color-surface-variant) ${
                        ((targetSavings - (selectedChar?.minSavings || 0)) / 
                        ((selectedChar?.income || 1) - (selectedChar?.minSavings || 0))) * 100
                      }%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Game Settings & Submit */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-variant shadow-sm flex-1 flex flex-col gap-4">
              <h3 className="font-bold text-on-surface flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Luật chơi
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-surface flex justify-between">Thời gian chơi <span className="text-on-surface-variant font-normal">(tháng)</span></label>
                  <div className="flex items-center justify-between bg-surface border border-outline rounded-xl p-1 focus-within:border-primary focus-within:ring-1 transition-all">
                    <button 
                      type="button" 
                      onClick={() => setMonths(Math.max(1, months - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={months}
                      onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                      className="flex-1 w-full bg-transparent text-center font-bold text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setMonths(months + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-surface flex justify-between">Quyết định <span className="text-on-surface-variant font-normal">(giây)</span></label>
                  <div className="flex items-center justify-between bg-surface border border-outline rounded-xl p-1 focus-within:border-primary focus-within:ring-1 transition-all">
                    <button 
                      type="button" 
                      onClick={() => setDecisionTime(Math.max(15, decisionTime - 5))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <input
                      type="number"
                      min="15"
                      value={decisionTime}
                      onChange={(e) => setDecisionTime(parseInt(e.target.value) || 15)}
                      className="flex-1 w-full bg-transparent text-center font-bold text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setDecisionTime(decisionTime + 5)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-on-surface flex justify-between">Lên kế hoạch <span className="text-on-surface-variant font-normal">(giây)</span></label>
                  <div className="flex items-center justify-between bg-surface border border-outline rounded-xl p-1 focus-within:border-primary focus-within:ring-1 transition-all">
                    <button 
                      type="button" 
                      onClick={() => setPlanningTime(Math.max(60, planningTime - 10))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <input
                      type="number"
                      min="60"
                      value={planningTime}
                      onChange={(e) => setPlanningTime(parseInt(e.target.value) || 60)}
                      className="flex-1 w-full bg-transparent text-center font-bold text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => setPlanningTime(planningTime + 10)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full mt-auto bg-primary text-on-primary py-4 rounded-xl font-bold text-base hover:bg-primary-fixed-variant transition-all hover:shadow-elevation-low active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Bắt đầu <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
