import Link from "next/link";

export default function LearningPath() {
  return (
    <>
<div className="sticky top-0 z-50 w-full h-0 flex justify-end items-start pointer-events-none">
{/* Streak & Achievements Card */}
<div className="bg-surface-container-lowest rounded-[24px] p-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-surface-variant flex items-center gap-md fade-in-up pointer-events-auto">
<div className="flex items-center gap-xs">
<span className="text-display text-2xl">🔥</span>
<div>
<div className="font-label-sm text-label-sm text-secondary">Streak</div>
<div className="font-headline-md text-headline-md text-on-surface">15 ngày</div>
</div>
</div>
<div className="w-px h-10 bg-surface-variant"></div>
<div className="flex items-center gap-xs">
<span className="text-display text-2xl">🏆</span>
<div>
<div className="font-label-sm text-label-sm text-secondary">Bài học</div>
<div className="font-headline-md text-headline-md text-on-surface">28</div>
</div>
</div>
<div className="w-px h-10 bg-surface-variant"></div>
<div className="flex items-center gap-xs">
<div className="font-label-md text-label-md text-primary font-bold">1.450 XP</div>
</div>
<div className="w-px h-10 bg-surface-variant"></div>
<div className="relative w-12 h-12 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
<path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="3"></path>
</svg>
<span className="absolute font-label-sm text-label-sm text-on-surface">80%</span>
</div>
</div>
</div>
{/* Main Map Container */}
<div className="relative w-full max-w-container-max mx-auto flex flex-col items-center min-h-[900px]">
<svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
{/* Background path for all lessons (Gray) */}
<path 
  d="M 50 95 C 50 88.5, 30 88.5, 30 82 C 30 77, 70 77, 70 72 C 70 66.5, 50 66.5, 50 61 C 50 53.5, 35 53.5, 35 46 C 35 41, 65 41, 65 36 C 65 31, 30 31, 30 26 C 30 21.5, 70 21.5, 70 17 C 70 13, 50 13, 50 9 L 50 -10" 
  fill="none" 
  stroke="#CBD5E1" 
  strokeWidth="4" 
  strokeLinecap="round" 
  strokeDasharray="2 3" 
  vectorEffect="non-scaling-stroke"
/>
{/* Completed path segment (Blue) - covers levels 1 to 4 */}
<path 
  d="M 50 95 C 50 88.5, 30 88.5, 30 82 C 30 77, 70 77, 70 72 C 70 66.5, 50 66.5, 50 61" 
  fill="none" 
  stroke="#2563EB" 
  strokeWidth="6" 
  strokeLinecap="round" 
  vectorEffect="non-scaling-stroke"
/>
</svg>
{/* Nodes Container (Positioned absolutely over the path) */}
<div className="absolute inset-0 w-full h-full z-10">
{/* Level 9: Tự do tài chính (Locked) */}
<div className="absolute top-[5%] left-[50%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.9s'}}>
<div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center node-hover shadow-sm">
<span className="material-symbols-outlined text-outline text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>lock</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Tự do tài chính</span>
</div>
{/* Level 8: Phân bổ tài sản (Locked) */}
<div className="absolute top-[13%] left-[70%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.8s'}}>
<div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center node-hover shadow-sm">
<span className="material-symbols-outlined text-outline text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>lock</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Phân bổ tài sản</span>
</div>
{/* Level 7: Crypto (Locked) */}
<div className="absolute top-[22%] left-[30%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.7s'}}>
<div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center node-hover shadow-sm">
<span className="material-symbols-outlined text-outline text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>lock</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Crypto</span>
</div>
{/* Level 6: Quỹ mở (Locked) */}
<div className="absolute top-[32%] left-[65%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.6s'}}>
<div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center node-hover shadow-sm">
<span className="material-symbols-outlined text-outline text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>lock</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Quỹ mở</span>
</div>
{/* Level 5: Đầu tư chứng khoán (Locked) */}
<div className="absolute top-[42%] left-[35%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.5s'}}>
<div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-surface-variant flex items-center justify-center node-hover shadow-sm">
<span className="material-symbols-outlined text-outline text-2xl" style={{fontVariationSettings: '"FILL" 1'}}>lock</span>
</div>
<span className="font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Đầu tư chứng khoán</span>
</div>
{/* Level 4: Lãi kép (Current) */}
<div className="absolute top-[55%] left-[50%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up z-20" style={{animationDelay: '0.4s'}}>
<Link href="/dashboard/learning/path/lesson/4" className="relative group">
{/* Tooltip */}
<div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-on-background text-surface-container-lowest px-4 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none before:content-[''] before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-on-background">
                        Tiếp tục học
                    </div>
{/* Node */}
<div className="w-24 h-24 rounded-full bg-surface-container-lowest border-4 border-[#F59E0B] flex items-center justify-center relative cursor-pointer node-hover shadow-[0_12px_40px_rgba(245,158,11,0.2)]">
<div className="absolute inset-0 rounded-full border-4 border-[#F59E0B] pulse-ring"></div>
<span className="material-symbols-outlined text-[#F59E0B] text-4xl" style={{fontVariationSettings: '"FILL" 1'}}>play_arrow</span>
</div>
</Link>
<span className="font-headline-md text-headline-md text-on-surface bg-surface-container-lowest px-4 py-2 rounded-full shadow-md border border-[#F59E0B]/30 mt-2 font-bold">Lãi kép</span>
</div>
{/* Level 3: Quỹ dự phòng (Completed) */}
<div className="absolute top-[68%] left-[70%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.3s'}}>
<div className="w-16 h-16 rounded-full bg-primary-container border-4 border-primary-container flex items-center justify-center cursor-pointer node-hover shadow-[0_8px_30px_rgba(37,99,235,0.2)] relative">
<div className="absolute inset-0 rounded-full bg-primary-container blur-sm opacity-50"></div>
<span className="material-symbols-outlined text-on-primary text-2xl relative z-10" style={{fontVariationSettings: '"FILL" 1'}}>check</span>
</div>
<span className="font-label-md text-label-md text-on-surface bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Quỹ dự phòng</span>
</div>
{/* Level 2: Tiết kiệm (Completed) */}
<div className="absolute top-[78%] left-[30%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.2s'}}>
<div className="w-16 h-16 rounded-full bg-primary-container border-4 border-primary-container flex items-center justify-center cursor-pointer node-hover shadow-[0_8px_30px_rgba(37,99,235,0.2)] relative">
<div className="absolute inset-0 rounded-full bg-primary-container blur-sm opacity-50"></div>
<span className="material-symbols-outlined text-on-primary text-2xl relative z-10" style={{fontVariationSettings: '"FILL" 1'}}>check</span>
</div>
<span className="font-label-md text-label-md text-on-surface bg-surface-container-lowest px-3 py-1 rounded-full shadow-sm border border-surface-variant">Tiết kiệm</span>
</div>
{/* Level 1: Quản lý chi tiêu (Completed - Start) */}
<div className="absolute top-[90%] left-[50%] -translate-x-1/2 flex flex-col items-center gap-xs fade-in-up" style={{animationDelay: '0.1s'}}>
<div className="w-20 h-20 rounded-full bg-primary-container border-4 border-primary-container flex items-center justify-center cursor-pointer node-hover shadow-[0_8px_30px_rgba(37,99,235,0.2)] relative">
<div className="absolute inset-0 rounded-full bg-primary-container blur-sm opacity-50"></div>
<span className="material-symbols-outlined text-on-primary text-3xl relative z-10" style={{fontVariationSettings: '"FILL" 1'}}>check</span>
</div>
<span className="font-label-md text-label-md text-on-surface bg-surface-container-lowest px-4 py-2 rounded-full shadow-sm border border-surface-variant font-bold">Quản lý chi tiêu</span>
</div>
</div>
</div>



    </>
  );
}
