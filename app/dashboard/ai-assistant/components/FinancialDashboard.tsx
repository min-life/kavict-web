"use client";

import { useEffect, useRef, useState } from "react";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import { getFinanceRepository } from "@/features/finance/provider";
import { useAuth } from "@/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { FinancialOverview } from "../../components/FinancialOverview";
import { getRuntimeCapabilities } from "@/features/runtime/capabilities";
import { runtimeMode } from "@/features/runtime/config";

export default function FinancialDashboard({ plan: initialPlan, onEditPlan }: { plan: FinancialPlan, onEditPlan?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<FinancialPlan>(initialPlan);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Drag to scroll refs for suggestions
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingTx, setPendingTx] = useState<Partial<Transaction> | null>(null);
  const recognitionRef = useRef<any>(null);
  const { aiAvailable } = getRuntimeCapabilities(runtimeMode);

  useEffect(() => {
    if (user?.uid) {
      getFinanceRepository().getTransactions(user.uid).then(setTransactions);
    }
  }, [user]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = "vi-VN";
        
        rec.onstart = () => setIsListening(true);
        rec.onresult = async (event: any) => {
          const text = event.results[0][0].transcript;
          handleProcessVoiceInput(text);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleProcessVoiceInput = async (text: string) => {
    if (!aiAvailable) {
      alert("Tính năng phân tích giọng nói AI chưa có trong chế độ demo local. Bạn vẫn có thể thêm giao dịch thủ công.");
      return;
    }

    try {
      const prompt = `Phân tích câu sau thành một giao dịch tài chính:\n"${text}"\n\nTrả về JSON chuẩn xác (không bọc trong markdown tick nếu có thể, hoặc chỉ bọc JSON): { "amount": số_tiền_chính_xác_vnd, "type": "expense" | "income", "category": "phân loại ngắn gọn", "note": "ghi chú ngắn gọn" }. Nếu không rõ số tiền, để 0.`;
      
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction: "Bạn là hệ thống trích xuất dữ liệu tài chính." })
      });
      const data = await res.json();
      
      let aiText = data.text;
      const jsonMatch = aiText.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, aiText];
      
      const parsed = JSON.parse(jsonMatch[1].trim());
      setPendingTx({
        amount: parsed.amount || 0,
        type: parsed.type || "expense",
        category: parsed.category || "Khác",
        note: parsed.note || "",
        date: Date.now()
      });
      setShowConfirmPopup(true);
    } catch (e) {
      console.error(e);
      alert("Không thể phân tích giao dịch. Vui lòng nói rõ số tiền và nội dung.");
    }
  };

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(tx => tx.type === 'expense' && tx.category === category)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const savePendingTx = async () => {
    if (user?.uid && pendingTx) {
      if (pendingTx.id) {
        // Edit mode
        const oldTx = transactions.find(t => t.id === pendingTx.id);
        if (oldTx) {
          let newBalance = plan.currentBalance;
          if (oldTx.type === 'income') newBalance -= oldTx.amount;
          else newBalance += oldTx.amount;
          
          if (pendingTx.type === 'income') newBalance += (pendingTx.amount || 0);
          else newBalance -= (pendingTx.amount || 0);

          await getFinanceRepository().updateTransaction(user.uid, pendingTx.id, pendingTx as Transaction);
          await getFinanceRepository().savePlan(user.uid, { currentBalance: newBalance });
          setPlan(prev => ({...prev, currentBalance: newBalance}));
        }
      } else {
        // Add mode
        await getFinanceRepository().addTransaction(user.uid, pendingTx as Transaction);
        let newBalance = plan.currentBalance;
        if (pendingTx.type === 'income') newBalance += (pendingTx.amount || 0);
        else newBalance -= (pendingTx.amount || 0);
        await getFinanceRepository().savePlan(user.uid, { currentBalance: newBalance });
        setPlan(prev => ({...prev, currentBalance: newBalance}));
      }
      
      setShowConfirmPopup(false);
      setPendingTx(null);
      getFinanceRepository().getTransactions(user.uid).then(setTransactions);
      router.refresh();
    }
  };

  const handleDeleteTx = async (tx: Transaction) => {
    if (!tx.id) return;
    if (user?.uid && confirm("Bạn có chắc muốn xóa giao dịch này?")) {
      await getFinanceRepository().deleteTransaction(user.uid, tx.id);
      let newBalance = plan.currentBalance;
      if (tx.type === 'income') newBalance -= tx.amount;
      else newBalance += tx.amount;
      await getFinanceRepository().savePlan(user.uid, { currentBalance: newBalance });
      setPlan(prev => ({...prev, currentBalance: newBalance}));
      
      getFinanceRepository().getTransactions(user.uid).then(setTransactions);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-6 relative min-h-screen">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <FinancialOverview plan={plan} transactions={transactions} onEditPlan={onEditPlan} />
          
          {/* Budgets Table */}
          <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface">Ngân sách</h3>
              {onEditPlan && (
                <button onClick={onEditPlan} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {plan.budgets?.map(b => {
                const spent = getSpentAmount(b.category);
                const percent = Math.min((spent / b.amount) * 100, 100);
                const itemIcon = b.icon || 'category';
                const itemColor = b.color || 'text-on-surface';
                
                // Trích xuất mã màu tailwind (VD: text-blue-500 -> bg-blue-500/10)
                const bgTint = itemColor.replace('text-', 'bg-') + '/10';

                return (
                  <div key={b.category} className="group p-4 rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 hover:bg-surface-container-lowest transition-all duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgTint} ${itemColor}`}>
                          <span className="material-symbols-outlined text-[20px]">{itemIcon}</span>
                        </div>
                        <span className="font-bold text-on-surface">{b.category}</span>
                      </div>
                      <span className="text-on-surface-variant text-sm font-medium">
                        <span className="text-on-surface font-bold">{new Intl.NumberFormat('vi-VN').format(spent)}</span> / {new Intl.NumberFormat('vi-VN').format(b.amount)} ₫
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-error' : percent > 75 ? 'bg-orange-500' : 'bg-primary'}`} style={{width: `${percent}%`}}></div>
                    </div>
                  </div>
                );
              })}
              {(!plan.budgets || plan.budgets.length === 0) && <p className="text-sm text-on-surface-variant text-center py-4">Chưa có ngân sách nào</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">lightbulb</span> Lời khuyên AI</h3>
            <p className="text-sm">Dựa trên kế hoạch của bạn, hãy cố gắng giữ mức chi tiêu cho ăn uống dưới {(plan.budgets?.find(b => b.category === "Ăn uống")?.amount || 0) / 1000}k trong tuần này để đạt mục tiêu nhé!</p>
            {!aiAvailable && <p className="mt-2 text-xs text-on-surface-variant">Chế độ demo local dùng dữ liệu trên thiết bị; phân tích giọng nói AI chưa khả dụng.</p>}
          </div>

          {/* Mục tiêu tài chính (Sidebar) */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/30">
            <h3 className="font-bold mb-4">Mục tiêu tài chính</h3>
            <div className="flex flex-col gap-3">
              {plan.goals?.map((g, idx) => {
                const itemIcon = g.icon || 'star';
                const itemColor = g.color || 'text-primary';
                const bgTint = itemColor.replace('text-', 'bg-') + '/10';
                
                return (
                  <div key={g.id || idx} className="flex justify-between items-center p-2 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgTint} ${itemColor}`}>
                        <span className="material-symbols-outlined text-[18px]">{itemIcon}</span>
                      </div>
                      <span className="font-bold text-sm text-on-surface">{g.name}</span>
                    </div>
                    <span className="font-bold text-sm text-on-surface">{new Intl.NumberFormat('vi-VN').format(g.targetAmount)} ₫</span>
                  </div>
                );
              })}
              {(!plan.goals || plan.goals.length === 0) && (
                <p className="text-sm text-center text-on-surface-variant py-2">Chưa có mục tiêu nào</p>
              )}
            </div>
          </div>

          {/* Transactions List (Sidebar) */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Giao dịch gần đây</h3>
              <button onClick={() => {
                setPendingTx({ amount: 0, type: 'expense', category: plan.budgets?.[0]?.category || 'Khác', note: '', date: Date.now() });
                setShowConfirmPopup(true);
              }} className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed-variant transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto hide-scrollbar">
              {transactions.map(tx => {
                const txDate = new Date(tx.date);
                const timeString = `${txDate.getHours().toString().padStart(2, '0')}:${txDate.getMinutes().toString().padStart(2, '0')} ${txDate.getDate().toString().padStart(2, '0')}/${(txDate.getMonth() + 1).toString().padStart(2, '0')}`;
                
                let icon = 'category';
                let color = 'text-on-surface-variant';
                if (tx.type === 'income') {
                  icon = tx.category === 'Tiền lương' ? 'payments' : 'category';
                  color = 'text-success';
                } else {
                  const b = plan.budgets?.find(b => b.category === tx.category);
                  if (b) {
                    icon = b.icon || 'category';
                    color = b.color || 'text-on-surface';
                  }
                }
                const bgTint = color.replace('text-', 'bg-') + '/10';

                return (
                  <div key={tx.id} onClick={() => { setPendingTx(tx); setShowConfirmPopup(true); }} className="flex justify-between items-center p-2 rounded-xl hover:bg-surface-container cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgTint} ${color}`}>
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{tx.category}</p>
                        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
                          <span>{timeString}</span>
                          {tx.note && <><span>•</span><span className="truncate max-w-[120px]">{tx.note}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-bold text-sm ${tx.type === 'expense' ? 'text-error' : 'text-success'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(tx.amount)} ₫
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && <p className="text-center text-xs text-on-surface-variant py-2">Chưa có giao dịch</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Voice Action Button */}
      <button 
        onClick={() => recognitionRef.current?.start()}
        className={`fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50 ${isListening ? 'bg-error text-white animate-pulse' : 'bg-primary text-on-primary'}`}
      >
        <span className="material-symbols-outlined text-[28px]">{isListening ? 'mic' : 'mic_none'}</span>
      </button>

      {/* Confirmation Popup */}
      {showConfirmPopup && pendingTx && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-[400px] min-w-[320px] shadow-2xl border border-outline-variant/20">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">edit_square</span>
              Xác nhận giao dịch
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">Loại giao dịch</label>
                <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/30">
                  <button 
                    onClick={() => {
                      setPendingTx({...pendingTx, type: 'expense', category: plan.budgets?.[0]?.category || 'Khác'})
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${pendingTx.type === 'expense' ? 'bg-error text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    Chi tiền
                  </button>
                  <button 
                    onClick={() => {
                      setPendingTx({...pendingTx, type: 'income', category: 'Tiền lương'})
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${pendingTx.type === 'income' ? 'bg-[#10B981] text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    Thu tiền
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant">Số tiền (VNĐ)</label>
                <input type="number" min="1" value={pendingTx.amount || ''} onChange={e => setPendingTx({...pendingTx, amount: Number(e.target.value)})} className="w-full mt-1 border border-outline-variant/50 rounded-lg p-2.5 text-base font-bold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" />
                
                {(pendingTx.amount || 0) > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="flex gap-2 mt-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onMouseDown={(e) => {
                      if (!suggestionsRef.current) return;
                      dragRef.current.isDown = true;
                      dragRef.current.startX = e.pageX - suggestionsRef.current.offsetLeft;
                      dragRef.current.scrollLeft = suggestionsRef.current.scrollLeft;
                    }}
                    onMouseLeave={() => { dragRef.current.isDown = false; }}
                    onMouseUp={() => { dragRef.current.isDown = false; }}
                    onMouseMove={(e) => {
                      if (!dragRef.current.isDown || !suggestionsRef.current) return;
                      e.preventDefault();
                      const x = e.pageX - suggestionsRef.current.offsetLeft;
                      const walk = (x - dragRef.current.startX) * 1.5;
                      suggestionsRef.current.scrollLeft = dragRef.current.scrollLeft - walk;
                    }}
                  >
                    {[1000, 10000, 100000, 1000000].map(mult => {
                       const suggested = (pendingTx.amount || 0) * mult;
                       return (
                        <button key={mult} onClick={() => setPendingTx({...pendingTx, amount: suggested})} className="flex-none px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/30 rounded-md text-xs font-medium text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap">
                          {new Intl.NumberFormat('vi-VN').format(suggested)}
                        </button>
                       );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">Danh mục</label>
                <div className="grid grid-cols-4 gap-2">
                  {pendingTx.type === 'income' ? (
                    <>
                      {[{name: 'Tiền lương', icon: 'payments', color: 'text-success'}, {name: 'Khác', icon: 'category', color: 'text-on-surface-variant'}].map(cat => (
                        <button key={cat.name} onClick={() => setPendingTx({...pendingTx, category: cat.name})} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${pendingTx.category === cat.name ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 hover:bg-surface-container-lowest'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.color} ${cat.color.replace('text-', 'bg-')}/10`}>
                            <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                          </div>
                          <span className={`text-[10px] font-medium text-center leading-tight ${pendingTx.category === cat.name ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{cat.name}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {plan.budgets?.map(b => {
                        const icon = b.icon || 'category';
                        const color = b.color || 'text-on-surface';
                        const isSelected = pendingTx.category === b.category;
                        return (
                          <button key={b.category} onClick={() => setPendingTx({...pendingTx, category: b.category})} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 hover:bg-surface-container-lowest'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} ${color.replace('text-', 'bg-')}/10`}>
                              <span className="material-symbols-outlined text-[16px]">{icon}</span>
                            </div>
                            <span className={`text-[10px] font-medium text-center leading-tight line-clamp-2 ${isSelected ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{b.category}</span>
                          </button>
                        )
                      })}
                      <button onClick={() => setPendingTx({...pendingTx, category: 'Khác'})} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${pendingTx.category === 'Khác' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 hover:bg-surface-container-lowest'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant bg-on-surface-variant/10`}>
                          <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                        </div>
                        <span className={`text-[10px] font-medium text-center leading-tight ${pendingTx.category === 'Khác' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Khác</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant">Ghi chú</label>
                <input type="text" value={pendingTx.note || ''} onChange={e => setPendingTx({...pendingTx, note: e.target.value})} className="w-full mt-1 border border-outline-variant/50 rounded-lg p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Tùy chọn..." />
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              {pendingTx.id ? (
                <button onClick={() => { setShowConfirmPopup(false); handleDeleteTx(pendingTx as Transaction); }} className="px-4 py-2 rounded-lg text-sm font-bold text-error bg-error/10 hover:bg-error/20 transition-colors">Xóa</button>
              ) : <div></div>}
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmPopup(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Hủy</button>
                <button 
                  onClick={savePendingTx} 
                  disabled={!pendingTx.amount || pendingTx.amount <= 0}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary shadow-sm hover:bg-primary-fixed-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Lưu Giao Dịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
