"use client";

import { useTheme } from "@/features/theme/ThemeProvider";

function StaticSetting({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 text-on-surface-variant">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{icon}</span>
        <span className="font-body-md text-body-md">{label}</span>
      </div>
      {value ? <span className="font-label-sm text-label-sm">{value}</span> : <span className="material-symbols-outlined text-outline-variant" aria-hidden="true">chevron_right</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="mx-auto w-full max-w-[42rem]">
      <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft">
        <h1 className="mb-6 font-headline-md text-headline-md text-on-surface">Cài đặt chung</h1>
        <div className="space-y-2">
          <StaticSetting icon="notifications" label="Thông báo" />
          <StaticSetting icon="language" label="Ngôn ngữ" value="Tiếng Việt" />
          <label className="flex cursor-pointer items-center justify-between rounded-lg p-3 text-on-surface-variant hover:bg-surface-container">
            <span className="flex items-center gap-3"><span className="material-symbols-outlined text-[24px]" aria-hidden="true">dark_mode</span><span className="font-body-md text-body-md">Chế độ tối</span></span>
            <input aria-label="Bật chế độ tối" checked={isDark} className="peer sr-only" onChange={(event) => setTheme(event.target.checked ? "dark" : "light")} type="checkbox" />
            <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-surface-variant transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-checked:bg-primary-container after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
          <StaticSetting icon="security" label="Bảo mật" />
          <StaticSetting icon="receipt_long" label="Billing" />
        </div>
      </div>
    </section>
  );
}
