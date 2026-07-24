export const AVATAR_OPTIONS = [
  { key: "bloom", label: "Hoa Bloom", emoji: "🌼", colors: "from-amber-200 via-orange-200 to-rose-300", accent: "text-orange-700" },
  { key: "mint", label: "Mèo Mint", emoji: "🐱", colors: "from-emerald-200 via-teal-200 to-cyan-300", accent: "text-teal-800" },
  { key: "berry", label: "Dâu Berry", emoji: "🍓", colors: "from-rose-200 via-pink-200 to-fuchsia-300", accent: "text-rose-800" },
  { key: "sky", label: "Mây Sky", emoji: "☁️", colors: "from-sky-200 via-blue-200 to-indigo-300", accent: "text-blue-800" },
  { key: "violet", label: "Kỳ lân Violet", emoji: "🦄", colors: "from-violet-200 via-purple-200 to-fuchsia-300", accent: "text-violet-800" },
  { key: "sunny", label: "Mặt trời Sunny", emoji: "🌞", colors: "from-yellow-200 via-amber-200 to-orange-300", accent: "text-amber-800" },
] as const;

export type AvatarKey = typeof AVATAR_OPTIONS[number]["key"];

export function findAvatar(key: string | null | undefined) {
  return AVATAR_OPTIONS.find((avatar) => avatar.key === key);
}

export const TONE_OPTIONS = [
  { value: "vui vẻ", label: "Vui vẻ", icon: "sentiment_very_satisfied" },
  { value: "nghiêm túc", label: "Nghiêm túc", icon: "psychology" },
  { value: "ấm áp", label: "Ấm áp", icon: "favorite" },
  { value: "giận dữ", label: "Giận dữ", icon: "mood_bad" },
] as const;

export const RESPONSE_STYLE_OPTIONS = [
  { value: "concise", label: "Ngắn gọn", description: "Vào trọng điểm" },
  { value: "detailed", label: "Dài hơn", description: "Chi tiết hơn" },
] as const;

export const ACHIEVEMENT_SECTIONS = [
  {
    title: "Học tập",
    icon: "school",
    color: "text-primary",
    items: [
      ["Những module đã học", "12 module"],
      ["Tổng bài test đã dự", "28 bài"],
      ["Tổng ghi chú đã ghi", "56 ghi chú"],
      ["Tổng Flash Card đã ôn", "210 thẻ"],
    ],
  },
  {
    title: "Quản lý tài chính",
    icon: "account_balance_wallet",
    color: "text-emerald-600",
    items: [
      ["Mục tiêu đang theo đuổi", "2 mục tiêu"],
      ["Ngày đã ghi chép chi tiêu", "46 ngày"],
      ["Tiến độ tiết kiệm", "68%"],
      ["Thử thách ngân sách hoàn thành", "8 thử thách"],
    ],
  },
  {
    title: "Practice Space",
    icon: "target",
    color: "text-violet-600",
    items: [
      ["Phiên luyện tập", "34 phiên"],
      ["Thử thách đã hoàn thành", "19 thử thách"],
      ["Điểm cao nhất", "980 điểm"],
      ["XP kiếm được", "+2,450 XP"],
    ],
  },
] as const;

export function formatProfileJoinDate(value: unknown): string {
  const date = typeof value === "string"
    ? new Date(value)
    : typeof value === "object" && value && typeof (value as { toDate?: unknown }).toDate === "function"
      ? (value as { toDate: () => Date }).toDate()
      : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(date)
    : "Chưa cập nhật";
}

export function validateBasicProfile({ preferredName, age }: { preferredName: string; age: string }) {
  const errors: { preferredName?: string; age?: string } = {};
  if (!preferredName.trim()) errors.preferredName = "Tên không được để trống.";
  const numericAge = Number(age);
  if (!age || !Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) {
    errors.age = "Tuổi cần nằm trong khoảng 1 đến 120.";
  }
  return errors;
}
