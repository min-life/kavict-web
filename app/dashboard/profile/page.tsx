"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import type { ProfilePreferencesInput } from "@/features/auth/domain";
import {
  ACHIEVEMENT_SECTIONS,
  AVATAR_OPTIONS,
  findAvatar,
  RESPONSE_STYLE_OPTIONS,
  TONE_OPTIONS,
} from "./profileModel";

type ProfileTab = "information" | "achievement";

function CharacterAvatar({ avatarKey, size = "large" }: { avatarKey: string | null | undefined; size?: "large" | "small" }) {
  const avatar = findAvatar(avatarKey);
  const dimensions = size === "large" ? "h-28 w-28 text-5xl" : "h-14 w-14 text-2xl";

  if (!avatar) {
    return (
      <div className={`${dimensions} rounded-[2rem] border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-on-surface-variant`}>
        <span className="material-symbols-outlined text-[32px]">person</span>
      </div>
    );
  }

  return (
    <div className={`${dimensions} rounded-[2rem] bg-gradient-to-br ${avatar.colors} shadow-soft flex items-center justify-center border-4 border-surface-container-lowest`} aria-label={`Avatar ${avatar.label}`}>
      <span aria-hidden="true">{avatar.emoji}</span>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-on-surface-variant">{label}</p>
        <p className="truncate font-label-md text-label-md text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-soft transition-shadow hover:shadow-hover">
      <div className="mb-4 flex items-center gap-2 text-on-surface-variant">
        <span className={`material-symbols-outlined ${tone}`}>{icon}</span>
        <span className="font-label-sm text-label-sm uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-headline-md text-headline-md text-on-surface">{value}</p>
    </div>
  );
}

