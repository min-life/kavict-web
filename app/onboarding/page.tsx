export default function OnboardingWelcome() {
  return (
    <>

{/* Progress Bar Section (Top) */}

{/* Main Content Canvas */}
<main className="flex-grow flex flex-col items-center justify-center px-gutter py-xl">
<div className="w-full max-w-[448px] mx-auto text-center space-y-md">
{/* Brand Mark / Icon Placeholder */}

{/* Typography */}
<div className="space-y-sm">
<h1 className="font-display text-headline-lg-mobile md:text-display text-on-surface">Chào mừng đến với KAVICT</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-[384px] mx-auto leading-relaxed">
                    Trả lời một vài câu hỏi để chúng tôi xây dựng lộ trình học và giải pháp tài chính phù hợp với bạn.
                </p>
</div>
{/* Action Area */}
<div className="pt-lg">
<button className="w-full md:w-auto min-w-[200px] h-[48px] inline-flex items-center justify-center bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors duration-200 active:scale-95 shadow-sm hover:shadow-md">
                    Bắt đầu
                    <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
</button>
</div>
</div>
</main>
{/* Navigation Shell suppressed due to linear/transactional intent of onboarding screen. */}



    </>
  );
}
