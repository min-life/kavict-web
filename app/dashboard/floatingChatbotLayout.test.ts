import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(resolve(__dirname, "layout.tsx"), "utf8");

describe("dashboard floating chatbot composition", () => {
  it("mounts one pathname-aware chatbot after dashboard content", () => {
    expect(layoutSource).toContain(
      'import FloatingChatbot from "./components/FloatingChatbot"',
    );
    expect(layoutSource).toContain("<FloatingChatbot pathname={pathname} />");
    expect(layoutSource.indexOf("<FloatingChatbot pathname={pathname} />")).toBeGreaterThan(
      layoutSource.indexOf("{children}"),
    );
  });
});
