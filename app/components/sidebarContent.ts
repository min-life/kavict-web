export const PRIMARY_NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Trang chủ", fill: true },
  { href: "/dashboard/learning", icon: "school", label: "Học tập" },
  { href: "/dashboard/finance-management", icon: "account_balance_wallet", label: "Quản lý tài chính" },
  { href: "/dashboard/practice-space", icon: "target", label: "Practice Space" },
] as const;

export const STATIC_TASKS = [
  { label: "Nhiệm vụ ngày", title: "Hoàn thành 1 bài học", completed: 1, total: 1 },
  { label: "Nhiệm vụ tuần", title: "Ghi chép chi tiêu 5 ngày", completed: 3, total: 5 },
] as const;
