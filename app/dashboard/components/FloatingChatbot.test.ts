import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentPath = resolve(__dirname, "FloatingChatbot.tsx");
const readComponentSource = () => (
  existsSync(componentPath) ? readFileSync(componentPath, "utf8") : ""
);

describe("FloatingChatbot contract", () => {
  it("keeps the mascot animated and hides all chat UI on Profile", () => {
    const source = readComponentSource();

    expect(existsSync(componentPath)).toBe(true);
    expect(source).toContain("@lottiefiles/dotlottie-react");
    expect(source).toContain('src="/ai-chat-bot.lottie"');
    expect(source).toContain("autoplay");
    expect(source).toContain("loop");
    expect(source).toContain('pathname.startsWith("/dashboard/profile")');
    expect(source).toContain('className="ml-auto block h-48 w-48 bg-transparent transition-transform hover:scale-105');
    expect(source).not.toContain("overflow-hidden rounded-full bg-surface-container-lowest p-1 shadow-lg ring-2");
  });

  it("posts in-session history and exposes loading and error states", () => {
    const source = readComponentSource();

    expect(source).toContain('fetch("/api/chat"');
    expect(source).toContain("history: messages");
    expect(source).toContain('lessonContext: "Khu vực dashboard KAVICT"');
    expect(source).toContain("isSending");
    expect(source).toContain("Không thể kết nối với Kavi");
    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-live="polite"');
  });
});
