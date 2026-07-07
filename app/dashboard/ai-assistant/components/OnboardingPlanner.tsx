"use client";

import { useState, useRef, useEffect } from "react";
import { saveFinancialPlan } from "@/lib/financeStore";
import { FinancialPlan } from "@/lib/financeTypes";
import { useAuth } from "@/contexts/AuthContext";
import MoneyInput from "./MoneyInput";
import IconPicker from "./IconPicker";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from 'react-markdown';

export default function OnboardingPlanner({ onPlanCreated, initialPlan }: { onPlanCreated: (plan: FinancialPlan) => void, initialPlan?: FinancialPlan }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{sender: "ai"|"user", text: string, showActions?: boolean}[]>([
    { sender: "ai", text: initialPlan ? "Chào bạn! Tôi thấy bạn đã có kế hoạch tài chính. Bạn muốn thay đổi thông số nào? (Thu nhập, ngân sách, mục tiêu...)" : "Chào bạn! Tôi là Kavi, Trợ lý Tài chính AI của bạn. Hãy cùng tôi lên một Kế hoạch tài chính thật xịn nhé. Để bắt đầu, thu nhập hàng tháng hiện tại của bạn khoảng bao nhiêu?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Animation trigger for highlight
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const [formPlan, setFormPlan] = useState<Partial<FinancialPlan>>(initialPlan || {
    currentBalance: 0,
    monthlyIncome: 0,
    fixedExpenses: [],
    goals: [],
    budgets: []
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Remove quick actions from previous messages
    const newMessages = messages.map(m => ({ ...m, showActions: false }));
    newMessages.push({ sender: "user", text, showActions: false });
    
    setMessages(newMessages);
    setInputText("");
    setIsTyping(true);

    try {
      const chatHistory = newMessages.map(m => `${m.sender === "ai" ? "Kavi" : "User"}: ${m.text}`).join("\n");
      const currentPlanStr = JSON.stringify(formPlan, null, 2);
      
      const prompt = `Bạn là Kavi - chuyên gia tư vấn tài chính cá nhân thông minh và thấu hiểu. Dưới đây là dữ liệu Form Kế hoạch hiện tại của User:
${currentPlanStr}

Lịch sử trò chuyện:
${chatHistory}

QUY TRÌNH TƯ VẤN (TUÂN THỦ NGHIÊM NGẶT):

1. BỘ CÂU HỎI BẮT BUỘC (CHECKLIST):
Để lên được một kế hoạch chuẩn xác, bạn BẮT BUỘC phải nắm được đủ 3 thông tin cốt lõi sau từ User:
[ ] 1. Số dư hiện tại
[ ] 2. Thu nhập hàng tháng
[ ] 3. Tiền sinh hoạt dự kiến (hãy gợi ý các khoản: tiền nhà, tiền ăn, tiền học, xăng xe đi lại...)

2. PHÂN TÍCH & TRUY VẤN:
- Bất cứ khi nào nhận tin nhắn, hãy tự kiểm kê xem trong 3 thông tin trên, thông tin nào đã có, thông tin nào còn thiếu.
- NẾU THIẾU BẤT KỲ THÔNG TIN NÀO trong checklist: TUYỆT ĐỐI KHÔNG lên kế hoạch, KHÔNG ĐƯỢC xuất [CONFIRM_REQUIRED]. BẠN PHẢI đặt câu hỏi dẫn dắt để moi bằng được các thông tin còn thiếu.
- TRƯỜNG HỢP NGOẠI LỆ (ỦY QUYỀN): Nếu User trả lời "không biết", "không rõ", hoặc bảo "Kavi tự quyết định/tự ước lượng/tự lên kế hoạch" đối với bất kỳ thông tin nào (đặc biệt là tiền sinh hoạt), BẠN ĐƯỢC PHÉP BỎ QUA CHECKLIST. Hãy TỰ ĐỘNG ƯỚC LƯỢNG một mức phân bổ hợp lý (Ví dụ: áp dụng quy tắc 50/30/20 hoặc ước lượng chi phí sinh hoạt dựa trên Thu nhập) và TIẾN THẲNG ĐẾN BƯỚC 3.

3. ĐÁNH GIÁ & LÊN KẾ HOẠCH (Chỉ khi đã full checklist):
- KHI VÀ CHỈ KHI đã gom đủ cả 3 thông tin trên (và Mục tiêu nếu User có nhắc đến), hãy tính toán xem với (Thu nhập - Sinh hoạt) thì mục tiêu có khả thi không.
  + Nếu KHÔNG KHẢ THI (bị âm tiền hoặc thời gian quá ngắn): Phân tích lý do và khuyên User điều chỉnh. Không xuất [CONFIRM_REQUIRED].
  + Nếu KHẢ THI: TRÌNH BÀY RÕ RÀNG KẾ HOẠCH BẠN SẼ TẠO:
    * "Số dư & Thu nhập": ...
    * "Ngân sách chi tiêu": [Tiền nhà, Ăn uống, Đi lại...] - [Số tiền phân bổ]. LƯU Ý: Tuyệt đối không đưa "Tiết kiệm" vào danh sách ngân sách chi tiêu này. Tiền tiết kiệm dư ra sẽ tự động cộng dồn vào cuối tháng.
    * "Mục tiêu tài chính" (nếu có): [Tên] - [Số tiền]

4. ĐIỀU KIỆN ĐỂ HỎI XÁC NHẬN: 
- Bạn CHỈ ĐƯỢC PHÉP hỏi xác nhận bằng mã [CONFIRM_REQUIRED] KHI VÀ CHỈ KHI bạn vừa trình bày xong Kế hoạch khả thi ở Bước 3, HOẶC User ra lệnh trực tiếp bỏ qua quy trình (Ví dụ: "Thêm ngay cho tôi mục tiêu mua xe").
- Tuyệt đối không xuất [CONFIRM_REQUIRED] nếu chưa gom đủ thông tin hoặc chưa trình bày rõ Plan.

5. XUẤT JSON (Chỉ khi được đồng ý): 
- Khi và chỉ khi User trả lời "Đồng ý", "Ok", "Cập nhật đi"... với câu hỏi xác nhận trước đó, bạn mới được xuất JSON.
- Trả về TOÀN BỘ dữ liệu Form (kế thừa dữ liệu cũ, ghi đè/thêm dữ liệu mới).
- JSON PHẢI được bọc trong \`\`\`json và \`\`\`.

QUY TẮC ĐIỀN JSON:
- ĐỊNH DẠNG SỐ: Các trường tiền tệ PHẢI LÀ SỐ NGUYÊN (Ví dụ: 15 triệu -> 15000000). TUYỆT ĐỐI KHÔNG ghi chữ vào các trường này.
- QUY TẮC MAP NGÂN SÁCH (BUDGETS): Mảng \`budgets\` CHỈ dùng để chứa các khoản CHI TIÊU (Ví dụ: Tiền thuê nhà, Tiền ăn uống, Chi phí đi lại, Chi phí cố định khác). TUYỆT ĐỐI KHÔNG ĐƯỢC đưa các từ khóa như "Tiết kiệm", "Quỹ tiết kiệm", "Quỹ dự phòng" vào mảng \`budgets\`. Việc tiết kiệm được bao nhiêu sẽ được hệ thống tự tính vào cuối tháng dựa trên số dư!
- TRƯỜNG TÊN: Các trường name (của goal) và category (của budget) chỉ chứa tên (Ví dụ: "Tiết kiệm mua xe", "Ăn uống"), TUYỆT ĐỐI KHÔNG chứa số tiền trong tên.
- CHỌN ICON & MÀU SẮC: Mỗi budget và goal khi thêm mới BẮT BUỘC phải có:
  + \`icon\`: Tên icon theo Material Symbols (Ví dụ: savings, restaurant, directions_car, shopping_cart, home, flight, school).
  + \`color\`: Chọn 1 mã màu Tailwind (Ví dụ: text-blue-500, text-green-500, text-orange-500, text-purple-500, text-red-500, text-yellow-500).`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction: "Bạn là Kavi, trợ lý tài chính thông minh, nhiệt tình và cẩn thận." })
      });
      const data = await res.json();
      
      let aiText = data.text;
      let hasJsonUpdate = false;
      
      // Try to parse JSON if exists
      const jsonMatch = aiText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          const parsedPlan = JSON.parse(jsonMatch[1]);
          setFormPlan(parsedPlan);
          setLastUpdated(Date.now()); // Trigger highlight animation
          aiText = aiText.replace(jsonMatch[0], "").trim();
          hasJsonUpdate = true;
          if (!aiText) aiText = "Tôi đã cập nhật thông tin vào bản kế hoạch bên phải nhé!";
        } catch (e) {
          console.error("Failed to parse JSON plan from AI", e);
        }
      }

      const showActions = aiText.includes("[CONFIRM_REQUIRED]");
      aiText = aiText.replace("[CONFIRM_REQUIRED]", "").trim();

      setMessages(prev => [...prev, { sender: "ai", text: aiText, showActions }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "ai", text: "Xin lỗi, tôi đang gặp sự cố. Bạn vui lòng thử lại sau nhé.", showActions: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user) return;
    const finalPlan = {
      ...formPlan,
      createdAt: Date.now(),
      updatedAt: Date.now()
    } as FinancialPlan;
    
    await saveFinancialPlan(user.uid, finalPlan);
    onPlanCreated(finalPlan);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] w-full">
      {/* Chat Area */}
      <div className="flex flex-col flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] shadow-sm overflow-hidden h-full">
        <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined">smart_toy</span>
          </div>
          <div>
            <h3 className="font-bold text-on-surface">Kavi AI</h3>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Đang trực tuyến
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} group`}>
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.sender === "user" ? "bg-primary text-on-primary rounded-tr-sm" : "bg-surface border border-outline-variant/30 text-on-surface rounded-tl-sm"}`}>
                  <div className={`whitespace-pre-wrap leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&_strong]:font-bold [&_em]:italic`}>
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.showActions && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant/30">
                      <button onClick={() => handleSendMessage("Đồng ý")} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-fixed-variant transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Đồng ý cập nhật
                      </button>
                      <button onClick={() => handleSendMessage("Không, để tôi tự sửa")} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-highest text-on-surface-variant font-bold text-xs rounded-xl hover:bg-outline-variant/20 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">cancel</span> Từ chối
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(msg.text);
                    setCopiedIndex(idx);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className={`p-1.5 rounded-full bg-surface text-on-surface-variant border border-outline-variant/30 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-surface-container hover:text-primary transition-all shrink-0`}
                  title="Copy tin nhắn"
                >
                  <span className="material-symbols-outlined text-[16px] block">
                    {copiedIndex === idx ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-surface p-3 rounded-2xl rounded-tl-sm border border-outline-variant/30 flex gap-1 items-center shadow-sm">
                 <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                 <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                 <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} className="flex gap-2 relative items-end">
            <TextareaAutosize
              minRows={1}
              maxRows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              placeholder="Nhắn tin cho Kavi..."
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-none hide-scrollbar"
            />
            <button type="submit" disabled={isTyping || !inputText.trim()} className="absolute right-1.5 bottom-1.5 w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 hover:bg-primary-fixed-variant transition-transform hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Form Area (Always Visible) */}
      <div className={`flex flex-col flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] shadow-sm overflow-hidden h-full transition-all duration-500 ${lastUpdated ? 'ring-2 ring-primary/50 shadow-primary/20 bg-primary/5' : ''}`}>
        <div className="bg-surface p-4 border-b border-outline-variant/30 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">edit_document</span> Kế Hoạch Tài Chính
          </h2>
          {lastUpdated > 0 && (
            <span key={lastUpdated} className="bg-success-container text-success px-2 py-1 rounded-md text-xs font-bold animate-pulse flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> Đã cập nhật
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar bg-surface-container-lowest">
          {/* Top Inputs: Income & Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-surface p-4 rounded-2xl border border-outline-variant/30 shadow-sm hover:border-primary/40 transition-colors">
              <label className="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                Thu nhập hàng tháng
              </label>
              <div className="flex items-center">
                <MoneyInput 
                  value={formPlan.monthlyIncome || 0} 
                  onChange={val => setFormPlan({...formPlan, monthlyIncome: val})} 
                  className="w-full bg-transparent border-none text-xl font-bold text-on-surface focus:ring-0 outline-none p-0" 
                  placeholder="0" 
                  suggestionClassName="left-0"
                />
                <span className="text-lg text-on-surface-variant font-bold ml-2">₫</span>
              </div>
            </div>
            
            <div className="relative bg-surface p-4 rounded-2xl border border-outline-variant/30 shadow-sm hover:border-primary/40 transition-colors">
              <label className="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
                Số dư hiện tại
              </label>
              <div className="flex items-center">
                <MoneyInput 
                  value={formPlan.currentBalance || 0} 
                  onChange={val => setFormPlan({...formPlan, currentBalance: val})} 
                  className="w-full bg-transparent border-none text-xl font-bold text-on-surface focus:ring-0 outline-none p-0" 
                  placeholder="0" 
                />
                <span className="text-lg text-on-surface-variant font-bold ml-2">₫</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-warning text-[24px]">pie_chart</span> Ngân sách dự kiến
              </h3>
              <button onClick={() => setFormPlan({...formPlan, budgets: [...(formPlan.budgets || []), {category: "", amount: 0}]})} className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
            
            {formPlan.budgets?.length === 0 && <p className="text-sm text-on-surface-variant italic bg-surface-container-lowest p-4 rounded-xl border border-dashed border-outline-variant">Chưa có danh mục nào. Hãy yêu cầu Kavi phân bổ giúp bạn!</p>}
            
            <div className="space-y-3">
              {formPlan.budgets?.map((b, idx) => (
                <div key={idx} className="relative flex gap-4 items-center bg-surface p-3 rounded-2xl border border-outline-variant/30 hover:border-primary/50 hover:shadow-sm transition-all group">
                  <IconPicker 
                    currentIcon={b.icon || "restaurant"} 
                    currentColor={b.color} 
                    currentBg={b.color?.replace("text-", "bg-").replace("-500", "-100").replace("-600", "-100")}
                    onSelect={(data) => {
                      const newB = [...(formPlan.budgets || [])];
                      newB[idx].icon = data.icon;
                      newB[idx].color = data.color;
                      if (data.name && !newB[idx].category) newB[idx].category = data.name;
                      setFormPlan({...formPlan, budgets: newB});
                    }}
                  >
                    <div className={`w-12 h-12 rounded-full ${b.color ? b.color.replace('text-', 'bg-').replace('-500', '-100').replace('-600', '-100') : 'bg-orange-100'} ${b.color || 'text-orange-500'} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[24px]">{b.icon || "restaurant"}</span>
                    </div>
                  </IconPicker>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <input type="text" value={b.category} onChange={e => {
                      const newB = [...(formPlan.budgets || [])];
                      newB[idx].category = e.target.value;
                      setFormPlan({...formPlan, budgets: newB});
                    }} className="bg-transparent border-none p-0 text-base font-bold text-on-surface outline-none focus:ring-0 placeholder:font-normal placeholder:text-outline" placeholder="Tên danh mục..." />
                  </div>
                  
                  <div className="flex items-center gap-1 border-b border-outline-variant/50 focus-within:border-primary pb-1">
                    <MoneyInput 
                      value={b.amount || 0} 
                      onChange={val => {
                        const newB = [...(formPlan.budgets || [])];
                        newB[idx].amount = val;
                        setFormPlan({...formPlan, budgets: newB});
                      }} 
                      className="w-[120px] xl:w-[150px] text-right bg-transparent border-none p-0 text-base font-bold text-on-surface focus:ring-0 outline-none" 
                      suggestionClassName="right-3 max-w-[85%] sm:max-w-[60%]"
                      placeholder="0" 
                    />
                    <span className="text-sm text-on-surface-variant font-bold">₫</span>
                  </div>
                  
                  <button onClick={() => {
                    const newB = formPlan.budgets?.filter((_, i) => i !== idx);
                    setFormPlan({...formPlan, budgets: newB});
                  }} className="text-error opacity-0 group-hover:opacity-100 p-2 hover:bg-error-container rounded-full transition-all shrink-0">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[24px]">target</span> Mục tiêu tài chính
              </h3>
              <button onClick={() => setFormPlan({...formPlan, goals: [...(formPlan.goals || []), {id: Date.now().toString(), name: "", targetAmount: 0, currentAmount: 0}]})} className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
            
            {formPlan.goals?.length === 0 && <p className="text-sm text-on-surface-variant italic bg-surface-container-lowest p-4 rounded-xl border border-dashed border-outline-variant">Bạn chưa có mục tiêu nào (VD: Mua xe, Đám cưới...)</p>}
            
            <div className="space-y-3">
              {formPlan.goals?.map((g, idx) => (
                <div key={idx} className="relative flex gap-4 items-center bg-surface p-3 rounded-2xl border border-outline-variant/30 hover:border-primary/50 hover:shadow-sm transition-all group">
                  <IconPicker 
                    currentIcon={g.icon || "flag"} 
                    currentColor={g.color} 
                    currentBg={g.color?.replace("text-", "bg-").replace("-500", "-100").replace("-600", "-100")}
                    onSelect={(data) => {
                      const newG = [...(formPlan.goals || [])];
                      newG[idx].icon = data.icon;
                      newG[idx].color = data.color;
                      if (data.name && !newG[idx].name) newG[idx].name = data.name;
                      setFormPlan({...formPlan, goals: newG});
                    }}
                  >
                    <div className={`w-12 h-12 rounded-full ${g.color ? g.color.replace('text-', 'bg-').replace('-500', '-100').replace('-600', '-100') : 'bg-blue-100'} ${g.color || 'text-blue-500'} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[24px]">{g.icon || "flag"}</span>
                    </div>
                  </IconPicker>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <input type="text" value={g.name} onChange={e => {
                      const newG = [...(formPlan.goals || [])];
                      newG[idx].name = e.target.value;
                      setFormPlan({...formPlan, goals: newG});
                    }} className="bg-transparent border-none p-0 text-base font-bold text-on-surface outline-none focus:ring-0 placeholder:font-normal placeholder:text-outline" placeholder="Tên mục tiêu..." />
                  </div>
                  
                  <div className="flex items-center gap-1 border-b border-outline-variant/50 focus-within:border-primary pb-1">
                    <MoneyInput 
                      value={g.targetAmount || 0} 
                      onChange={val => {
                        const newG = [...(formPlan.goals || [])];
                        newG[idx].targetAmount = val;
                        setFormPlan({...formPlan, goals: newG});
                      }} 
                      className="w-[120px] xl:w-[150px] text-right bg-transparent border-none p-0 text-base font-bold text-on-surface focus:ring-0 outline-none" 
                      suggestionClassName="right-3 max-w-[85%] sm:max-w-[60%]"
                      placeholder="0" 
                    />
                    <span className="text-sm text-on-surface-variant font-bold">₫</span>
                  </div>
                  
                  <button onClick={() => {
                    const newG = formPlan.goals?.filter((_, i) => i !== idx);
                    setFormPlan({...formPlan, goals: newG});
                  }} className="text-error opacity-0 group-hover:opacity-100 p-2 hover:bg-error-container rounded-full transition-all shrink-0">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface shrink-0 flex justify-end">
          <button onClick={handleSavePlan} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary-fixed-variant transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">save</span> Lưu Kế Hoạch
          </button>
        </div>
      </div>
    </div>
  );
}
