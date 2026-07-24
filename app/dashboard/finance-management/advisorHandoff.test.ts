import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentsDirectory = resolve(__dirname, "components");
const workspacePath = resolve(componentsDirectory, "FinanceWorkspace.tsx");
const advisorPath = resolve(componentsDirectory, "KaviAdvisorTab.tsx");

describe("Advisor launch handoff", () => {
  it("consumes a plan-launch request after preserving the selected conversation and prefilled prompt", () => {
    const workspaceSource = readFileSync(workspacePath, "utf8");
    const advisorSource = readFileSync(advisorPath, "utf8");

    expect(workspaceSource).toMatch(/const consumeAdvisorLaunchRequest = useCallback\(\(\) => \{\s*setAdvisorLaunchRequest\(null\);\s*\}, \[\]\);/);
    expect(workspaceSource).toContain("onLaunchRequestConsumed={consumeAdvisorLaunchRequest}");
    expect(advisorSource).toContain("onLaunchRequestConsumed?: () => void");
    expect(advisorSource).toMatch(/startConversation\(launchRequest\.useCase\);\s*setInput\(launchRequest\.prompt\);\s*onLaunchRequestConsumed\?\.\(\);/);
  });
});
