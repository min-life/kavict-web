"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

export default function PricingSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-2xl overflow-hidden" id="bang-gia">
      <div className="max-w-[1200px] mx-auto px-gutter">
        <motion.div
          className="text-center space-y-sm mb-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-headline-lg text-headline-lg md:text-display text-on-surface">
            Bảng giá
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[672px] mx-auto">
            Chọn gói phù hợp với mục tiêu học tập của bạn.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-md max-w-[1024px] mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Tier 1: Miễn phí */}
          <motion.div
            className="bg-surface-container-lowest rounded-2xl p-xl flex flex-col hover-card border border-outline-variant/30 relative"
            variants={cardVariants}
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              Miễn phí
            </h3>
            <div className="font-display text-display text-on-surface mb-md">
              0đ
              <span className="text-body-lg font-normal text-on-surface-variant">
                /tháng
              </span>
            </div>
            <ul className="space-y-4 text-body-md text-on-surface-variant mb-xl flex-1">
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Một số khóa học cơ bản
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Gia sư AI (giới hạn 10 câu/ngày)
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Quiz cơ bản
              </li>
            </ul>
            <Link
              className="ripple w-full block text-center border-2 border-primary text-primary rounded-[20px] px-lg py-3.5 font-label-md text-label-md hover:bg-primary/5 transition-colors"
              href="/register"
            >
              Bắt đầu ngay
            </Link>
          </motion.div>

          {/* Tier 2: Premium (Popular) */}
          <motion.div
            className="bg-surface-container-lowest rounded-2xl p-xl flex flex-col hover-card border-2 border-primary relative shadow-[0_8px_30px_rgba(37,99,235,0.15)] z-10 md:scale-105"
            variants={cardVariants}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-sm py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">
              Phổ biến nhất
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              Premium
            </h3>
            <div className="font-display text-display text-on-surface mb-md">
              99k
              <span className="text-body-lg font-normal text-on-surface-variant">
                /tháng
              </span>
            </div>
            <ul className="space-y-4 text-body-md text-on-surface-variant mb-xl flex-1">
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Toàn bộ khóa học
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Gia sư AI không giới hạn
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Giả lập tài chính nâng cao
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Chứng chỉ hoàn thành
              </li>
            </ul>
            <Link
              className="ripple w-full block text-center bg-primary-container text-on-primary-container rounded-[20px] px-lg py-3.5 font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-md"
              href="/register?plan=premium"
            >
              Bắt đầu ngay
            </Link>
          </motion.div>

          {/* Tier 3: Doanh nghiệp */}
          <motion.div
            className="bg-surface-container-lowest rounded-2xl p-xl flex flex-col hover-card border border-outline-variant/30 relative"
            variants={cardVariants}
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
              Doanh nghiệp
            </h3>
            <div className="font-headline-md text-headline-md text-on-surface mb-md py-3">
              Liên hệ
            </div>
            <ul className="space-y-4 text-body-md text-on-surface-variant mb-xl flex-1">
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Đào tạo nhân viên theo nhóm
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Dashboard quản trị riêng
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                Báo cáo tiến độ chi tiết
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">
                  check
                </span>{" "}
                AI hỗ trợ đặc thù doanh nghiệp
              </li>
            </ul>
            <Link
              className="ripple w-full block text-center border-2 border-outline-variant text-on-surface rounded-[20px] px-lg py-3.5 font-label-md text-label-md hover:bg-surface-container-low transition-colors"
              href="#lien-he"
            >
              Liên hệ ngay
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