export default function UserProfile() {
  const { user, userProfile, updateProfilePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("information");
  const [draftPreferences, setDraftPreferences] = useState<ProfilePreferencesInput | null>(null);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const profilePreferences = draftPreferences ?? {
    avatarKey: userProfile?.avatarKey ?? null,
    informationForKavi: userProfile?.informationForKavi ?? "",
    kaviTone: userProfile?.kaviTone ?? "vui vẻ",
    responseStyle: userProfile?.responseStyle ?? "concise",
  };
  const updatePreferences = (changes: Partial<ProfilePreferencesInput>) => {
    setDraftPreferences({ ...profilePreferences, ...changes });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateProfilePreferences({ ...profilePreferences, informationForKavi: profilePreferences.informationForKavi.trim() });
      setSaveMessage("Đã lưu cá nhân hóa của bạn.");
    } catch {
      setSaveMessage("Không thể lưu ngay lúc này. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-[72rem] pb-lg">
      <header className="mb-lg">
        <p className="mb-2 font-label-md text-label-md text-primary">Hồ sơ của bạn</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Không gian của riêng bạn</h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Cập nhật cách Kavi đồng hành và theo dõi hành trình bạn đã xây dựng.</p>
      </header>

      <div className="mb-lg inline-flex rounded-xl bg-surface-container p-1" role="tablist" aria-label="Hồ sơ người dùng">
        <button id="profile-information-tab" role="tab" type="button" aria-selected={activeTab === "information"} aria-controls="profile-information-panel" onClick={() => setActiveTab("information")} className={`rounded-lg px-4 py-2.5 font-label-md text-label-md transition-colors ${activeTab === "information" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
          My Information
        </button>
        <button id="profile-achievement-tab" role="tab" type="button" aria-selected={activeTab === "achievement"} aria-controls="profile-achievement-panel" onClick={() => setActiveTab("achievement")} className={`rounded-lg px-4 py-2.5 font-label-md text-label-md transition-colors ${activeTab === "achievement" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
          My Achievement
        </button>
      </div>

      {activeTab === "information" ? (
        <div id="profile-information-panel" role="tabpanel" aria-labelledby="profile-information-tab" className="space-y-md">
          <div className="grid grid-cols-1 gap-md xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft">
              <div className="flex flex-col items-center text-center">
                <button type="button" onClick={() => setShowCharacterPicker((isOpen) => !isOpen)} className="group rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:ring-offset-surface" aria-expanded={showCharacterPicker} aria-controls="character-picker">
                  <CharacterAvatar avatarKey={profilePreferences.avatarKey} />
                  <span className="sr-only">Chọn nhân vật đại diện</span>
                </button>
                <h2 className="mt-4 font-headline-md text-headline-md text-on-surface">{userProfile?.preferredName || user?.displayName || "Người dùng"}</h2>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{user?.email || "Chưa cập nhật email"}</p>
                <button type="button" onClick={() => setShowCharacterPicker((isOpen) => !isOpen)} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container" aria-expanded={showCharacterPicker} aria-controls="character-picker">
                  <span className="material-symbols-outlined text-[18px]">face</span>
                  Select character
                </button>
              </div>

              {showCharacterPicker && (
                <div id="character-picker" className="mt-6 border-t border-outline-variant pt-5">
                  <p className="mb-3 text-center font-label-md text-label-md text-on-surface">Chọn nhân vật vui nhộn cho hồ sơ</p>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button key={avatar.key} type="button" onClick={() => { updatePreferences({ avatarKey: avatar.key }); setShowCharacterPicker(false); }} className={`rounded-xl p-2 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary ${profilePreferences.avatarKey === avatar.key ? "bg-primary-container/20 ring-2 ring-primary" : "bg-surface-container-low"}`} aria-label={`Chọn ${avatar.label}`}>
                        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.colors} text-2xl`}>{avatar.emoji}</div>
                        <span className="mt-1 block truncate font-label-sm text-label-sm text-on-surface">{avatar.label.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/15 text-primary"><span className="material-symbols-outlined">badge</span></div>
                <div><h2 className="font-headline-md text-body-lg text-on-surface">Basic Information</h2><p className="font-body-sm text-body-sm text-on-surface-variant">Thông tin nền tảng của tài khoản.</p></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow icon="person" label="Tên" value={userProfile?.preferredName || user?.displayName || "Chưa cập nhật"} />
                <DetailRow icon="cake" label="Tuổi" value="Chưa cập nhật" />
                <DetailRow icon="mail" label="Email" value={user?.email || "Chưa cập nhật"} />
                <DetailRow icon="calendar_month" label="Tham gia nền tảng" value="Chưa cập nhật" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft">
            <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container/50 text-on-secondary-container"><span className="material-symbols-outlined">tune</span></div><div><h2 className="font-headline-md text-body-lg text-on-surface">Personalization</h2><p className="font-body-sm text-body-sm text-on-surface-variant">Giúp Kavi hiểu và trò chuyện với bạn phù hợp hơn.</p></div></div>
            <label className="block"><span className="font-label-md text-label-md text-on-surface">What information you want Kavi to know</span><textarea value={profilePreferences.informationForKavi} onChange={(event) => updatePreferences({ informationForKavi: event.target.value })} rows={4} maxLength={500} placeholder="Ví dụ: Mình là sinh viên, muốn quản lý chi tiêu tốt hơn và đang tiết kiệm cho một chuyến đi..." className="mt-2 w-full resize-y rounded-xl border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <div className="mt-6"><p className="font-label-md text-label-md text-on-surface">How you want Kavi behave</p><p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Chọn tone giao tiếp của Kavi.</p><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{TONE_OPTIONS.map((tone) => <button key={tone.value} type="button" onClick={() => updatePreferences({ kaviTone: tone.value })} className={`rounded-xl border p-3 text-left transition-colors ${profilePreferences.kaviTone === tone.value ? "border-primary bg-primary-container/15 text-primary" : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container"}`}><span className="material-symbols-outlined mb-2 block">{tone.icon}</span><span className="font-label-md text-label-md">{tone.label}</span></button>)}</div></div>
            <div className="mt-6"><p className="font-label-md text-label-md text-on-surface">Cách trả lời</p><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{RESPONSE_STYLE_OPTIONS.map((option) => <button key={option.value} type="button" onClick={() => updatePreferences({ responseStyle: option.value })} className={`rounded-xl border p-4 text-left transition-colors ${profilePreferences.responseStyle === option.value ? "border-primary bg-primary-container/15" : "border-outline-variant bg-surface hover:bg-surface-container"}`}><span className="font-label-md text-label-md text-on-surface">{option.label}</span><span className="mt-1 block font-body-sm text-body-sm text-on-surface-variant">{option.description}</span></button>)}</div></div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-5"><p className={`font-label-sm text-label-sm ${saveMessage?.startsWith("Đã") ? "text-success" : "text-error"}`} aria-live="polite">{saveMessage}</p><button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-60">{isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />}{isSaving ? "Đang lưu" : "Lưu thay đổi"}</button></div>
          </div>
        </div>
      ) : (
        <div id="profile-achievement-panel" role="tabpanel" aria-labelledby="profile-achievement-tab" className="space-y-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard icon="workspace_premium" label="Tổng kinh nghiệm" value="15,820 XP" tone="text-primary" /><MetricCard icon="monetization_on" label="Kavi coin" value="1,240 coin" tone="text-amber-500" /><MetricCard icon="local_fire_department" label="Streak" value="30 ngày" tone="text-orange-500" /></div>
          <div className="rounded-2xl bg-surface-container-lowest p-md shadow-soft"><div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-container/50 text-on-tertiary-container"><span className="material-symbols-outlined">military_tech</span></div><div><h2 className="font-headline-md text-body-lg text-on-surface">Huy hiệu đã đạt được</h2><p className="font-body-sm text-body-sm text-on-surface-variant">Những cột mốc đáng tự hào trên hành trình của bạn.</p></div></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ icon: "trophy", label: "Top 10 Leaderboard", color: "text-amber-500 bg-amber-50" }, { icon: "local_fire_department", label: "Streak 30 ngày", color: "text-orange-500 bg-orange-50" }, { icon: "account_balance_wallet", label: "Chuyên gia chi tiêu", color: "text-blue-500 bg-blue-50" }].map((badge) => <div key={badge.label} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${badge.color}`}><span className="material-symbols-outlined">{badge.icon}</span></div><span className="font-label-md text-label-md text-on-surface">{badge.label}</span></div>)}</div></div>
          <div className="grid grid-cols-1 gap-md lg:grid-cols-3">{ACHIEVEMENT_SECTIONS.map((section) => <div key={section.title} className="rounded-2xl bg-surface-container-lowest p-md shadow-soft"><div className="mb-5 flex items-center gap-3"><span className={`material-symbols-outlined ${section.color}`}>{section.icon}</span><h2 className="font-headline-md text-body-lg text-on-surface">{section.title}</h2></div><dl className="space-y-4">{section.items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-outline-variant pb-3 last:border-0 last:pb-0"><dt className="font-body-sm text-body-sm text-on-surface-variant">{label}</dt><dd className="shrink-0 font-label-md text-label-md text-on-surface">{value}</dd></div>)}</dl></div>)}</div>
        </div>
      )}
    </section>
  );
}
