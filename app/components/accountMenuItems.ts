export const ACCOUNT_MENU_ITEMS = [
  { label: "Hồ sơ", icon: "person", href: "/dashboard/profile" },
  { label: "Cài đặt", icon: "settings", href: "/dashboard/settings" },
] as const;

type HelpMenuItem = {
  label: string;
  icon: string;
  href: string;
  dividerBefore?: boolean;
};

export const HELP_MENU_ITEMS: readonly HelpMenuItem[] = [
  { label: "Documentation", icon: "menu_book", href: "/help#documentation" },
  { label: "FAQ", icon: "help", href: "/help#faq" },
  { label: "Terms of Service", icon: "article", href: "/help#terms" },
  { label: "Privacy Policy", icon: "privacy_tip", href: "/help#privacy" },
  { label: "Download app", icon: "download", href: "/help#download-app", dividerBefore: true },
  { label: "Contact us", icon: "mail", href: "/help#contact-us", dividerBefore: true },
] as const;
