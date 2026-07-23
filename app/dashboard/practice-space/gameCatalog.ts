export interface PracticeGame {
  name: string;
  quickInfo: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
  rewards: {
    kaviCoin: number;
    xp: number;
  };
  available: boolean;
  href?: string;
  rules: string;
  howToPlay: string;
  winCondition: string;
  tip: string;
}

export const PRACTICE_GAMES: PracticeGame[] = [
  {
    name: "Daily Finance Simulator",
    quickInfo: "Quản lý ngân sách mỗi ngày",
    description: "Lập kế hoạch chi tiêu, xử lý tình huống bất ngờ và giữ mục tiêu tiết kiệm trong tầm tay.",
    icon: "account_balance_wallet",
    difficulty: "Dễ",
    estimatedTime: "8–12 phút",
    rewards: { kaviCoin: 120, xp: 150 },
    available: true,
    href: "/dashboard/practice-space/solo",
    rules: "Mỗi lượt mô phỏng một tháng tài chính với các khoản thu, chi và sự kiện phát sinh.",
    howToPlay: "Chọn nhân vật, đặt mục tiêu tiết kiệm, phân bổ ngân sách rồi đưa ra quyết định cho từng tình huống.",
    winCondition: "Hoàn thành vòng chơi với số dư dương và đạt mục tiêu tiết kiệm đã đặt.",
    tip: "Dành một phần thu nhập cho quỹ dự phòng trước khi tăng các khoản chi tùy ý.",
  },
  {
    name: "Budget Builder",
    quickInfo: "Xây ngân sách bền vững",
    description: "Sắp xếp các khoản chi thiết yếu và biến mục tiêu tài chính thành kế hoạch rõ ràng.",
    icon: "pie_chart",
    difficulty: "Dễ",
    estimatedTime: "7 phút",
    rewards: { kaviCoin: 100, xp: 120 },
    available: false,
    rules: "",
    howToPlay: "",
    winCondition: "",
    tip: "",
  },
  {
    name: "Investment Explorer",
    quickInfo: "Khám phá đầu tư cơ bản",
    description: "Cân bằng lợi nhuận và rủi ro qua những lựa chọn đầu tư gần gũi với sinh viên.",
    icon: "trending_up",
    difficulty: "Trung bình",
    estimatedTime: "10 phút",
    rewards: { kaviCoin: 180, xp: 200 },
    available: false,
    rules: "",
    howToPlay: "",
    winCondition: "",
    tip: "",
  },
  {
    name: "Debt Escape Plan",
    quickInfo: "Lập kế hoạch thoát nợ",
    description: "Ưu tiên khoản trả nợ và giữ dòng tiền ổn định qua các tình huống thử thách.",
    icon: "receipt_long",
    difficulty: "Khó",
    estimatedTime: "12 phút",
    rewards: { kaviCoin: 250, xp: 280 },
    available: false,
    rules: "",
    howToPlay: "",
    winCondition: "",
    tip: "",
  },
];
