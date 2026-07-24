"use client";

import { useState } from "react";
import type { Objective } from "@/features/finance/domain";
import IconPicker from "./IconPicker";

type ObjectivesSectionProps = {
  objectives: Objective[];
  onSave: (nextObjectives: Objective[]) => Promise<void>;
  onToggleComplete: (id: string, isCompleted: boolean) => Promise<void>;
};

export default function ObjectivesSection({ objectives, onSave, onToggleComplete }: ObjectivesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Objective[]>(objectives);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [completionOverrides, setCompletionOverrides] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const hasPendingToggles = pendingIds.size > 0;
  const displayObjectives = objectives.map((objective) => completionOverrides[objective.id] === undefined ? objective : { ...objective, isCompleted: completionOverrides[objective.id] });
  const isEmpty = !isEditing && displayObjectives.length === 0;
  const sectionToneClass = isEmpty ? "border-outline-variant/20 bg-surface-container-low" : "border-outline-variant/30 bg-surface";
  const headingClassName = isEmpty ? "text-lg font-bold text-on-surface-variant" : "text-lg font-bold text-on-surface";
  const editButtonClassName = "rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 disabled:cursor-wait disabled:opacity-50";

  const toggle = async (objective: Objective) => {
    if (pendingIds.has(objective.id)) return;
    const nextCompleted = !objective.isCompleted;
    setCompletionOverrides((current) => ({ ...current, [objective.id]: nextCompleted }));
    setPendingIds((current) => new Set(current).add(objective.id));
    try {
      await onToggleComplete(objective.id, nextCompleted);
    } catch {
      setCompletionOverrides((current) => ({ ...current, [objective.id]: objective.isCompleted }));
    } finally {
      setPendingIds((current) => { const next = new Set(current); next.delete(objective.id); return next; });
    }
  };

  const update = (index: number, changes: Partial<Objective>) => setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
  const startEditing = () => { if (hasPendingToggles) return; setDraft(displayObjectives); setIsEditing(true); };
  const cancel = () => { setDraft(objectives); setIsEditing(false); };
  const save = async () => {
    if (isSaving || hasPendingToggles) return;
    setIsSaving(true);
    try {
      await onSave(draft.filter((item) => item.name.trim()).map((item) => ({ ...item, name: item.name.trim() })));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${sectionToneClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className={headingClassName}>Mục tiêu</h3><p className="mt-1 text-sm text-on-surface-variant">Đánh dấu ngay khi bạn hoàn thành từng mục tiêu.</p></div>{!isEditing && <button type="button" onClick={startEditing} disabled={hasPendingToggles} className={editButtonClassName}>Chỉnh sửa objective</button>}</div>
      <div className="mt-5 space-y-3">
        {isEditing ? draft.map((objective, index) => <div key={objective.id} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 p-4"><IconPicker currentIcon={objective.icon} currentColor={objective.color} onSelect={({ icon, color }) => update(index, { icon, color })}><button type="button" className={`material-symbols-outlined rounded-lg bg-surface-container p-2 ${objective.color ?? "text-primary"}`}>{objective.icon ?? "flag"}</button></IconPicker><input value={objective.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Tên mục tiêu" className="min-w-0 flex-1 rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary" /><button type="button" onClick={() => setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg px-3 py-2 text-sm font-bold text-error hover:bg-error/10">Xóa</button></div>) : displayObjectives.map((objective) => <label key={objective.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-outline-variant/30 p-4"><input type="checkbox" checked={objective.isCompleted} onChange={() => void toggle(objective)} disabled={pendingIds.has(objective.id)} className="size-5 accent-primary disabled:cursor-wait" /><span className={`material-symbols-outlined rounded-lg bg-surface-container p-2 ${objective.color ?? "text-primary"}`}>{objective.icon ?? "flag"}</span><span className={`min-w-0 flex-1 font-bold ${objective.isCompleted ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{objective.name}</span><span className="text-sm text-on-surface-variant">{objective.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}</span></label>)}
        {((isEditing && draft.length === 0) || (!isEditing && displayObjectives.length === 0)) && <p className="rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">Chưa có mục tiêu. Thêm mục tiêu để theo dõi việc cần làm.</p>}
      </div>
      {isEditing && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => setDraft((current) => [...current, { id: crypto.randomUUID(), name: "", isCompleted: false, icon: "flag", color: "text-primary" }])} className="rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10">Thêm mục tiêu</button><button type="button" onClick={() => void save()} disabled={isSaving || hasPendingToggles} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50">{isSaving ? "Đang lưu..." : "Lưu mục tiêu"}</button><button type="button" onClick={cancel} disabled={isSaving || hasPendingToggles} className="rounded-xl px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container">Hủy</button></div>}
    </section>
  );
}
