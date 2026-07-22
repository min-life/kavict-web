import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ACCOUNT_MENU_ITEMS, HELP_MENU_ITEMS } from "@/app/components/accountMenuItems";

const css = readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf8");
const settingsPath = path.resolve(process.cwd(), "app/dashboard/settings/page.tsx");
const profilePath = path.resolve(process.cwd(), "app/dashboard/profile/page.tsx");
const sidebarPath = path.resolve(process.cwd(), "app/components/Sidebar.tsx");

function getAccountMenuWrapperClasses(sidebar: string) {
  const accountMenuWrapper = sidebar.match(
    /\{userMenuOpen && \(\s*<div\s+className="([^"]+)"[\s\S]*?\{helpMenuOpen && \(/,
  );

  return accountMenuWrapper?.[1]?.split(/\s+/) ?? [];
}

describe("settings visual surface", () => {
  it("uses a root-class dark variant and semantic dark tokens", () => {
    expect(css).toContain("@custom-variant dark (&:where(.dark, .dark *));");
    expect(css).toContain("html.dark {");
    expect(css).toContain("--color-surface-container-lowest:");
    expect(css).toContain("--color-on-surface:");
    expect(css).toContain("--color-background:");
  });

  it("moves settings from Profile to the dedicated protected route", () => {
    const settings = readFileSync(settingsPath, "utf8");
    const profile = readFileSync(profilePath, "utf8");
    for (const label of ["Thông báo", "Ngôn ngữ", "Chế độ tối", "Bảo mật", "Billing"]) {
      expect(settings).toContain(label);
    }
    expect(settings).toContain('type="checkbox"');
    expect(settings).toContain("useTheme");
    expect(profile).not.toContain("Cài đặt chung");
  });

  it("exposes only the requested account and Help menu items", () => {
    expect(ACCOUNT_MENU_ITEMS).toEqual([
      { label: "Hồ sơ", icon: "person", href: "/dashboard/profile" },
      { label: "Cài đặt", icon: "settings", href: "/dashboard/settings" },
    ]);
    expect(HELP_MENU_ITEMS.map((item) => item.label)).toEqual([
      "Help center", "Release notes", "Download apps", "Keyboard shortcuts",
      "Terms of Service", "Privacy Policy", "Report a bug",
    ]);
    expect(HELP_MENU_ITEMS.filter((item) => item.dividerBefore)).toEqual([
      { label: "Terms of Service", icon: "article", dividerBefore: true },
    ]);
  });

  it("keeps the expanded Help popover adjacent, visible, and announced as a menu", () => {
    const sidebar = readFileSync(sidebarPath, "utf8");

    expect(sidebar).toContain('aria-haspopup="menu"');
    expect(sidebar).toContain('helpMenuOpen ? "bg-primary-container/10 text-primary"');
    expect(sidebar).toContain('absolute bottom-0 left-full z-50 ml-2 w-72');

    const accountMenuWrapperClasses = getAccountMenuWrapperClasses(sidebar);
    expect(accountMenuWrapperClasses).not.toEqual([]);
    expect(accountMenuWrapperClasses).not.toContain("overflow-hidden");
    expect(accountMenuWrapperClasses).not.toContain("overflow-clip");

    const sidebarWithForbiddenOverflow = sidebar.replace(
      /(\{userMenuOpen && \(\s*<div\s+className=")([^"]+)/,
      "$1flex overflow-clip overflow-hidden $2",
    );
    expect(getAccountMenuWrapperClasses(sidebarWithForbiddenOverflow)).toEqual(
      expect.arrayContaining(["overflow-hidden", "overflow-clip"]),
    );
  });
});
