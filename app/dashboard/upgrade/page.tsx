export default function UpgradePlan() {
  return (
    <>

{/* 1. Current Plan Status */}
<section className="mb-xl flex justify-center">
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md flex flex-col md:flex-row items-center gap-md border border-outline-variant/30 transition-shadow hover:shadow-hover">
<div className="flex items-center gap-sm">
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">Tài khoản hiện tại</p>
<h3 className="font-label-md text-label-md font-semibold text-on-surface">Bạn đang sử dụng: Gói Miễn phí</h3>
</div>
</div>
<div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
<div className="flex gap-md">
<div className="bg-surface p-sm rounded-xl">
<p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Lượt hỏi AI còn lại</p>
<p className="font-label-md text-label-md font-semibold text-primary">5/10</p>
</div>
<div className="bg-surface p-sm rounded-xl">
<p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Tiến độ học tập</p>
<div className="flex items-center gap-2">
<p className="font-label-md text-label-md font-semibold text-success">12%</p>
<div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
<div className="w-[12%] h-full bg-success rounded-full"></div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* 2. Hero Section */}
<section className="text-center mb-xl">

<div className="inline-flex items-center bg-surface-container-low p-1 rounded-full border border-outline-variant/30">
<button className="px-sm py-2 rounded-full font-label-md text-label-md bg-surface-container-lowest text-on-surface shadow-sm" id="billing-monthly">Thanh toán theo tháng</button>
<button className="px-sm py-2 rounded-full font-label-md text-label-md text-on-surface-variant flex items-center gap-2 hover:text-on-surface transition-colors" id="billing-yearly">
                    Thanh toán theo năm
                    <span className="bg-primary-container/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">Tiết kiệm 20%</span>
</button>
</div>
</section>
{/* 3. Pricing Cards */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl items-start">
{/* Free Plan */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md border border-outline-variant/30 flex flex-col h-full hover:shadow-hover transition-shadow">
<div className="mb-lg">
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Miễn phí</h3>
<p className="font-body-md text-body-md text-on-surface-variant h-12">Khởi đầu hành trình tài chính cơ bản.</p>
<div className="mt-sm flex items-baseline gap-1">
<span className="font-display text-display text-on-surface">0đ</span>
<span className="font-label-md text-label-md text-on-surface-variant">/tháng</span>
</div>
</div>
<ul className="flex-1 space-y-sm mb-lg">
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Một số khóa học cơ bản
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Gia sư AI (giới hạn 10 câu/ngày)
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Quiz cơ bản
                    </li>
</ul>
<button className="w-full h-12 rounded-xl font-label-md text-label-md border border-outline-variant text-on-surface-variant bg-surface-container-lowest cursor-default" disabled>Đang sử dụng</button>
</div>
{/* Premium Plan (Highlighted) */}
<div className="bg-surface-container-lowest rounded-2xl shadow-hover p-md border-2 border-primary relative flex flex-col h-full transform md:-translate-y-4">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm text-label-sm px-4 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">
                    LỰA CHỌN PHỔ BIẾN NHẤT
                </div>
<div className="mb-lg mt-2">
<h3 className="font-headline-md text-headline-md text-primary mb-2">Premium</h3>
<p className="font-body-md text-body-md text-on-surface-variant h-12">Trải nghiệm học tập AI cá nhân hóa hoàn toàn.</p>
<div className="mt-sm flex items-baseline gap-1">
<span className="font-display text-display text-on-surface">99k</span>
<span className="font-label-md text-label-md text-on-surface-variant">/tháng</span>
</div>
</div>
<ul className="flex-1 space-y-sm mb-lg">
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md font-medium">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="check_circle" data-weight="fill">check_circle</span>
                        Toàn bộ khóa học
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="check_circle" data-weight="fill">check_circle</span>
                        Gia sư AI không giới hạn
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="check_circle" data-weight="fill">check_circle</span>
                        Giả lập tài chính nâng cao
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="check_circle" data-weight="fill">check_circle</span>
                        Chứng chỉ hoàn thành
                    </li>
</ul>
<button className="w-full h-12 rounded-xl font-label-md text-label-md bg-primary-container text-on-primary-container hover:bg-primary transition-colors shadow-sm font-semibold">Nâng cấp ngay</button>
</div>
{/* Pro Plan */}
<div className="bg-surface-container-lowest rounded-2xl shadow-soft p-md border border-outline-variant/30 flex flex-col h-full hover:shadow-hover transition-shadow">
<div className="mb-lg">
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Doanh nghiệp</h3>
<p className="font-body-md text-body-md text-on-surface-variant h-12">Giải pháp đào tạo cho tổ chức.</p>
<div className="mt-sm flex items-baseline gap-1 py-3">
<span className="font-display text-display text-on-surface">Liên hệ</span>
</div>
</div>
<ul className="flex-1 space-y-sm mb-lg">
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Đào tạo nhân viên theo nhóm
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Dashboard quản trị riêng
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        Báo cáo tiến độ chi tiết
                    </li>
<li className="flex items-start gap-2 text-on-surface font-body-md text-body-md">
<span className="material-symbols-outlined text-outline-variant text-[20px]" data-icon="check">check</span>
                        AI hỗ trợ đặc thù doanh nghiệp
                    </li>
</ul>
<button className="w-full h-12 rounded-xl font-label-md text-label-md border border-primary text-primary bg-surface-container-lowest hover:bg-primary-fixed transition-colors">Liên hệ tư vấn</button>
</div>
</section>

    </>
  );
}
