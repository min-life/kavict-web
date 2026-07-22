export const ACCOUNT_MENU_ITEMS = [
  { label: "Hồ sơ", icon: "person", href: "/dashboard/profile" },
  { label: "Cài đặt", icon: "settings", href: "/dashboard/settings" },
] as const;

type HelpMenuItem = {
  label: string;
  icon: string;
  dividerBefore?: boolean;
};

export const HELP_MENU_ITEMS: readonly HelpMenuItem[] = [
  { label: "Help center", icon: "help" },
  { label: "Release notes", icon: "edit" },
  { label: "Download apps", icon: "download" },
  { label: "Terms of Service", icon: "article", dividerBefore: true },
  { label: "Privacy Policy", icon: "info" },
  { label: "Report a bug", icon: "bug_report" },
] as const;
