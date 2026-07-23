"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HelpSection = {
  id: string;
  label: string;
  title: string;
  body: string;
  dividerBefore?: boolean;
};

const HELP_SECTIONS: readonly HelpSection[] = [
  {
    id: "documentation",
    label: "Documentation",
    title: "Documentation",
    body: "Khám phá các tính năng chính của KAVICT để học tập, theo dõi tài chính và thực hành theo mục tiêu của bạn.",
  },
  {
    id: "faq",
    label: "FAQ",
    title: "Câu hỏi thường gặp",
    body: "Tìm câu trả lời nhanh về tài khoản, không gian học tập và những cách KAVICT đồng hành cùng bạn.",
  },
  {
    id: "terms",
    label: "Terms of Service",
    title: "Terms of Service",
    body: "Điều khoản này mô tả nguyên tắc sử dụng KAVICT một cách an toàn, tôn trọng và có trách nhiệm.",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    body: "KAVICT tôn trọng quyền riêng tư và chỉ sử dụng thông tin cần thiết để cung cấp trải nghiệm học tập của bạn.",
  },
  {
    id: "download-app",
    label: "Download app",
    title: "Download app",
    body: "KAVICT sẽ sớm có mặt trên Android và iOS. Hãy quay lại đây để nhận thông tin cập nhật khi ứng dụng sẵn sàng.",
    dividerBefore: true,
  },
  {
    id: "contact-us",
    label: "Contact us",
    title: "Contact us",
    body: "Cần trao đổi thêm? Gửi email cho đội ngũ KAVICT, chúng tôi luôn mong nhận được phản hồi từ bạn.",
    dividerBefore: true,
  },
];

export default function HelpPage() {
  const [activeId, setActiveId] = useState<string>(HELP_SECTIONS[0].id);

  useEffect(() => {
    const updateFromHash = () => {
      const id = window.location.hash.slice(1);
      if (HELP_SECTIONS.some((section) => section.id === id)) {
        setActiveId(id);
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );

    HELP_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      observer.disconnect();
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-10">
        <p className="text-label-md font-label-md text-primary">KAVICT SUPPORT</p>
        <h1 className="mt-2 text-display-sm font-display-sm text-on-surface">Help Center</h1>
        <p className="mt-3 max-w-2xl text-body-lg text-on-surface-variant">
          Mọi thông tin bạn cần để bắt đầu và sử dụng KAVICT hiệu quả.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Help Center sections" className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-3 text-label-lg font-label-lg font-bold text-on-surface">
            Section Navigation
          </p>
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
            {HELP_SECTIONS.map((section) => (
              <li
                className={section.dividerBefore ? "mt-2 border-t border-outline-variant pt-2" : ""}
                key={section.id}
              >
                <Link
                  className={`block shrink-0 rounded-lg border-l-4 px-3 py-2 text-body-md transition-colors ${
                    activeId === section.id
                      ? "border-primary bg-primary-container/20 font-bold text-primary"
                      : "border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                  }`}
                  href={`#${section.id}`}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {HELP_SECTIONS.map((section) => (
            <section
              className="scroll-mt-8 rounded-2xl bg-surface-container-lowest p-6 shadow-soft"
              id={section.id}
              key={section.id}
            >
              <h2 className="text-headline-md font-headline-md text-on-surface">{section.title}</h2>
              <p className="mt-3 text-body-lg text-on-surface-variant">{section.body}</p>
              {section.id === "contact-us" && (
                <a
                  className="mt-4 inline-flex text-label-lg font-label-lg text-primary hover:underline"
                  href="mailto:support@kavict.com"
                >
                  support@kavict.com
                </a>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
