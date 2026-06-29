import Link from "next/link";

export default function LearningSelectionPage() {
  return (
    <div className="flex-1 w-full flex items-center justify-center p-md min-h-[calc(100vh-100px)]">
      <main className="w-full max-w-[900px] mx-auto grid md:grid-cols-2 gap-lg">
        {/* Card 1: Học tập theo lộ trình */}
        <div className="group w-full h-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-lg flex flex-col text-center gap-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary transition-all duration-300">
          <div className="flex-shrink-0 w-16 h-16 mx-auto bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-primary-container transition-colors duration-300">
            <span
              className="material-symbols-outlined text-headline-lg text-primary group-hover:text-on-primary transition-colors duration-300"
              style={{ fontVariationSettings: '"FILL" 0' }}
            >
              menu_book
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-xs w-full">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Học tập theo lộ trình
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant px-sm">
              Khám phá chương trình học được xây dựng theo từng cấp độ, từ kiến thức tài chính cơ bản đến quản lý tài sản và đầu tư. Theo dõi tiến độ và hoàn thành từng chặng đường học tập.
            </p>
          </div>
          <div className="flex-shrink-0 mt-auto">
            <Link
              href="/dashboard/learning/path"
              className="inline-flex h-12 px-8 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md rounded-lg transition-colors items-center justify-center"
            >
              Bắt đầu học
            </Link>
          </div>
        </div>

        {/* Card 2: Học tập với Gia sư AI */}
        <div className="group w-full h-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-lg flex flex-col text-center gap-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary transition-all duration-300">
          <div className="flex-shrink-0 w-16 h-16 mx-auto bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-primary-container transition-colors duration-300">
            <span
              className="material-symbols-outlined text-headline-lg text-primary group-hover:text-on-primary transition-colors duration-300"
              style={{ fontVariationSettings: '"FILL" 0' }}
            >
              smart_toy
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-xs w-full">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Học tập với Gia sư AI
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant px-sm">
              Trò chuyện cùng AI để đặt câu hỏi, giải thích các khái niệm tài chính, nhận hướng dẫn học tập và lời khuyên phù hợp với mục tiêu của bạn.
            </p>
          </div>
          <div className="flex-shrink-0 mt-auto">
            <Link
              href="/dashboard/learning/ai-tutor"
              className="inline-flex h-12 px-8 bg-surface-container-lowest border border-outline-variant/50 text-on-surface hover:border-primary hover:text-primary font-label-md text-label-md rounded-lg transition-all items-center justify-center"
            >
              Bắt đầu trò chuyện
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
