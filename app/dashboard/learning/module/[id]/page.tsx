import Link from "next/link";
import { getLearningModule } from "@/features/learning/catalog";

type ModuleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { id } = await params;
  const learningModule = getLearningModule(id);

  if (!learningModule || !learningModule.isPublished) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-12 md:px-8">
        <section className="w-full rounded-[28px] border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-soft">
          <span className="material-symbols-outlined text-4xl text-outline" data-icon="update">update</span>
          <h1 className="mt-4 font-headline-md text-2xl font-bold text-on-surface">Module này chưa sẵn sàng</h1>
          <p className="mt-3 font-body-md text-on-surface-variant">Hãy quay lại lộ trình để chọn một module đã được mở.</p>
          <Link href="/dashboard/learning" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-label-md font-semibold text-on-primary">Về lộ trình học</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <Link href="/dashboard/learning" className="inline-flex items-center gap-1 font-label-md text-sm font-semibold text-secondary transition-colors hover:text-primary">
        <span className="material-symbols-outlined text-[18px]" data-icon="arrow_back">arrow_back</span>
        Tất cả module
      </Link>

      <section className="mt-6 rounded-[32px] border border-primary-container/30 bg-primary-container/10 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-label-md text-sm font-bold uppercase tracking-[0.16em] text-primary">Module {learningModule.id}</p>
            <h1 className="mt-2 font-headline-md text-3xl font-bold text-on-surface md:text-4xl">{learningModule.title}</h1>
            <p className="mt-3 max-w-2xl font-body-md text-on-surface-variant">{learningModule.outcome}</p>
          </div>
          <div className="flex gap-0.5" aria-label={`Độ khó ${learningModule.difficulty} trên 5 sao`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={`material-symbols-outlined ${index < learningModule.difficulty ? "text-primary" : "text-outline-variant"}`} data-icon="star">star</span>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {learningModule.tags.map((tag) => <span key={tag} className="rounded-full bg-surface-container-lowest px-3 py-1 font-label-sm text-xs font-semibold text-primary">{tag}</span>)}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-label-md text-sm font-semibold uppercase tracking-[0.14em] text-secondary">Lộ trình module</p>
            <h2 className="mt-1 font-headline-md text-2xl font-bold text-on-surface">Bài học & bài kiểm tra</h2>
          </div>
          <span className="rounded-full bg-surface-container px-3 py-1 font-label-md text-sm text-on-surface-variant">{learningModule.items.length} nội dung</span>
        </div>

        <div className="space-y-3">
          {learningModule.items.map((item, index) => {
            const content = (
              <article className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors md:p-5 ${item.isPremium ? "border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-variant" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary-container hover:bg-primary-container/5"}`}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-label-md font-bold ${item.isPremium ? "bg-surface-variant text-outline" : "bg-primary-container/10 text-primary"}`}>{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-label-md font-semibold">{item.title}</p>
                    {item.isPremium && <span className="inline-flex items-center gap-1 rounded-full bg-surface-variant px-2 py-0.5 font-label-sm text-xs font-semibold text-primary"><span className="material-symbols-outlined text-[14px]" data-icon="star">star</span>Premium</span>}
                  </div>
                  <p className="mt-1 font-body-md text-sm">{item.description}</p>
                  <p className="mt-2 font-label-sm text-xs uppercase tracking-wide">{item.kind === "test" ? "Bài kiểm tra module" : "Bài học"} · {item.duration}</p>
                </div>
                <span className="material-symbols-outlined shrink-0 text-[22px]" data-icon={item.isPremium ? "lock" : "arrow_forward"}>{item.isPremium ? "lock" : "arrow_forward"}</span>
              </article>
            );

            return item.isPremium ? <Link key={item.id} href="/dashboard/upgrade" className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{content}</Link> : <Link key={item.id} href={`/dashboard/learning/lesson/${item.lessonId}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{content}</Link>;
          })}
        </div>
      </section>
    </div>
  );
}
