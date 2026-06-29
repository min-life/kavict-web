"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "KAVICT là gì?",
    answer:
      "KAVICT là một nền tảng giáo dục tài chính cá nhân ứng dụng trí tuệ nhân tạo (AI). Nền tảng cung cấp lộ trình học tập được cá nhân hóa, công cụ giả lập quản lý tài chính và trợ lý AI 24/7 để giúp bạn xây dựng thói quen tài chính lành mạnh.",
  },
  {
    question: "Tôi chưa biết gì có học được không?",
    answer:
      "Hoàn toàn được. KAVICT được thiết kế dành cho mọi đối tượng, từ những người chưa có kiến thức nền tảng về tài chính đến những người muốn tối ưu hóa chiến lược đầu tư. Lộ trình học sẽ bắt đầu từ những khái niệm cơ bản nhất.",
  },
  {
    question: "AI hoạt động thế nào trên nền tảng?",
    answer:
      "Gia sư AI của KAVICT sử dụng công nghệ xử lý ngôn ngữ tự nhiên tiên tiến để hiểu câu hỏi của bạn và đưa ra câu trả lời phù hợp, giải thích các thuật ngữ khó hiểu, đồng thời phân tích thói quen học tập để đề xuất các bài học tiếp theo tối ưu nhất.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-surface-container-lowest py-2xl" id="faq">
      <div className="max-w-[800px] mx-auto px-gutter">
        <motion.div
          className="text-center space-y-sm mb-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Câu hỏi thường gặp
          </h2>
        </motion.div>

        <motion.div
          className="space-y-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border rounded-xl bg-surface overflow-hidden transition-colors duration-300 ${
                  isOpen ? "border-primary/50" : "border-outline-variant/50"
                }`}
              >
                <button
                  className="w-full text-left px-lg py-md font-headline-md text-body-lg text-on-surface flex justify-between items-center hover:bg-surface-container-low transition-colors focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <motion.span
                    className="material-symbols-outlined text-primary"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    expand_more
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="bg-surface"
                    >
                      <div className="px-lg pb-md pt-2 text-body-md text-on-surface-variant border-t border-outline-variant/20 mx-lg">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
