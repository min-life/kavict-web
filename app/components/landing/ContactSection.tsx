"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section className="py-2xl" id="lien-he">
      <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 gap-2xl items-start">
        <motion.div
          className="space-y-lg"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-sm">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Liên hệ với chúng tôi
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Bạn có thắc mắc hoặc cần hỗ trợ? Đội ngũ KAVICT luôn sẵn sàng giải
              đáp.
            </p>
          </div>

          <div className="space-y-md">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[24px]">
                mail
              </span>
              <span>support@kavict.com</span>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[24px]">
                call
              </span>
              <span>1900 xxxx</span>
            </div>
          </div>

          <div className="flex gap-sm pt-sm">
            <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                language
              </span>
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-surface rounded-2xl p-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">
                  Họ và tên
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Nhập họ tên của bạn"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">
                  Email
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="example@email.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface">
                  Tin nhắn
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Nhập nội dung tin nhắn..."
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  className={`w-full text-center rounded-[20px] px-lg py-3.5 font-label-md text-label-md transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSuccess 
                      ? "bg-success text-on-primary" 
                      : "bg-primary text-on-primary hover:bg-primary/90 hover:shadow-md"
                  }`}
                  disabled={isSubmitting || isSuccess}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <motion.span 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="material-symbols-outlined text-[20px]"
                      >
                        progress_activity
                      </motion.span>
                      Đang gửi...
                    </>
                  ) : isSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        check_circle
                      </span>
                      Gửi thành công!
                    </>
                  ) : (
                    "Gửi liên hệ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
