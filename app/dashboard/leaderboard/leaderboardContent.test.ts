import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const leaderboardPage = readFileSync(resolve(__dirname, "page.tsx"), "utf8");

describe("leaderboard podium achievements", () => {
  it("shows only XP, coin, streak, and earned badges in each achievement card", () => {
    expect(leaderboardPage.match(/data-achievement-summary/g)).toHaveLength(3);
    expect(leaderboardPage.match(/data-earned-badges/g)).toHaveLength(4);
    expect(leaderboardPage).toContain("Tổng XP");
    expect(leaderboardPage).toContain("Tổng coin");
    expect(leaderboardPage).toContain("Streak");
    expect(leaderboardPage).not.toContain(">Bài học</span>");
  });

  it("uses the same achievement metrics and badges in the personal card and ranking table", () => {
    expect(leaderboardPage).toContain("data-personal-achievement-summary");
    expect(leaderboardPage).toContain("data-ranking-achievements");
    expect(leaderboardPage).toContain(">Tổng coin</th>");
    expect(leaderboardPage).toContain(">Streak</th>");
    expect(leaderboardPage).not.toContain(">Bài học</th>");
    expect(leaderboardPage).not.toContain(">Xu hướng</th>");
  });

  it("uses the profile character avatars instead of remote portrait photos", () => {
    expect(leaderboardPage).toContain('import { findAvatar } from "../profile/profileModel";');
    expect(leaderboardPage).toContain("function LeaderboardAvatar");
    expect(leaderboardPage).not.toContain("lh3.googleusercontent.com/aida-public");
  });

  it("places the personal rank after the leaderboard table without a see-more control", () => {
    expect(leaderboardPage).not.toContain("Xem thêm");
    expect(leaderboardPage.indexOf("data-personal-achievement-summary")).toBeGreaterThan(
      leaderboardPage.indexOf("data-ranking-achievements"),
    );
  });
});
