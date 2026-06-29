export default function UserProfile() {
  return (
    <>


<div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
{/* Left Column: Profile, Membership, Quick Settings */}
<div className="lg:col-span-4 flex flex-col gap-md">
{/* 1. Hồ sơ cá nhân */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover">
<div className="flex flex-col items-center text-center">
<div className="relative mb-4 group">
<img className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-sm" data-alt="A highly detailed portrait of a young professional in a minimalist setting. High-key lighting, bright modern SaaS aesthetic. Deep blacks and pristine whites with vibrant blue accents. Calm, confident mood, soft rounded features." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhXHkdDj6h60s8VmIBtl2_gYPDCSAN84hELqW2hbQw6jLCjZjdXiFKHYOABqQhHvTN4wHsKiOC9IOEOiMcmdMA6wpUGfz7yat_euYPpMFcl4qYuy-m-TZ2RsZuIW7KfknJSL1pth_7fUgBGArFRl5tAzQhnzhQfiSXr3z9simZoZMz0HhRuwXmgKv7emWYs9JFYx9k7sVoMZzhBg1usfdSJMeCzDj9tRLTDaC3yKSuxW5NQR7dk4YfWLrSH-L5TpwVQwCkaNw1UHc"/>
<button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container rounded-full p-1.5 shadow-md hover:bg-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">edit</span>
</button>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface mb-1">Nguyễn Văn A</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-4">nguyenvana@example.com</p>
<div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 text-primary-container rounded-full mb-6">
<span className="material-symbols-outlined text-[18px]">workspace_premium</span>
<span className="font-label-md text-label-md font-semibold">Gói Premium</span>
</div>
<button className="w-full h-12 flex items-center justify-center gap-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                            Chỉnh sửa hồ sơ
                        </button>
</div>
</div>
{/* 8. Gói thành viên */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover relative overflow-hidden">
<div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-container/5 rounded-full blur-xl"></div>
<div className="flex items-center gap-3 mb-4">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined">stars</span>
</div>
<div>
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Mastery Premium</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">Đang hoạt động</p>
</div>
</div>
<div className="bg-surface-container-low rounded-lg p-3 mb-4">
<div className="flex justify-between items-center mb-1">
<span className="font-label-md text-label-md text-on-surface-variant">Thời gian còn lại</span>
<span className="font-label-md text-label-md font-semibold text-primary-container">18 ngày</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-1.5 mt-2 overflow-hidden">
<div className="bg-primary-container h-1.5 rounded-full" style={{width: '70%'}}></div>
</div>
</div>
<button className="w-full h-12 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-label-md text-label-md rounded-lg hover:bg-primary transition-colors shadow-sm">
                        Gia hạn / Nâng cấp
                    </button>
</div>
{/* 7. Cài đặt nhanh */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover">
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-4">Cài đặt chung</h3>
<ul className="flex flex-col gap-2">
<li>
<a className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group" href="#">
<div className="flex items-center gap-3 text-on-surface-variant group-hover:text-primary-container transition-colors">
<span className="material-symbols-outlined text-[20px]">notifications</span>
<span className="font-body-md text-body-md text-sm">Thông báo</span>
</div>
<span className="material-symbols-outlined text-[20px] text-outline-variant">chevron_right</span>
</a>
</li>
<li>
<a className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group" href="#">
<div className="flex items-center gap-3 text-on-surface-variant group-hover:text-primary-container transition-colors">
<span className="material-symbols-outlined text-[20px]">language</span>
<span className="font-body-md text-body-md text-sm">Ngôn ngữ</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Tiếng Việt</span>
</a>
</li>
<li>
<div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors">
<div className="flex items-center gap-3 text-on-surface-variant">
<span className="material-symbols-outlined text-[20px]">dark_mode</span>
<span className="font-body-md text-body-md text-sm">Chế độ tối</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" value=""/>
<div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-defaultChecked:bg-primary-container"></div>
</label>
</div>
</li>
<li>
<a className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-colors group" href="#">
<div className="flex items-center gap-3 text-on-surface-variant group-hover:text-primary-container transition-colors">
<span className="material-symbols-outlined text-[20px]">security</span>
<span className="font-body-md text-body-md text-sm">Bảo mật</span>
</div>
<span className="material-symbols-outlined text-[20px] text-outline-variant">chevron_right</span>
</a>
</li>
</ul>
</div>
</div>
{/* Right Column: Stats, Progress, Activity */}
<div className="lg:col-span-8 flex flex-col gap-md">
{/* 2. Thành tích học tập (Bento style) */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{/* XP & Level Card */}
<div className="col-span-2 bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover flex flex-col justify-between relative overflow-hidden">
<div className="absolute right-0 top-0 w-32 h-32 bg-primary-container/5 rounded-bl-full"></div>
<div className="flex justify-between items-start mb-4 relative z-10">
<div>
<h3 className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Tổng kinh nghiệm</h3>
<div className="font-headline-lg text-headline-lg font-bold text-on-surface">15,820 <span className="text-sm font-normal text-on-surface-variant">XP</span></div>
</div>
<div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[24px]">military_tech</span>
</div>
</div>
<div className="relative z-10">
<div className="flex justify-between items-end mb-2">
<span className="font-label-md text-label-md font-semibold text-on-surface">Level 12</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">75% đến Lv 13</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
<div className="bg-primary-container h-2 rounded-full" style={{width: '75%'}}></div>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 transition-all-300 shadow-hover flex flex-col justify-center">
<div className="flex items-center gap-2 mb-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Bài học</span>
</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface">145</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 transition-all-300 shadow-hover flex flex-col justify-center">
<div className="flex items-center gap-2 mb-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">local_fire_department</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-orange-500">Streak</span>
</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface">30 <span className="text-sm font-normal text-on-surface-variant">ngày</span></div>
</div>
</div>
{/* 5. Thống kê tài khoản */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex items-center gap-4 transition-all-300 shadow-hover border border-transparent hover:border-primary-container/20">
<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
<span className="material-symbols-outlined">smart_toy</span>
</div>
<div>
<div className="font-headline-md text-body-lg font-bold text-on-surface">124</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Câu hỏi AI</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex items-center gap-4 transition-all-300 shadow-hover border border-transparent hover:border-primary-container/20">
<div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
<span className="material-symbols-outlined">edit_note</span>
</div>
<div>
<div className="font-headline-md text-body-lg font-bold text-on-surface">56</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Ghi chú</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex items-center gap-4 transition-all-300 shadow-hover border border-transparent hover:border-primary-container/20">
<div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
<span className="material-symbols-outlined">style</span>
</div>
<div>
<div className="font-headline-md text-body-lg font-bold text-on-surface">210</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Flashcards</div>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-md">
{/* 4. Mục tiêu tài chính */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Mục tiêu tài chính</h3>
<button className="text-primary-container hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
</button>
</div>
<div className="flex flex-col gap-5">
<div>
<div className="flex justify-between items-center mb-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">home</span>
<span className="font-label-md text-label-md text-on-surface">Mua nhà</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">45%</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
<div className="bg-primary-container h-2 rounded-full" style={{width: '45%'}}></div>
</div>
</div>
<div>
<div className="flex justify-between items-center mb-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-on-surface-variant">health_and_safety</span>
<span className="font-label-md text-label-md text-on-surface">Quỹ khẩn cấp</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">80%</span>
</div>
<div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
<div className="bg-emerald-500 h-2 rounded-full" style={{width: '80%'}}></div>
</div>
</div>
</div>
</div>
{/* 3. Huy hiệu đạt được */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Huy hiệu nổi bật</h3>
<a className="font-label-sm text-label-sm text-primary-container hover:underline" href="#">Xem tất cả</a>
</div>
<div className="grid grid-cols-3 gap-3">
<div className="flex flex-col items-center text-center group cursor-pointer">
<div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-2 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">trophy</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant leading-tight">Top 10<br/>Leaderboard</span>
</div>
<div className="flex flex-col items-center text-center group cursor-pointer">
<div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 mb-2 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">local_fire_department</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant leading-tight">Streak<br/>30 ngày</span>
</div>
<div className="flex flex-col items-center text-center group cursor-pointer">
<div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant leading-tight">Chuyên gia<br/>Chi tiêu</span>
</div>
</div>
</div>
</div>
{/* 6. Hoạt động gần đây */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md transition-all-300 shadow-hover">
<h3 className="font-headline-md text-body-lg font-semibold text-on-surface mb-6">Hoạt động gần đây</h3>
<div className="relative border-l border-surface-variant ml-3 space-y-6">
<div className="relative pl-6">
<div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-container border-4 border-surface-container-lowest"></div>
<div className="flex justify-between items-start mb-1">
<div className="font-label-md text-label-md font-medium text-on-surface">Hoàn thành bài học: Quản lý rủi ro cơ bản</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">2 giờ trước</span>
</div>
<p className="font-body-md text-sm text-on-surface-variant">+50 XP • Đạt điểm 95/100 Quiz</p>
</div>
<div className="relative pl-6">
<div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-surface-container-lowest"></div>
<div className="flex justify-between items-start mb-1">
<div className="font-label-md text-label-md font-medium text-on-surface">Đạt Streak 30 ngày liên tiếp</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Hôm qua</span>
</div>
<p className="font-body-md text-sm text-on-surface-variant">Nhận huy hiệu mới và +200 XP thưởng</p>
</div>
<div className="relative pl-6">
<div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-variant border-4 border-surface-container-lowest"></div>
<div className="flex justify-between items-start mb-1">
<div className="font-label-md text-label-md font-medium text-on-surface">Nâng cấp gói Mastery Premium</div>
<span className="font-label-sm text-label-sm text-on-surface-variant">12 ngày trước</span>
</div>
<p className="font-body-md text-sm text-on-surface-variant">Mở khóa toàn bộ tính năng AI và Simulator</p>
</div>
</div>
<button className="w-full mt-6 py-2 text-center font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors">
                        Tải thêm hoạt động
                    </button>
</div>
</div>
</div>

    </>
  );
}
