"use client";

import { useState } from "react";
import { getFinanceRepository } from "@/features/finance/provider";
import { runtimeMode } from "@/features/runtime/config";

export default function LocalDemoNotice() {
  const [isResetting, setIsResetting] = useState(false);

  if (runtimeMode !== "local") return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await getFinanceRepository().resetDemoData?.();
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <aside className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-on-surface sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary" aria-hidden="true">database</span>
        <p>
          Bạn đang dùng dữ liệu demo cục bộ. Các thay đổi được lưu và có thể chỉnh sửa trên trình duyệt này.
        </p>
      </div>
      <button
        type="button"
        onClick={handleReset}
        disabled={isResetting}
        className="shrink-0 rounded-full border border-primary/30 px-4 py-2 font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-wait disabled:opacity-60"
      >
        {isResetting ? "Đang đặt lại..." : "Đặt lại dữ liệu demo"}
      </button>
    </aside>
  );
}
