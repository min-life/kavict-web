"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type ChatMessage = {
  sender: "user" | "assistant";
  text: string;
};

type FloatingChatbotProps = {
  pathname: string;
};

export default function FloatingChatbot({ pathname }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (pathname.startsWith("/dashboard/profile")) {
    return null;
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message || isSending) {
      return;
    }

    setMessages((current) => [...current, { sender: "user", text: message }]);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message,
          lessonContext: "Khu vực dashboard KAVICT",
        }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      const reply = data.text;

      if (!response.ok || !reply) {
        throw new Error(data.error ?? "Empty AI response");
      }

      setMessages((current) => [
        ...current,
        { sender: "assistant", text: reply },
      ]);
    } catch {
      setError("Không thể kết nối với Kavi. Vui lòng thử lại sau.");
    } finally {
      setIsSending(false);
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {isOpen && (
        <section
          aria-label="Trò chuyện với Kavi"
          className="mb-3 flex h-[min(32rem,calc(100vh-8rem))] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface shadow-2xl"
          role="dialog"
        >
          <header className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <div>
              <h2 className="font-headline-md text-headline-md">Kavi</h2>
              <p className="text-label-sm text-on-surface-variant">
                Trợ lý học tập của bạn
              </p>
            </div>
            <button
              aria-label="Đóng trò chuyện với Kavi"
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                close
              </span>
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="rounded-xl bg-surface-container-high px-3 py-2 text-body-md text-on-surface-variant">
                Xin chào! Mình có thể giúp gì cho bạn?
              </p>
            )}
            {messages.map((item, index) => (
              <p
                className={
                  item.sender === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-primary px-3 py-2 text-body-md text-on-primary"
                    : "max-w-[85%] rounded-xl bg-surface-container-high px-3 py-2 text-body-md text-on-surface"
                }
                key={`${item.sender}-${index}`}
              >
                {item.text}
              </p>
            ))}
            {isSending && (
              <p aria-live="polite" className="text-label-sm text-on-surface-variant">
                Kavi đang trả lời…
              </p>
            )}
            {error && (
              <p aria-live="polite" className="text-label-sm text-error">
                {error}
              </p>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-outline-variant p-3"
            onSubmit={sendMessage}
          >
            <textarea
              aria-label="Tin nhắn cho Kavi"
              autoFocus
              className="min-h-10 flex-1 resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md outline-none transition-colors focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
              disabled={isSending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              value={draft}
            />
            <button
              aria-label="Gửi tin nhắn"
              className="rounded-lg bg-primary px-3 text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!draft.trim() || isSending}
              type="submit"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                send
              </span>
            </button>
          </form>
        </section>
      )}

      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Mở trò chuyện với Kavi"
        className="ml-auto block h-48 w-48 bg-transparent transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <DotLottieReact autoplay loop src="/ai-chat-bot.lottie" />
      </button>
    </div>
  );
}
