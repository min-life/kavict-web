"use client";

import { motion, Variants } from "framer-motion";

export default function FeaturesSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: "map",
      title: "Học theo lộ trình",
      points: [
        "Roadmap rõ ràng",
        "Theo dõi tiến độ",
        "Bài kiểm tra",
        "Thành tựu",
      ],
    },
    {
      icon: "psychology",
      title: "Gia sư AI",
      points: [
        "Giải thích kiến thức",
        "Hỏi đáp tự nhiên",
        "Cá nhân hóa",
        "Gợi ý bài học",
      ],
    },
    {
      icon: "account_balance_wallet",
      title: "Giả lập quản lý",
      points: [
        "Lập ngân sách",
        "Theo dõi thu chi",
        "Mô phỏng tiết kiệm",
        "Đặt mục tiêu",
      ],
    },
    {
      icon: "trending_up",
      title: "Giải pháp tài chính",
      points: [
        "AI phân tích",
        "Đề xuất tiết kiệm",
        "Đầu tư",
        "Quản lý chi tiêu",
      ],
    },
    {
      icon: "sports_esports",
      title: "Học tương tác",
      points: ["Quiz", "Mini game", "Huy hiệu", "Thử thách hàng tuần"],
    },
    {
      icon: "bar_chart",
      title: "Theo dõi tiến bộ",
      points: [
        "Dashboard thống kê",
        "Phân tích bài học",
        "Đánh giá kỹ năng",
        "Tiến độ tổng quan",
      ],
    },
  ];

  return (
    <section className="bg-surface-container-lowest py-2xl overflow-hidden" id="tinh-nang">
      <div className="max-w-[1200px] mx-auto px-gutter">
        <motion.div
          className="text-center space-y-sm mb-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-display text-on-surface">
            Tính năng nổi bật
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[672px] mx-auto">
            Trải nghiệm phương pháp học tập hiện đại, kết hợp công nghệ AI để cá
            nhân hóa lộ trình phát triển tài chính của riêng bạn.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-surface rounded-2xl p-lg hover-card border border-outline-variant/30 group hover:border-primary/30 transition-all duration-300"
              variants={cardVariants}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center mb-md text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-300">
                <span className="material-symbols-outlined text-[24px]">
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
                {feature.title}
              </h3>
              <ul className="space-y-2 text-body-md text-on-surface-variant">
                {feature.points.map((point, pointIdx) => (
                  <li key={pointIdx} className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check_circle
                    </span>{" "}
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
