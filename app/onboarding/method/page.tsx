export default function OnboardingMethod() {
  return (
    <>

<main className="w-full max-w-[900px] mx-auto grid md:grid-cols-2 gap-lg items-center justify-center">
{/* Card 1: Học tập theo lộ trình */}
<div className="group aspect-square w-full bg-white rounded-2xl border border-[#E2E8F0] p-lg flex flex-col items-center justify-center text-center gap-md premium-shadow animate-fade-in-up" style={{animationDelay: '0.1s', opacity: 0}}>
<div className="flex-shrink-0 w-xl h-xl bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-primary-container transition-colors duration-300">
<span className="material-symbols-outlined text-headline-lg text-primary group-hover:text-white transition-colors duration-300" style={{fontVariationSettings: '"FILL" 0'}}>
                    menu_book
                </span>
</div>
<div className="flex-1 flex flex-col gap-xs">
<h2 className="font-headline-md text-headline-md text-[#0F172A]">Học tập theo lộ trình</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-[672px]">
                    Khám phá chương trình học được xây dựng theo từng cấp độ, từ kiến thức tài chính cơ bản đến quản lý tài sản và đầu tư. Theo dõi tiến độ và hoàn thành từng chặng đường học tập.
                </p>
</div>
<div className="flex-shrink-0">
<button className="h-12 px-xl bg-[#2563EB] hover:bg-primary text-white font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center">
                    Bắt đầu học
                </button>
</div>
</div>
{/* Card 2: Học tập với Gia sư AI */}
<div className="group aspect-square w-full bg-white rounded-2xl border border-[#E2E8F0] p-lg flex flex-col items-center justify-center text-center gap-md premium-shadow animate-fade-in-up" style={{animationDelay: '0.2s', opacity: 0}}>
<div className="flex-shrink-0 w-xl h-xl bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-primary-container transition-colors duration-300">
<span className="material-symbols-outlined text-headline-lg text-primary group-hover:text-white transition-colors duration-300" style={{fontVariationSettings: '"FILL" 0'}}>
                    smart_toy
                </span>
</div>
<div className="flex-1 flex flex-col gap-xs">
<h2 className="font-headline-md text-headline-md text-[#0F172A]">Học tập với Gia sư AI</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-[672px]">
                    Trò chuyện cùng AI để đặt câu hỏi, giải thích các khái niệm tài chính, nhận hướng dẫn học tập và lời khuyên phù hợp với mục tiêu của bạn.
                </p>
</div>
<div className="flex-shrink-0">
<button className="h-12 px-xl bg-white border border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] font-label-md text-label-md rounded-lg transition-all flex items-center justify-center">
                    Bắt đầu trò chuyện
                </button>
</div>
</div>
</main>



    </>
  );
}
