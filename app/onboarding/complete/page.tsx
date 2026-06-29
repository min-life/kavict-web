export default function OnboardingComplete() {
  return (
    <>

{/* Background Gradient Effects */}
<div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
<div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
<main className="w-full max-w-container-max px-gutter relative z-10 flex flex-col items-center justify-center h-full min-h-[1024px]">
{/* Logo / Brand Anchor */}
<div className="mb-lg text-center">

</div>
{/* Success Animation */}
<div className="mb-lg flex justify-center">
<svg className="success-checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
<circle className="success-checkmark__circle" cx="26" cy="26" fill="none" r="25"></circle>
<path className="success-checkmark__check" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none"></path>
</svg>
</div>
{/* Messaging */}
<div className="mb-xl text-center">
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Mọi thứ đã sẵn sàng!</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-[400px] mx-auto">
                    KAVICT đã xây dựng lộ trình học phù hợp dành riêng cho bạn.
                </p>
</div>
{/* Action Buttons */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-sm">
<button className="w-full sm:w-auto h-[48px] px-lg bg-primary-container text-on-primary font-label-md text-label-md rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-xs">
<span className="">Bắt đầu học</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>

</div>
</main>




    </>
  );
}
