"use client";

import { useState } from "react";
import type { IncomePlan } from "@/features/finance/domain";
import type { IncomePlanProgress } from "@/features/finance/workspace";
import IconPicker from "./IconPicker";

type IncomePlanSectionProps = {
  incomePlans: IncomePlan[];
  progress: IncomePlanProgress[];
  onSave: (nextIncomePlans: IncomePlan[]) => Promise<void>;
};

function formatValue(value: number, unit: IncomePlan["unit"]) {
  return unit === "amount" ? `${new Intl.NumberFormat("vi-VN").format(value)} ₫` : `${value} lần`;
}

export default function IncomePlanSection({ incomePlans, progress, onSave }: IncomePlanSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<IncomePlan[]>(incomePlans);
  const [isSaving, setIsSaving] = useState(false);
  const isEmpty = !isEditing && progress.length === 0;
  const sectionToneClass = isEmpty ? "border-outline-variant/20 bg-surface-container-low" : "border-outline-variant/30 bg-surface";
  const headingClassName = isEmpty ? "text-lg font-bold text-on-surface-variant" : "text-lg font-bold text-on-surface";
  const editButtonClassName = isEmpty
    ? "rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
    : "rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10";

  const update = (index: number, changes: Partial<IncomePlan>) => {
    setDraft((current) => current.map((plan, itemIndex) => itemIndex === index ? { ...plan, ...changes } : plan));
  };

  const cancel = () => {
    setDraft(incomePlans);
    setIsEditing(false);
  };

  const save = async () => {
    if (isSaving) return;
    const validPlans = draft.filter((item) => (
      item.name.trim().length > 0
      && Number.isFinite(item.target)
      && item.target > 0
      && Number.isFinite(item.manualProgress)
      && item.manualProgress >= 0
    ));
    setIsSaving(true);
    try {
      await onSave(validPlans.map((item) => ({ ...item, name: item.name.trim(), transactionCategory: item.transactionCategory?.trim() || undefined })));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${sectionToneClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className={headingClassName}>Kế hoạch thu nhập</h3><p className="mt-1 text-sm text-on-surface-variant">Kết hợp giao dịch thu nhập của tháng đang chọn và tiến độ bạn tự nhập.</p></div>
         {!isEditing && <button type="button" onClick={() => { setDraft(incomePlans); setIsEditing(true); }} className={editButtonClassName}>Chỉnh sửa kế hoạch thu nhập</button>}
      </div>

      <div className="mt-5 space-y-3">
        {isEditing ? draft.map((item, index) => <div key={item.id} className="rounded-xl border border-outline-variant/30 p-4"><div className="grid gap-3 sm:grid-cols-2"><input value={item.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Tên kế hoạch" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><select value={item.unit} onChange={(event) => update(index, { unit: event.target.value as IncomePlan["unit"] })} className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"><option value="amount">Số tiền</option><option value="count">Số lần</option></select><input type="number" min="1" value={item.target || ""} onChange={(event) => update(index, { target: Number(event.target.value) })} placeholder="Mục tiêu" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><input type="number" min="0" value={item.manualProgress || ""} onChange={(event) => update(index, { manualProgress: Number(event.target.value) })} placeholder="Tiến độ nhập tay" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><input value={item.transactionCategory ?? ""} onChange={(event) => update(index, { transactionCategory: event.target.value })} placeholder="Danh mục giao dịch thu nhập (tuỳ chọn)" className="rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary sm:col-span-2" /></div><div className="mt-3 flex items-center justify-between"><IconPicker currentIcon={item.icon} currentColor={item.color} onSelect={({ icon, color }) => update(index, { icon, color })}><button type="button" className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold text-on-surface-variant hover:bg-surface-container"><span className={`material-symbols-outlined ${item.color ?? "text-primary"}`}>{item.icon ?? "payments"}</span>Chọn biểu tượng</button></IconPicker><button type="button" onClick={() => setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg px-3 py-2 text-sm font-bold text-error hover:bg-error/10">Xóa</button></div></div>) : progress.map((item) => <article key={item.id} className="rounded-xl border border-outline-variant/30 p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`material-symbols-outlined rounded-lg bg-surface-container p-2 ${item.color ?? "text-primary"}`}>{item.icon ?? "payments"}</span><div className="min-w-0"><p className="truncate font-bold text-on-surface">{item.name}</p><p className="mt-1 text-sm text-on-surface-variant">{formatValue(item.current, item.unit)} / {formatValue(item.target, item.unit)}</p>{item.transactionCategory && <p className="mt-1 text-xs text-on-surface-variant">Từ giao dịch “{item.transactionCategory}”: {formatValue(item.transactionProgress, item.unit)}</p>}<p className="mt-1 text-xs text-on-surface-variant">Tiến độ nhập tay: {formatValue(item.manualProgress, item.unit)}</p></div></div><span className="shrink-0 text-sm font-bold text-primary">{item.percent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{ width: `${item.displayPercent}%` }} /></div></article>)}
         {((isEditing && draft.length === 0) || (!isEditing && progress.length === 0)) && <p className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">Chưa có kế hoạch thu nhập. Thêm kế hoạch khi bạn sẵn sàng theo dõi.</p>}
      </div>

      {isEditing && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setDraft((current) => [...current, { id: crypto.randomUUID(), name: "", unit: "amount", target: 0, manualProgress: 0, icon: "payments", color: "text-primary" }])} className="rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10">Thêm kế hoạch</button><button type="button" onClick={() => void save()} disabled={isSaving} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu kế hoạch"}</button><button type="button" onClick={cancel} disabled={isSaving} className="rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button></div>}
    </section>
  );
}
