"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      className="max-w-[1200px] mx-auto px-gutter py-2xl md:py-[120px] flex flex-col md:flex-row items-center gap-2xl overflow-hidden"
      id="tong-quan"
    >
      <motion.div
        className="flex-1 space-y-lg"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className="space-y-sm" variants={itemVariants}>
          <h1 className="font-display text-display text-on-surface">
            Làm chủ tài chính cá nhân cùng KAVICT
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[576px]">
            Lộ trình học tài chính cá nhân được cá nhân hóa bởi AI, giúp bạn xây
            dựng nền tảng vững chắc và tự tin đưa ra các quyết định tài chính.
          </p>
        </motion.div>
        
        <motion.div className="flex flex-wrap gap-sm" variants={itemVariants}>
          <span className="bg-primary-container/10 text-primary-container rounded-full px-sm py-1.5 font-label-sm text-label-sm flex items-center gap-base">
            <span className="material-symbols-outlined text-[16px]">school</span>{" "}
            Học từ cơ bản
          </span>
          <span className="bg-primary-container/10 text-primary-container rounded-full px-sm py-1.5 font-label-sm text-label-sm flex items-center gap-base">
            <span className="material-symbols-outlined text-[16px]">
              smart_toy
            </span>{" "}
            Gia sư AI 24/7
          </span>
          <span className="bg-primary-container/10 text-primary-container rounded-full px-sm py-1.5 font-label-sm text-label-sm flex items-center gap-base">
            <span className="material-symbols-outlined text-[16px]">
              check_circle
            </span>{" "}
            Không yêu cầu kiến thức
          </span>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-sm pt-sm"
          variants={itemVariants}
        >
          <Link
            className="ripple bg-primary-container text-on-primary-container rounded-[20px] px-lg py-3.5 font-label-md text-label-md text-center hover:bg-primary-container/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            href="/register"
          >
            Bắt đầu miễn phí
          </Link>
          <Link
            className="ripple border-2 border-outline-variant text-on-surface rounded-[20px] px-lg py-3.5 font-label-md text-label-md text-center hover:bg-surface-container-low hover:border-outline hover:-translate-y-0.5 transition-all duration-300"
            href="#tinh-nang"
          >
            Xem lộ trình học
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex-1 w-full relative group"
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-primary-container/5 rounded-[20px] -rotate-3 transform origin-bottom-left transition-transform duration-500 group-hover:-rotate-6"></div>
        <img
          alt="Modern 3D flat illustration for a Fintech education platform"
          className="relative z-10 w-full h-auto rounded-[20px] object-cover shadow-[0_8px_30px_rgba(0,0,0,0.06)] aspect-[4/3] transition-all duration-500"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnNvt5meCCkgmkrUeQUNJqSPjgSkpNfVangjNPv1poBlTaYwsMxjgBUwpV_emKikGHYNmPHQ0HKD5wUvfJSyakVRrOPysCFIrr_Y_fgY6B7Q16uviOxXxjyqaK4tRSe_GhPt0rZE5ILkAGjn_76jLgJo6-kpX_wzVKmC_QJ8C7QT_7rBrIwy3osB60RD6an_-kn3Z7rNhiDImHNS8V9mXMK5O37Hl6iREwZT9I_QLz7BZw4scYb8autSANMENC-YaXTthgYmcg9aE"
        />
      </motion.div>
    </section>
  );
}
