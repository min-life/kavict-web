"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function TopNavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Tổng quan", href: "#tong-quan" },
    { name: "Tính năng", href: "#tinh-nang" },
    { name: "Bảng giá", href: "#bang-gia" },
    { name: "Liên hệ", href: "#lien-he" },
  ];

  return (
    <header
      className="fixed top-0 w-full z-50 bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300"
    >
      <div className="max-w-[1200px] mx-auto px-gutter flex items-center justify-between h-20">
        <div className="flex items-center gap-sm">
          <Link href="/" className="flex items-center gap-2">
            <img
              alt="KAVICT Logo"
              className="h-10 object-contain"
              src="/logo-image.png"
            />
            <img
              alt="KAVICT Text"
              className="h-8 object-contain mt-1"
              src="/logo-text.png"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-md font-label-md text-label-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              className="text-on-surface-variant hover:text-primary transition-colors"
              href={link.href}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-sm">
          {isLoggedIn ? (
            <Link
              className="ripple bg-primary-container text-on-primary-container hover:bg-primary-container/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-[20px] px-sm py-2.5 font-label-md text-label-md"
              href="/dashboard"
            >
              Khám phá
            </Link>
          ) : (
            <>
              <Link
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                href="/login"
              >
                Đăng nhập
              </Link>
              <Link
                className="ripple bg-primary-container text-on-primary-container hover:bg-primary-container/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-[20px] px-sm py-2.5 font-label-md text-label-md"
                href="/register"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-on-surface-variant"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-[28px]">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface dark:bg-surface-dim border-b border-outline-variant/30 overflow-hidden"
          >
            <div className="px-gutter py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors py-2"
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px w-full bg-outline-variant/30 my-2" />
              {isLoggedIn ? (
                <Link
                  className="bg-primary-container text-on-primary-container rounded-[20px] px-sm py-3 font-label-md text-label-md text-center hover:bg-primary-container/90 transition-colors"
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Khám phá
                </Link>
              ) : (
                <>
                  <Link
                    className="font-label-md text-label-md text-on-surface py-2 hover:text-primary transition-colors"
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    className="bg-primary-container text-on-primary-container rounded-[20px] px-sm py-3 font-label-md text-label-md text-center hover:bg-primary-container/90 transition-colors"
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
