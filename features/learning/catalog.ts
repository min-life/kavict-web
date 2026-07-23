export type LearningModuleItem = {
  id: string;
  lessonId: number;
  title: string;
  description: string;
  kind: "lesson" | "test";
  isPremium: boolean;
  duration: string;
};

export type LearningModule = {
  id: string;
  title: string;
  outcome: string;
  overview?: string;
  estimatedDuration?: string;
  prerequisites?: string;
  tags: string[];
  difficulty: number;
  isPublished: boolean;
  comingSoon: boolean;
  items: LearningModuleItem[];
};

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: "1",
    title: "Nền tảng dòng tiền",
    outcome: "Kiểm soát tiền trước khi đầu tư.",
    overview: "Ghi chép chi tiêu, lập ngân sách 50/30/20 và bắt đầu xây quỹ dự phòng.",
    estimatedDuration: "45 phút · 4 nội dung",
    prerequisites: "Không cần",
    tags: ["Ngân sách", "Tiết kiệm"],
    difficulty: 1,
    isPublished: true,
    comingSoon: false,
    items: [
      { id: "1-1", lessonId: 1, title: "Quản lý chi tiêu", description: "Theo dõi dòng tiền và phân bổ ngân sách 50/30/20.", kind: "lesson", isPremium: false, duration: "10 phút" },
      { id: "1-2", lessonId: 2, title: "Tiết kiệm chủ động", description: "Tạo thói quen tích lũy và tự động chuyển tiền.", kind: "lesson", isPremium: false, duration: "11 phút" },
      { id: "1-3", lessonId: 3, title: "Quỹ dự phòng", description: "Xây dựng lớp đệm cho những rủi ro bất ngờ.", kind: "lesson", isPremium: true, duration: "12 phút" },
      { id: "1-test", lessonId: 4, title: "Kiểm tra nền tảng", description: "Tổng kết ngân sách, tiết kiệm và quỹ dự phòng.", kind: "test", isPremium: false, duration: "10 phút" },
    ],
  },
  {
    id: "2",
    title: "Lá chắn tài chính",
    outcome: "Giảm thiểu rủi ro trước biến cố.",
    overview: "Đánh giá quỹ dự phòng, lạm phát và các lớp bảo vệ tài chính cá nhân.",
    estimatedDuration: "40 phút · 3 nội dung",
    prerequisites: "Hoàn thành Module 1",
    tags: ["An toàn", "Bảo hiểm"],
    difficulty: 2,
    isPublished: true,
    comingSoon: false,
    items: [
      { id: "2-1", lessonId: 3, title: "Quỹ dự phòng vững chắc", description: "Xác định quy mô và nơi lưu trữ quỹ khẩn cấp.", kind: "lesson", isPremium: false, duration: "12 phút" },
      { id: "2-2", lessonId: 4, title: "Lãi kép và lạm phát", description: "Bảo vệ sức mua khi xây mục tiêu dài hạn.", kind: "lesson", isPremium: true, duration: "12 phút" },
      { id: "2-test", lessonId: 5, title: "Kiểm tra lá chắn tài chính", description: "Kiểm tra khả năng xử lý rủi ro tài chính.", kind: "test", isPremium: false, duration: "10 phút" },
    ],
  },
  {
    id: "3",
    title: "Khởi đầu đầu tư",
    outcome: "Xây nền đầu tư có kỷ luật.",
    overview: "Nắm nguyên tắc đầu tư, cách hoạt động của chứng khoán và quỹ mở.",
    estimatedDuration: "45 phút · 3 nội dung",
    prerequisites: "Hoàn thành Module 1 và 2",
    tags: ["Đầu tư", "Tích sản"],
    difficulty: 3,
    isPublished: true,
    comingSoon: false,
    items: [
      { id: "3-1", lessonId: 5, title: "Nhập môn chứng khoán", description: "Hiểu cổ phiếu, thị trường và rủi ro cơ bản.", kind: "lesson", isPremium: false, duration: "14 phút" },
      { id: "3-2", lessonId: 6, title: "Đầu tư qua quỹ mở", description: "Đa dạng hóa với quỹ phù hợp mục tiêu.", kind: "lesson", isPremium: true, duration: "13 phút" },
      { id: "3-test", lessonId: 7, title: "Kiểm tra khởi đầu đầu tư", description: "Củng cố nguyên tắc đầu tư có trách nhiệm.", kind: "test", isPremium: false, duration: "12 phút" },
    ],
  },
  {
    id: "4",
    title: "Tài sản số & danh mục",
    outcome: "Quản trị danh mục có trách nhiệm.",
    overview: "Nhận diện rủi ro tài sản số và phân bổ danh mục phù hợp mục tiêu dài hạn.",
    estimatedDuration: "50 phút · 3 nội dung",
    prerequisites: "Hoàn thành Module 3",
    tags: ["Tài sản số", "Quản trị"],
    difficulty: 4,
    isPublished: true,
    comingSoon: false,
    items: [
      { id: "4-1", lessonId: 7, title: "Tài sản số có trách nhiệm", description: "Nhận diện rủi ro khi tiếp cận crypto và blockchain.", kind: "lesson", isPremium: false, duration: "15 phút" },
      { id: "4-2", lessonId: 8, title: "Phân bổ tài sản", description: "Cân bằng mục tiêu, thời hạn và khẩu vị rủi ro.", kind: "lesson", isPremium: true, duration: "15 phút" },
      { id: "4-test", lessonId: 9, title: "Kiểm tra danh mục", description: "Hoàn thiện tư duy quản trị danh mục dài hạn.", kind: "test", isPremium: false, duration: "12 phút" },
    ],
  },
  {
    id: "5",
    title: "Chiến lược danh mục",
    outcome: "Kết hợp các tài sản theo mục tiêu và mức chịu rủi ro.",
    tags: ["Đầu tư", "Quản trị"],
    difficulty: 4,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
  {
    id: "6",
    title: "Thuế & pháp lý cá nhân",
    outcome: "Hiểu các nghĩa vụ tài chính cơ bản trước khi ra quyết định.",
    tags: ["Thuế", "An toàn"],
    difficulty: 4,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
  {
    id: "7",
    title: "Bất động sản cho người mới",
    outcome: "Đánh giá dòng tiền, đòn bẩy và rủi ro của tài sản thực.",
    tags: ["Bất động sản", "Tích sản"],
    difficulty: 4,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
  {
    id: "8",
    title: "Quản trị rủi ro nâng cao",
    outcome: "Bảo vệ danh mục khi thị trường và thu nhập biến động.",
    tags: ["Quản trị", "An toàn"],
    difficulty: 5,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
  {
    id: "9",
    title: "Kế hoạch tài chính dài hạn",
    outcome: "Thiết kế mục tiêu hưu trí và tích sản theo từng giai đoạn sống.",
    tags: ["Hưu trí", "Tích sản"],
    difficulty: 5,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
  {
    id: "10",
    title: "Tự do tài chính & di sản",
    outcome: "Kết nối mục tiêu độc lập tài chính với kế hoạch để lại giá trị.",
    tags: ["Tự do tài chính", "Di sản"],
    difficulty: 5,
    isPublished: false,
    comingSoon: true,
    items: [],
  },
];

export function getLearningModule(id: string): LearningModule | undefined {
  return LEARNING_MODULES.find((module) => module.id === id);
}
