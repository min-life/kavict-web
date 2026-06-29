export default function OnboardingRole() {
  return (
    <>

{/* Decorative background blobs (Subtle) */}
<div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed-dim opacity-30 blur-[100px] pointer-events-none z-0"></div>
<div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-tertiary-fixed-dim opacity-20 blur-[80px] pointer-events-none z-0"></div>
{/* Main Container */}
<main className="w-full max-w-[720px] bg-surface-container-lowest rounded-xl ambient-shadow flex flex-col relative z-10 overflow-hidden">
{/* Top Progress Bar Container */}
<div className="w-full bg-surface-container-high h-[4px]">
<div aria-valuemax={6} aria-valuemin={1} aria-valuenow={1} className="bg-primary h-full w-[16.66%] rounded-r-full transition-all duration-700 ease-out" role="progressbar"></div>
</div>
<div className="p-md md:p-xl flex flex-col gap-lg md:gap-xl">
{/* Header Section */}
<header className="flex flex-col gap-xs text-center">
<span className="font-label-sm text-label-sm text-primary font-bold tracking-wider uppercase">Bước 1 / 6</span>
<h1 className="font-headline-md text-headline-md text-on-surface">Bạn thuộc nhóm nào?</h1>

</header>
{/* Selection Grid Form */}
<form className="flex flex-col gap-xl" id="onboarding-form">
<fieldset className="grid grid-cols-2 md:grid-cols-3 gap-sm md:gap-md">
<legend className="visually-hidden">Chọn nhóm đối tượng của bạn</legend>
{/* Option 1: Học sinh */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" required type="radio" value="hoc_sinh" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">school</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Học sinh</span>
</div>
</label>
{/* Option 2: Sinh viên */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" type="radio" value="sinh_vien" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">local_library</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Sinh viên</span>
</div>
</label>
{/* Option 3: Nhân viên văn phòng */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" type="radio" value="nhan_vien_vp" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">work</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Nhân viên văn phòng</span>
</div>
</label>
{/* Option 4: Freelancer */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" type="radio" value="freelancer" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">laptop_mac</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Freelancer</span>
</div>
</label>
{/* Option 5: Chủ doanh nghiệp */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" type="radio" value="chu_doanh_nghiep" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">storefront</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Chủ doanh nghiệp</span>
</div>
</label>
{/* Option 6: Khác */}
<label className="cursor-pointer relative group">
<input className="visually-hidden" name="user_group" type="radio" value="khac" />
<div className="flex flex-col items-center justify-center gap-sm p-md rounded-lg border border-outline-variant bg-surface hover:border-primary-fixed-dim transition-all duration-200 h-full text-center hover-lift">
<span className="material-symbols-outlined icon-container text-tertiary text-[32px] transition-colors duration-200">category</span>
<span className="font-label-md text-label-md text-on-surface label-text transition-colors duration-200">Khác</span>
</div>
</label>
</fieldset>
{/* Actions / Footer */}
<div className="flex items-center pt-lg border-t border-surface-container-high mt-auto justify-center">

<button className="flex items-center justify-center gap-xs px-xl py-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed h-[48px]" disabled id="btn-continue" type="submit">
                        Tiếp tục
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</form>
</div>
</main>




    </>
  );
}
