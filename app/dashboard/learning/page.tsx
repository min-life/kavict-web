import Link from "next/link";
import { LEARNING_MODULES } from "@/features/learning/catalog";

export default function LearningPath() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-label-md text-sm font-semibold uppercase tracking-[0.16em] text-primary">Lộ trình học tập</p>
          <h1 className="mt-2 font-headline-md text-3xl font-bold text-on-surface md:text-4xl">Học tài chính theo từng module</h1>
          <p className="mt-3 max-w-2xl font-body-md text-on-surface-variant">Bắt đầu từ nền tảng dòng tiền, rồi từng bước xây lá chắn tài chính và tư duy đầu tư có trách nhiệm.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-primary-container/30 bg-primary-container/10 px-4 py-3 text-primary">
          <span className="material-symbols-outlined" data-icon="school">school</span>
          <span className="font-label-md text-sm font-semibold">Module 1 là điểm bắt đầu</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {LEARNING_MODULES.map((module) => {
          const card = (
            <article className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border p-6 transition-all ${module.isPublished ? "border-outline-variant bg-surface-container-lowest shadow-soft hover:-translate-y-1 hover:border-primary hover:shadow-hover" : "border-outline-variant/60 bg-surface-container-low opacity-70"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label-md text-xs font-bold uppercase tracking-[0.16em] text-secondary">Module {module.id}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {module.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary-container/10 px-3 py-1 font-label-sm text-xs font-semibold text-primary">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-0.5" aria-label={`Độ khó ${module.difficulty} trên 5 sao`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={`material-symbols-outlined text-[18px] ${index < module.difficulty ? "text-primary" : "text-outline-variant"}`} data-icon="star">star</span>
                  ))}
                </div>
              </div>

              <div className="my-auto pt-8">
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${module.isPublished ? "bg-primary-container/10 text-primary" : "bg-surface-variant text-outline"}`}>
                  <span className="material-symbols-outlined text-3xl" data-icon={module.isPublished ? "account_tree" : "update"}>{module.isPublished ? "account_tree" : "update"}</span>
                </div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">{module.title}</h2>
                <p className="mt-2 font-body-md text-sm leading-6 text-on-surface-variant">{module.outcome}</p>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-outline-variant/50 pt-4">
                {module.isPublished ? (
                  <>
                    <span className="font-label-md text-xs text-on-surface-variant">{module.items.length} nội dung</span>
                    <span className="flex items-center gap-1 font-label-md text-sm font-semibold text-primary">Xem module <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span></span>
                  </>
                ) : (
                  <span className="font-label-md text-sm font-semibold text-on-surface-variant">Nền tảng sẽ update sớm</span>
                )}
              </div>
            </article>
          );

          return module.isPublished ? <Link key={module.id} href={`/dashboard/learning/module/${module.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{card}</Link> : <div key={module.id}>{card}</div>;
        })}
      </section>
    </div>
  );
}
