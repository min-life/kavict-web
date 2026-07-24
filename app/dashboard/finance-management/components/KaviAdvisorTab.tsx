"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { AdvisorLaunchRequest } from "./FinanceWorkspace";
import type { FinancialPlan, Transaction } from "@/features/finance/domain";
import type { AdvisorMessage, AdvisorUseCase, FinanceAdvisorResponse } from "@/features/finance/advisor";
import { getFinanceRepository } from "@/features/finance/provider";
import { createLocalSamplePlan, getMonthlySummary, isLocalSampleConfirmation } from "@/features/finance/workspace";

type KaviAdvisorTabProps = { userId: string; plan: FinancialPlan | null; transactions: Transaction[]; onPlanApplied: (plan: FinancialPlan) => Promise<void>; launchRequest?: AdvisorLaunchRequest; onLaunchRequestConsumed?: () => void };
type AdvisorUseCaseCard = { id: Exclude<AdvisorUseCase, "general-advice">; title: string; description: string; icon: string; iconClass: string; greeting: string };

const LOCAL_MESSAGE = "bạn đang ở môi trường local nên không thể kết nối AI. Bạn muốn tôi tạo sample thì hãy enter Yes.";
const ADVISOR_USE_CASES: AdvisorUseCaseCard[] = [
  { id: "financial-planning", title: "Lập kế hoạch tài chính cho bạn", description: "Xây dựng kế hoạch phù hợp với thu nhập, mục tiêu và thời hạn của bạn.", icon: "track_changes", iconClass: "bg-primary/10 text-primary", greeting: "Mình sẽ cùng bạn lập kế hoạch tài chính. Bạn đang có thu nhập, mục tiêu và thời hạn nào?" },
  { id: "spending-analysis", title: "Phân tích chi tiêu của bạn", description: "Xem các khoản chi nổi bật, xu hướng và điểm cần tối ưu.", icon: "monitoring", iconClass: "bg-emerald-500/10 text-emerald-600", greeting: "Mình sẽ phân tích các giao dịch bạn đã ghi nhận để tìm xu hướng chi tiêu và gợi ý tối ưu." },
  { id: "financial-advice", title: "Tư vấn cho bạn về tài chính", description: "Nhận gợi ý tài chính cá nhân theo tình hình hiện tại của bạn.", icon: "forum", iconClass: "bg-violet-500/10 text-violet-600", greeting: "Mình sẵn sàng tư vấn tài chính cho bạn. Điều gì đang khiến bạn băn khoăn nhất?" },
  { id: "plan-adjustment", title: "Chỉnh sửa plan theo thay đổi của bạn", description: "Cập nhật kế hoạch khi thu nhập, mục tiêu hoặc ưu tiên thay đổi.", icon: "edit_note", iconClass: "bg-amber-500/10 text-amber-600", greeting: "Mình sẽ giúp bạn điều chỉnh kế hoạch. Điều gì đã thay đổi so với plan hiện tại?" },
];

function getUseCaseTitle(useCase: AdvisorUseCase) {
  return ADVISOR_USE_CASES.find((item) => item.id === useCase)?.title ?? "Tư vấn tài chính";
}

function getGreeting(useCase: AdvisorUseCase) {
  return ADVISOR_USE_CASES.find((item) => item.id === useCase)?.greeting ?? "Chào bạn, mình là Kavi Advisor. Hãy cho mình biết nhu cầu tài chính của bạn nhé.";
}

