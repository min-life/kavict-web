import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PRACTICE_GAMES } from "./gameCatalog";

describe("PRACTICE_GAMES", () => {
  it("makes Daily Finance Simulator the only playable game", () => {
    expect(PRACTICE_GAMES).toHaveLength(4);

    expect(PRACTICE_GAMES[0]).toMatchObject({
      name: "Daily Finance Simulator",
      href: "/dashboard/practice-space/solo",
      available: true,
      difficulty: "Dễ",
      estimatedTime: "8–12 phút",
      rewards: { kaviCoin: 120, xp: 150 },
    });

    expect(PRACTICE_GAMES.slice(1).every((game) => !game.available)).toBe(true);
  });

  it("provides the information needed by the game details dialog", () => {
    const dailyFinance = PRACTICE_GAMES[0];

    expect(dailyFinance.rules).toBeTruthy();
    expect(dailyFinance.howToPlay).toBeTruthy();
    expect(dailyFinance.winCondition).toBeTruthy();
    expect(dailyFinance.tip).toBeTruthy();
  });
});

describe("Practice Space catalogue surface", () => {
  it("offers an information dialog and disabled coming-soon actions", () => {
    const page = readFileSync(path.resolve(process.cwd(), "app/dashboard/practice-space/page.tsx"), "utf8");

    expect(page).toContain("Thông tin game");
    expect(page).toContain("Đón chờ Kavict nhé");
    expect(page).toContain('role="dialog"');
    expect(page).toContain("disabled={!game.available}");
    expect(page).toContain("Chơi ngay");
  });

  it("removes the landing title and keeps the introduction at a readable width", () => {
    const page = readFileSync(path.resolve(process.cwd(), "app/dashboard/practice-space/page.tsx"), "utf8");

    expect(page).not.toContain('<h1 className="font-headline-lg text-[32px] font-bold text-on-surface">Practice Space</h1>');
    expect(page).toContain("max-w-[48rem]");
    expect(page).not.toContain("max-w-2xl");
  });

  it("uses an explicit wide dialog and no longer renders the landing target icon", () => {
    const page = readFileSync(path.resolve(process.cwd(), "app/dashboard/practice-space/page.tsx"), "utf8");

    expect(page).toContain("max-w-[52rem]");
    expect(page).not.toContain("max-w-xl");
    expect(page).not.toContain('text-[52px] text-primary">target</span>');
  });

  it("opens a solo-or-multiplayer mode choice before Daily Finance Simulator starts", () => {
    const page = readFileSync(path.resolve(process.cwd(), "app/dashboard/practice-space/page.tsx"), "utf8");

    expect(page).toContain("Chọn chế độ chơi");
    expect(page).toContain("Chơi đơn");
    expect(page).toContain("Chơi cùng bạn");
    expect(page).toContain("MultiplayerModal");
    expect(page).toContain("getLocalMultiplayerMessage");
    expect(page).toContain("setModeSelectionOpen(true)");
  });
});
