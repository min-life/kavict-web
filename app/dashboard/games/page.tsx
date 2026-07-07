"use client";

import Link from "next/link";

export default function GamesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
      <span className="material-symbols-outlined text-[64px] text-primary mb-4">stadia_controller</span>
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Thử thách Tài chính</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 max-w-md">
        Các trò chơi ôn tập kiến thức tài chính và nhận XP sẽ sớm ra mắt.
      </p>
      <Link href="/dashboard" className="px-6 py-2 bg-surface text-on-surface border border-outline-variant rounded-full font-bold hover:bg-surface-container transition-colors">
        Quay lại Trang chủ
      </Link>
    </div>
  );
}
