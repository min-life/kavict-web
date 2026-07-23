"use client";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import type { AdvisorMessage, FinanceAdvisorResponse } from "@/features/finance/advisor";
import { getFinanceRepository } from "@/features/finance/provider";
import { getRuntimeCapabilities } from "@/features/runtime/capabilities";
import { runtimeMode } from "@/features/runtime/config";
import { createLocalSamplePlan, getMonthlySummary, isLocalSampleConfirmation } from "@/features/finance/workspace";

type KaviAdvisorTabProps = { userId: string; plan: FinancialPlan | null; transactions: Transaction[]; onPlanApplied: (plan: FinancialPlan) => Promise<void> };
const LOCAL_MESSAGE = "bạn đang ở môi trường local nên không thể kết nối AI. Bạn muốn tôi tạo sample thì hãy enter Yes.";

export default function KaviAdvisorTab({ userId, plan, transactions, onPlanApplied }: KaviAdvisorTabProps) {
  const { aiAvailable } = getRuntimeCapabilities(runtimeMode);
  const [messages, setMessages] = useState<AdvisorMessage[]>([{ sender: "assistant", text: aiAvailable ? "Chào bạn, mình là Kavi Advisor. Hãy kể cho mình về thu nhập, chi tiêu và mục tiêu hiện tại nhé." : LOCAL_MESSAGE }]);
  const [input, setInput] = useState("");
  const [proposal, setProposal] = useState<FinancialPlan | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const [currentMonthTimestamp] = useState(() => Date.now());
  const monthlySummary = useMemo(() => getMonthlySummary(transactions, currentMonthTimestamp), [currentMonthTimestamp, transactions]);

  const appendAssistant = (text: string) => setMessages((current) => [...current, { sender: "assistant", text }]);
  const scrollToEnd = () => requestAnimationFrame(() => chatEnd.current?.scrollIntoView({ behavior: "smooth" }));

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;
    setMessages((current) => [...current, { sender: "user", text: message }]);
    setInput("");
    setIsSending(true);
    try {
      if (!aiAvailable) {
        if (!isLocalSampleConfirmation(message)) { appendAssistant(LOCAL_MESSAGE); return; }
        const samplePlan = createLocalSamplePlan(Date.now());
        await getFinanceRepository().savePlan(userId, samplePlan);
        await onPlanApplied(samplePlan);
        appendAssistant("Tôi đã tạo sample và đồng bộ vào Kế hoạch & Ngân sách.");
        return;
      }
      const response = await fetch("/api/finance-advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: messages, plan, monthlySummary }) });
      const data = await response.json() as FinanceAdvisorResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể gửi tin nhắn.");
      appendAssistant(data.text || "Mình đã xem thông tin của bạn.");
      setProposal(data.plan);
    } catch (error) { appendAssistant(error instanceof Error ? error.message : "Không thể kết nối Kavi Advisor. Vui lòng thử lại.");
    } finally { setIsSending(false); scrollToEnd(); }
  };

  const applyProposal = async () => {
    if (!proposal) return;
    await getFinanceRepository().savePlan(userId, proposal);
    await onPlanApplied(proposal);
    setProposal(null);
    appendAssistant("Kế hoạch đã được áp dụng và đồng bộ vào tab Kế hoạch & Ngân sách.");
  };

  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"><section className="flex min-h-[38rem] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-sm"><header className="flex items-center gap-3 border-b border-outline-variant/20 bg-primary/5 p-5"><span className="material-symbols-outlined rounded-full bg-primary p-2 text-on-primary">smart_toy</span><div><h2 className="font-bold text-on-surface">Kavi Advisor</h2><p className="text-xs text-on-surface-variant">{aiAvailable ? "Tư vấn theo dữ liệu kế hoạch hiện tại" : "Chế độ local – phản hồi mẫu"}</p></div></header><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((message, index) => <div key={`${message.sender}-${index}`} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-sm bg-primary text-on-primary" : "rounded-bl-sm border border-outline-variant/30 bg-surface-container-lowest text-on-surface"}`}><ReactMarkdown>{message.text}</ReactMarkdown></div></div>)}{isSending && <div className="text-sm text-on-surface-variant">Kavi đang suy nghĩ...</div>}<div ref={chatEnd} /></div><form onSubmit={send} className="flex gap-2 border-t border-outline-variant/20 p-4"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={aiAvailable ? "Mô tả tình hình tài chính của bạn..." : "Nhập Yes để tạo sample"} className="min-w-0 flex-1 rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary" /><button disabled={isSending} className="rounded-xl bg-primary px-4 py-2 text-on-primary disabled:opacity-50"><span className="material-symbols-outlined">send</span></button></form></section><aside className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm"><h3 className="font-bold text-on-surface">Plan được đề xuất</h3>{proposal ? <><p className="mt-3 text-sm text-on-surface-variant">Thu nhập tháng: <strong className="text-on-surface">{new Intl.NumberFormat("vi-VN").format(proposal.monthlyIncome)} ₫</strong></p><p className="mt-2 text-sm text-on-surface-variant">{proposal.budgets.length} danh mục ngân sách · {proposal.goals.length} mục tiêu</p><button type="button" onClick={() => void applyProposal()} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-bold text-on-primary hover:bg-primary-fixed-variant">Áp dụng kế hoạch</button><p className="mt-3 text-xs text-on-surface-variant">Bạn vẫn có thể chỉnh sửa toàn bộ plan ở tab Kế hoạch & Ngân sách.</p></> : <p className="mt-3 text-sm text-on-surface-variant">Kavi sẽ tạo đề xuất sau khi đã hiểu đủ tình hình, thói quen và mục tiêu của bạn.</p>}</aside></div>;
}
