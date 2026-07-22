"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { ACCOUNT_MENU_ITEMS, HELP_MENU_ITEMS } from "@/app/components/accountMenuItems";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Trang chủ", fill: true },
  { href: "/dashboard/learning", icon: "school", label: "Học tập" },
  { href: "/dashboard/finance-management", icon: "account_balance_wallet", label: "Quản lý tài chính" },
  { href: "/dashboard/games", icon: "stadia_controller", label: "Trò chơi" },
  { href: "/dashboard/leaderboard", icon: "leaderboard", label: "Bảng xếp hạng" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const userName = user?.displayName || "Người dùng";
  const userEmail = user?.email || "user@kavict.com";

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    // The account menu is transient UI state and must reset on navigation/collapse.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserMenuOpen(false);
    setHelpMenuOpen(false);
  }, [pathname, collapsed]);

  return (
    <nav
      className={`sidebar h-full w-64 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest z-50 flex justify-between py-6 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${collapsed ? "collapsed" : ""}`}
      id="sidebar"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-8 px-2 center-on-collapse">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
              <img
                alt="KAVICT Logo"
                className="h-10 w-auto object-contain"
                src="/logo-image.png"
              />
              <img
                alt="KAVICT Text"
                className="h-8 w-auto object-contain hide-on-collapse mt-1"
                src="/logo-text.png"
              />
            </Link>
          </div>
          <button
            className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="material-symbols-outlined">
              {collapsed ? "menu" : "menu_open"}
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <ul className="space-y-2 flex-col flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="relative has-tooltip">
              <Link
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 center-on-collapse ${
                  isActive(item.href)
                    ? "text-primary font-bold border-r-4 border-primary bg-primary-container/10"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
                href={item.href}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive(item.href) && item.fill
                      ? { fontVariationSettings: '"FILL" 1' }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="text-label-md font-label-md hide-on-collapse whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
              <div className="tooltip absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-inverse-surface text-inverse-on-surface text-label-sm font-label-sm px-2 py-1 rounded whitespace-nowrap z-50">
                {item.label}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        {/* Upgrade button */}
        <div className="mb-4 flex justify-center">
          <Link
            href="/dashboard/upgrade"
            className={`flex items-center justify-center gap-2 bg-primary-container text-on-primary rounded-lg shadow-lg hover:bg-primary transition-all duration-200 group ${
              collapsed ? "w-full py-3 px-0" : "w-full py-3 px-4"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              workspace_premium
            </span>
            {!collapsed && (
              <span className="text-label-md font-label-md whitespace-nowrap">
                Nâng cấp gói
              </span>
            )}
          </Link>
        </div>

        {/* User Menu (toggleable) */}
        {userMenuOpen && (
          <div className="relative mb-2 flex flex-col rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-lg">
            {ACCOUNT_MENU_ITEMS.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors ${
                  collapsed ? "justify-center w-full py-3 px-0" : "gap-3 px-3 py-2"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && <span className="text-label-md font-label-md whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
            <button
              aria-controls="sidebar-help-menu"
              aria-expanded={helpMenuOpen}
              aria-haspopup="menu"
              className={`flex w-full items-center rounded-lg transition-colors hover:bg-surface-container-high hover:text-primary ${
                helpMenuOpen ? "bg-primary-container/10 text-primary" : "text-on-surface-variant"
              } ${
                collapsed ? "justify-center w-full py-3 px-0" : "gap-3 px-3 py-2"
              }`}
              onClick={() => setHelpMenuOpen((open) => !open)}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help</span>
              {!collapsed && <span className="flex-1 text-left text-label-md font-label-md">Help</span>}
              {!collapsed && <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chevron_right</span>}
            </button>
            {helpMenuOpen && (
              <div id="sidebar-help-menu" role="menu" className="absolute bottom-0 left-full z-50 ml-2 w-72 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-2 text-on-surface shadow-xl dark:bg-surface-container-highest">
                {HELP_MENU_ITEMS.map((item) => (
                  <div className={("dividerBefore" in item && item.dividerBefore) ? "mt-2 border-t border-outline-variant pt-2" : ""} key={item.label} role="none">
                    <button aria-disabled="true" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-on-surface-variant hover:bg-surface-container-high hover:text-primary dark:text-on-surface" role="menuitem" type="button">
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{item.icon}</span><span className="text-body-md">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors ${
                collapsed ? "justify-center w-full py-3 px-0" : "gap-3 px-3 py-2"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              {!collapsed && <span className="text-label-md font-label-md whitespace-nowrap">Đăng xuất</span>}
            </button>
          </div>
        )}

        {!collapsed && <div className="border-t border-outline-variant pt-4 mb-4" />}
        {collapsed && <div className="h-4" />}

        {/* User Profile */}
        <button
          className={`flex items-center rounded-lg hover:bg-surface-container-high transition-colors group relative ${
            collapsed ? "justify-center w-full py-1 px-0" : "w-full gap-3 px-2 py-2"
          }`}
          aria-expanded={userMenuOpen}
          onClick={() => setUserMenuOpen((open) => {
            if (open) setHelpMenuOpen(false);
            return !open;
          })}
          type="button"
        >
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md shrink-0 overflow-hidden border border-outline-variant/30">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          {!collapsed && (
            <>
              <div className="flex flex-col overflow-hidden text-left flex-1">
                <span className="text-label-md font-label-md text-on-surface truncate">
                  {userName}
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant truncate">
                  {userEmail}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                {userMenuOpen ? "expand_less" : "expand_more"}
              </span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