export default function KaviAdvisorTab({ userId, plan, transactions, onPlanApplied, launchRequest, onLaunchRequestConsumed }: KaviAdvisorTabProps) {
  const [selectedUseCase, setSelectedUseCase] = useState<AdvisorUseCase | null>(null);
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [quickNeed, setQuickNeed] = useState("");
  const [proposal, setProposal] = useState<FinancialPlan | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const [currentMonthTimestamp] = useState(() => Date.now());
  const monthlySummary = useMemo(() => getMonthlySummary(transactions, currentMonthTimestamp), [currentMonthTimestamp, transactions]);

  const appendAssistant = (text: string) => setMessages((current) => [...current, { sender: "assistant", text }]);
  const scrollToEnd = () => requestAnimationFrame(() => chatEnd.current?.scrollIntoView({ behavior: "smooth" }));

  const askAdvisor = async (message: string, useCase: AdvisorUseCase, history: AdvisorMessage[]) => {
    setIsSending(true);
    try {
      const response = await fetch("/api/finance-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          useCase,
          plan,
          monthlySummary,
          transactions: useCase === "spending-analysis"
            ? transactions.slice(-100).map(({ date, type, category, amount, note }) => ({ date, type, category, amount, note }))
            : undefined,
        }),
      });
      const data = await response.json() as FinanceAdvisorResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể gửi tin nhắn.");
      if (data.fallback) {
        setIsFallbackMode(true);
        appendAssistant(LOCAL_MESSAGE);
        return;
      }
      appendAssistant(data.text || "Mình đã xem thông tin của bạn.");
      setProposal(data.plan);
    } catch (error) {
      appendAssistant(error instanceof Error ? error.message : "Không thể kết nối Kavi Advisor. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
      scrollToEnd();
    }
  };

  const startConversation = useCallback((useCase: AdvisorUseCase) => {
    setSelectedUseCase(useCase);
    setMessages([{ sender: "assistant", text: getGreeting(useCase) }]);
    setInput("");
    setProposal(null);
    setIsFallbackMode(false);
  }, []);

  useEffect(() => {
    if (!launchRequest) return;
    const timeout = window.setTimeout(() => {
      startConversation(launchRequest.useCase);
      setInput(launchRequest.prompt);
      onLaunchRequestConsumed?.();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [launchRequest, onLaunchRequestConsumed, startConversation]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending || !selectedUseCase) return;
    setMessages((current) => [...current, { sender: "user", text: message }]);
    setInput("");

    if (isFallbackMode) {
      if (!isLocalSampleConfirmation(message)) {
        appendAssistant(LOCAL_MESSAGE);
        return;
      }
      const samplePlan = createLocalSamplePlan(Date.now());
      await getFinanceRepository().savePlan(userId, samplePlan);
      await onPlanApplied(samplePlan);
      appendAssistant("Tôi đã tạo sample và đồng bộ vào Kế hoạch & Ngân sách.");
      return;
    }

    await askAdvisor(message, selectedUseCase, messages);
  };

  const startQuickConversation = (event: React.FormEvent) => {
    event.preventDefault();
    const message = quickNeed.trim();
    if (!message || isSending) return;
    const greeting: AdvisorMessage = { sender: "assistant", text: getGreeting("general-advice") };
    setSelectedUseCase("general-advice");
    setMessages([greeting, { sender: "user", text: message }]);
    setQuickNeed("");
    setProposal(null);
    setIsFallbackMode(false);
    void askAdvisor(message, "general-advice", [greeting]);
  };

  const resetConversation = () => {
    setSelectedUseCase(null);
    setMessages([]);
    setInput("");
    setProposal(null);
    setIsFallbackMode(false);
  };

  const applyProposal = async () => {
    if (!proposal) return;
    await getFinanceRepository().savePlan(userId, proposal);
    await onPlanApplied(proposal);
    setProposal(null);
    appendAssistant("Kế hoạch đã được áp dụng và đồng bộ vào tab Kế hoạch & Ngân sách.");
  };

  if (!selectedUseCase) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-primary/5 via-surface to-sky-100/30 p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined rounded-full bg-primary p-2 text-on-primary">smart_toy</span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-on-surface">Kavi Advisor</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Trợ lý tài chính của bạn</span></div></div></div>
          <h3 className="mt-8 text-2xl font-bold text-on-surface sm:text-3xl">Bạn muốn Kavi làm gì cho bạn?</h3>
          <p className="mt-2 text-on-surface-variant">Chọn một nhu cầu để Kavi bắt đầu hỗ trợ bạn nhanh hơn.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ADVISOR_USE_CASES.map((useCase) => <button key={useCase.id} type="button" onClick={() => startConversation(useCase.id)} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><span className={`material-symbols-outlined rounded-full p-4 text-3xl ${useCase.iconClass}`}>{useCase.icon}</span><span className="min-w-0 flex-1"><span className="block font-bold text-on-surface">{useCase.title}</span><span className="mt-1 block text-sm leading-6 text-on-surface-variant">{useCase.description}</span></span><span className="material-symbols-outlined text-on-surface-variant transition group-hover:translate-x-1 group-hover:text-primary">chevron_right</span></button>)}
          </div>
          <form onSubmit={startQuickConversation} className="mt-7 rounded-2xl border border-outline-variant/25 bg-surface/85 p-4 shadow-sm"><label htmlFor="quick-advisor-need" className="block font-bold text-on-surface">Hoặc mô tả nhanh nhu cầu của bạn</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="quick-advisor-need" value={quickNeed} onChange={(event) => setQuickNeed(event.target.value)} placeholder="Ví dụ: Tôi muốn tối ưu chi tiêu hằng tháng và tiết kiệm để mua xe..." className="min-w-0 flex-1 rounded-xl border border-outline-variant/50 bg-surface px-4 py-3 text-sm text-on-surface outline-none focus:border-primary" /><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-on-primary hover:bg-primary-fixed-variant"><span className="material-symbols-outlined">send</span>Gửi</button></div><p className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-base">lock</span>Kavi bảo mật dữ liệu của bạn và chỉ sử dụng để tư vấn.</p></form>
        </section>
        <aside className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm sm:p-6"><h3 className="text-lg font-bold text-on-surface">Kavi sẽ hỗ trợ bạn như thế nào?</h3><p className="mt-2 text-sm text-on-surface-variant">Kavi đồng hành cùng bạn với 3 bước đơn giản:</p><ol className="mt-7 space-y-6">{[["person_search", "Hiểu tình hình hiện tại", "Kavi thu thập và hiểu dữ liệu tài chính của bạn một cách an toàn."], ["query_stats", "Phân tích & đề xuất", "Kavi phân tích, xác định điểm mạnh, điểm cần cải thiện và đề xuất phù hợp."], ["assignment", "Tạo plan phù hợp", "Kavi cùng bạn xây dựng và điều chỉnh kế hoạch để đạt mục tiêu."]].map(([icon, title, description], index) => <li key={title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">{index + 1}</span><span><span className="material-symbols-outlined rounded-full bg-primary/10 p-2 text-primary">{icon}</span><strong className="mt-2 block text-sm text-on-surface">{title}</strong><span className="mt-1 block text-xs leading-5 text-on-surface-variant">{description}</span></span></li>)}</ol><p className="mt-7 rounded-xl bg-primary/5 p-4 text-sm text-on-surface-variant">Chọn một nhu cầu bên trái để bắt đầu trò chuyện với Kavi nhé!</p></aside>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="flex min-h-[38rem] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-sm">
        <header className="flex flex-wrap items-center gap-3 border-b border-outline-variant/20 bg-primary/5 p-5"><span className="material-symbols-outlined rounded-full bg-primary p-2 text-on-primary">smart_toy</span><div className="min-w-0 flex-1"><h2 className="font-bold text-on-surface">Kavi Advisor</h2><p className="truncate text-xs text-on-surface-variant">{isFallbackMode ? "Chế độ local – phản hồi mẫu" : getUseCaseTitle(selectedUseCase)}</p></div><button type="button" onClick={resetConversation} className="rounded-lg px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10">Chọn nhu cầu khác</button></header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((message, index) => <div key={`${message.sender}-${index}`} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-sm bg-primary text-on-primary" : "rounded-bl-sm border border-outline-variant/30 bg-surface-container-lowest text-on-surface"}`}><ReactMarkdown>{message.text}</ReactMarkdown></div></div>)}{isSending && <div className="text-sm text-on-surface-variant">Kavi đang suy nghĩ...</div>}<div ref={chatEnd} /></div>
        <form onSubmit={send} className="flex gap-2 border-t border-outline-variant/20 p-4"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={isFallbackMode ? "Nhập Yes để tạo sample" : "Mô tả tình hình tài chính của bạn..."} className="min-w-0 flex-1 rounded-xl border border-outline-variant/50 bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-primary" /><button disabled={isSending} className="rounded-xl bg-primary px-4 py-2 text-on-primary disabled:opacity-50"><span className="material-symbols-outlined">send</span></button></form>
      </section>
      <aside className="rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm"><h3 className="font-bold text-on-surface">Plan được đề xuất</h3>{proposal ? <><p className="mt-3 text-sm text-on-surface-variant">Thu nhập tháng: <strong className="text-on-surface">{new Intl.NumberFormat("vi-VN").format(proposal.monthlyIncome)} ₫</strong></p><p className="mt-2 text-sm text-on-surface-variant">{proposal.budgets.length} danh mục ngân sách · {proposal.goals.length} mục tiêu</p><button type="button" onClick={() => void applyProposal()} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 font-bold text-on-primary hover:bg-primary-fixed-variant">Áp dụng kế hoạch</button><p className="mt-3 text-xs text-on-surface-variant">Bạn vẫn có thể chỉnh sửa toàn bộ plan ở tab Kế hoạch & Ngân sách.</p></> : <p className="mt-3 text-sm text-on-surface-variant">Kavi sẽ tạo đề xuất sau khi đã hiểu đủ tình hình, thói quen và mục tiêu của bạn.</p>}</aside>
    </div>
  );
}
