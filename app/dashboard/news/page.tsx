export default function NewsHub() {
  return (
    <>


{/* Filters & Search Bar */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-sm mb-lg">
<div className="flex flex-wrap gap-xs">
<button className="px-4 py-2 bg-primary-container text-on-primary rounded-full font-label-md text-label-md shadow-sm">Tất cả</button>
<button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-full font-label-md text-label-md transition-colors">Thị trường</button>
<button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-full font-label-md text-label-md transition-colors">Doanh nghiệp</button>
<button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-full font-label-md text-label-md transition-colors">Vĩ mô</button>
</div>
<div className="flex items-center gap-xs w-full md:w-auto">
<div className="relative w-full md:w-64">
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow" placeholder="Tìm kiếm bài viết..." type="text" />
<span className="material-symbols-outlined absolute left-3 top-2.5 text-outline">search</span>
</div>
<button className="p-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
{/* 2 Column Layout */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/* Left Column: Main Content (70% -> 8 cols approx) */}
<div className="lg:col-span-8 flex flex-col gap-lg">
{/* Featured News */}
<article className="bg-surface-container-lowest rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group">
<div className="relative h-64 md:h-80 w-full overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern, high-quality photograph of an Asian financial district at dawn. Gleaming glass skyscrapers reflect the early morning light. The composition is clean, professional, and expansive. The color palette features cool blues and subtle warm gold tones. Shot in a minimalist corporate style, suitable for a premium fintech platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhO8fV0YiHBxqjGyPQe5jPX9CRwibxQ9FIHO2UIFPzcN3NEP-C_PpZkXhQ9LMnIsqk_-ETpE3Ybn5u_7BD1AxhBqJ4-L-o9lSMf1wrGJDrkoQq-FX0mVDT83tZ1sRh-OcJp-CZe9lbWYbnKKeXusBmTl3Je2taXHUFkkk_OzTAvEooML5lFDsy2x9N-tX_x-TYHVvOkn4cinQm1qGDe2gDeA9bKbjpKyI2TvtMy40nuoU8032nqB_FIKyANQrx1XO70CEeq1-zzqQ" />
<div className="absolute top-4 left-4 flex gap-2">
<span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full font-label-sm text-label-sm backdrop-blur-sm">HOT</span>
</div>
</div>
<div className="p-md">
<div className="flex items-center gap-2 mb-3">
<span className="font-label-md text-label-md text-primary">Thị trường chứng khoán</span>
<span className="text-outline-variant">•</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">2 giờ trước</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2">VN-Index vượt mốc 1.250 điểm, dòng tiền khối ngoại quay trở lại mua ròng mạnh mẽ</h2>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-4">Phiên giao dịch sáng nay ghi nhận sự bứt phá của nhóm cổ phiếu ngân hàng và bất động sản, kéo chỉ số chung vượt ngưỡng kháng cự quan trọng. Thanh khoản thị trường đạt mức cao nhất trong 3 tuần qua.</p>
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
</div>
<span className="font-label-sm text-label-sm text-on-surface">KAVICT Research</span>
</div>
</div>
</article>
{/* KAVICT Exclusives Section */}
<section className="bg-primary/5 rounded-[20px] p-md border border-primary/10">
<div className="flex items-center gap-2 mb-sm">
<span className="material-symbols-outlined text-primary fill">stars</span>
<h3 className="font-headline-md text-headline-md text-on-surface">Bài viết KAVICT</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
{/* Exclusive Card 1 */}
<div className="bg-surface-container-lowest rounded-xl p-sm shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20 cursor-pointer">
<span className="inline-block bg-primary-container/10 text-primary px-2 py-0.5 rounded text-[10px] font-label-sm mb-2 border border-primary/20">Phân tích</span>
<h4 className="font-body-md text-body-md font-semibold text-on-surface mb-2 line-clamp-2">Đánh giá triển vọng ngành bán lẻ quý 3/2024: Cơ hội từ sự phục hồi sức mua</h4>
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm">Hôm qua</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</div>
</div>
{/* Exclusive Card 2 */}
<div className="bg-surface-container-lowest rounded-xl p-sm shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20 cursor-pointer">
<span className="inline-block bg-primary-container/10 text-primary px-2 py-0.5 rounded text-[10px] font-label-sm mb-2 border border-primary/20">Chiến lược</span>
<h4 className="font-body-md text-body-md font-semibold text-on-surface mb-2 line-clamp-2">Xây dựng danh mục đầu tư phòng thủ trong bối cảnh vĩ mô biến động</h4>
<div className="flex items-center justify-between text-on-surface-variant">
<span className="font-label-sm text-label-sm">2 ngày trước</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</div>
</div>
</div>
</section>
{/* News Feed List */}
<div className="flex flex-col gap-sm">
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Mới nhất</h3>
{/* Feed Item 1 */}
<article className="flex flex-col sm:flex-row gap-sm bg-surface-container-lowest p-sm rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="A macro shot of a sleek modern smartphone displaying a financial charting app with green upward trending lines. The background is softly blurred, showing an upscale office environment with natural light. The aesthetic is modern, minimal, and aspirational." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEiL54_Y3ocVydnBVcZXz3T6l9sb3R7N-yxROPud7WZK8FMADvTcT2worvRmRBtRkLQ2wYKSEsVzj6CtflHG5Ma6QLjBYtE86zj2nBvQvYlYEWqALQ1-OsrE4ku5eaWTDeW73r9KVb5PR9B7sjPt0JTuynDh6jqzAPPw6QcMkhY2yKC_DoOdy-S01QmW_zTVLMZkneuaIW3qeX0BLsrJZPVexW6WI7kgL87zQMgYEhavDkUzlZhMG0cIYoyCZ3tO7-KEuuF3-BuXg" />
<span className="absolute top-2 left-2 bg-surface-container-lowest/80 text-on-surface px-2 py-0.5 rounded text-[10px] font-label-sm backdrop-blur-md">MỚI</span>
</div>
<div className="flex flex-col justify-between flex-grow">
<div>
<h4 className="font-body-lg text-body-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">Ngân hàng Nhà nước tiếp tục hút ròng qua kênh tín phiếu</h4>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">Động thái này nhằm ổn định tỷ giá trong bối cảnh áp lực từ thị trường quốc tế gia tăng. Lãi suất trúng thầu duy trì ở mức ổn định.</p>
</div>
<div className="flex flex-wrap items-center justify-between mt-2 gap-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-primary bg-primary/5 px-2 py-0.5 rounded">Vĩ mô</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">45 phút trước</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Nguồn: VnExpress</span>
</div>
</div>
</article>
{/* Feed Item 2 */}
<article className="flex flex-col sm:flex-row gap-sm bg-surface-container-lowest p-sm rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="A clean, abstract 3D rendering of shipping containers and a global logistics network map. The containers are stylized in white and metallic blue. Soft studio lighting highlights the geometric precision. Minimalist corporate visual style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7YwzhIrqdNF88Lq3KGdNuFLx-OggiJf80FiGxOzeRVsnUriRKNXq-c_2gARNhUsrdTtS8roKif1eaezYPHogEhoLJ5wI9C5W-ao3gsB0hIllRRzZSdDBDU7DE-xiCqZjxv7TAz8inKLG8QWFTVOHdkqaaJYu2e8SCHeb9YtufcdxVzwwGxndDUsGMdY9dBUPG3cNXBZeoXqjj5MyBp6AT97sm-ZiVAVISvRle4lS_c9gtM6Weny_Fezvzlr4xS5nVzUqZKoNVqGc" />
</div>
<div className="flex flex-col justify-between flex-grow">
<div>
<h4 className="font-body-lg text-body-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">Xuất khẩu tháng 8 tăng trưởng hai con số, thặng dư thương mại mở rộng</h4>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">Các mặt hàng điện tử và dệt may tiếp tục dẫn dắt đà phục hồi xuất khẩu, tạo đà tích cực cho tăng trưởng GDP quý 3.</p>
</div>
<div className="flex flex-wrap items-center justify-between mt-2 gap-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-primary bg-primary/5 px-2 py-0.5 rounded">Kinh tế</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">3 giờ trước</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Nguồn: CafeF</span>
</div>
</div>
</article>
{/* Feed Item 3 */}
<article className="flex flex-col sm:flex-row gap-sm bg-surface-container-lowest p-sm rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group">
<div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="A sleek corporate meeting room scene focusing on a document with a modern pen resting on it. The lighting is bright and clean, emphasizing a professional business environment. Soft, modern aesthetics with a high-end feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJIpWq9u-2V-_zgeqee2XdL0OEtyaFUcs6drmTu8vn8ZZGiDGIfg-xAAmnyGiWvgW6XujmWPeyn7Wex0GsZcjArWWJW2_Iekjpdy0r5XQELBhfWhey-rxAvJJKel2CbTx25pr9V3mM2pRv1v3YqhRGQXbJVB4ot-6RNjOx9bZUoZi_OefRtVCoIFg2AvKLbVEGvpiWAfJKOauNg9fXAsV3-rJD--__90Lo_7CrUHKGtIJI9hLD9KCShKo-vYy-iFzBRa-ZZthc8c" />
</div>
<div className="flex flex-col justify-between flex-grow">
<div>
<h4 className="font-body-lg text-body-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">Công ty ABC công bố kế hoạch chia cổ tức tỷ lệ 20% bằng tiền mặt</h4>
<p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">Với kết quả kinh doanh vượt mức kế hoạch, HĐQT quyết định tăng tỷ lệ chia cổ tức năm 2023 so với dự kiến ban đầu.</p>
</div>
<div className="flex flex-wrap items-center justify-between mt-2 gap-2">
<div className="flex items-center gap-2">
<span className="font-label-sm text-label-sm text-primary bg-primary/5 px-2 py-0.5 rounded">Doanh nghiệp</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">5 giờ trước</span>
</div>
<span className="font-label-sm text-label-sm text-outline">Nguồn: KAVICT News</span>
</div>
</div>
</article>
<button className="w-full py-3 mt-4 bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md rounded-xl transition-colors border border-outline-variant/20">
                        Xem thêm tin tức
                    </button>
</div>
</div>
{/* Right Column: Market Data (30% -> 4 cols approx) */}
<aside className="lg:col-span-4 flex flex-col gap-sm">
{/* Market Indices Overview */}
<div className="bg-surface-container-lowest rounded-[20px] p-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
<h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">trending_up</span> Chỉ số thị trường
                    </h3>
<div className="grid grid-cols-2 gap-xs">
{/* Index Card */}
<div className="p-2 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
<div className="text-[11px] font-label-sm text-on-surface-variant mb-1">VNINDEX</div>
<div className="font-body-md font-semibold text-on-surface">1,250.45</div>
<div className="flex items-center gap-1 text-[12px] font-label-md text-[#16a34a]">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                +8.50 (+0.68%)
                            </div>
</div>
<div className="p-2 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
<div className="text-[11px] font-label-sm text-on-surface-variant mb-1">HNX-INDEX</div>
<div className="font-body-md font-semibold text-on-surface">240.12</div>
<div className="flex items-center gap-1 text-[12px] font-label-md text-[#16a34a]">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                +1.20 (+0.50%)
                            </div>
</div>
<div className="p-2 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
<div className="text-[11px] font-label-sm text-on-surface-variant mb-1">UPCOM</div>
<div className="font-body-md font-semibold text-on-surface">90.50</div>
<div className="flex items-center gap-1 text-[12px] font-label-md text-[#dc2626]">
<span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                -0.15 (-0.17%)
                            </div>
</div>
<div className="p-2 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
<div className="text-[11px] font-label-sm text-on-surface-variant mb-1">VN30</div>
<div className="font-body-md font-semibold text-on-surface">1,265.80</div>
<div className="flex items-center gap-1 text-[12px] font-label-md text-[#16a34a]">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                +10.20 (+0.81%)
                            </div>
</div>
</div>
</div>
{/* Top Movers List */}
<div className="bg-surface-container-lowest rounded-[20px] p-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
<div className="flex items-center justify-between mb-sm">
<h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Top Biến Động</h3>
<div className="flex gap-2">
<button className="text-[10px] font-label-sm bg-surface-container-high px-2 py-1 rounded text-on-surface">Tăng</button>
<button className="text-[10px] font-label-sm hover:bg-surface-container-low px-2 py-1 rounded text-on-surface-variant">Giảm</button>
</div>
</div>
<div className="flex flex-col gap-1">
{/* Mover Item */}
<div className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
<div className="flex items-center gap-3">
<span className="font-body-md font-semibold text-on-surface w-10">SSI</span>
<div className="w-16 h-6 rounded bg-surface-variant flex items-center justify-center">
<svg className="w-full h-full text-[#16a34a]" preserveAspectRatio="none" viewBox="0 0 100 20">
<polyline fill="none" points="0,15 20,10 40,12 60,5 80,8 100,2" stroke="currentColor" strokeWidth="2"></polyline>
</svg>
</div>
</div>
<div className="text-right">
<div className="font-label-md text-label-md text-on-surface font-semibold">35.50</div>
<div className="text-[11px] font-label-sm text-[#16a34a]">+2.15%</div>
</div>
</div>
<div className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
<div className="flex items-center gap-3">
<span className="font-body-md font-semibold text-on-surface w-10">VND</span>
<div className="w-16 h-6 rounded bg-surface-variant flex items-center justify-center">
<svg className="w-full h-full text-[#16a34a]" preserveAspectRatio="none" viewBox="0 0 100 20">
<polyline fill="none" points="0,18 20,15 40,8 60,10 80,4 100,1" stroke="currentColor" strokeWidth="2"></polyline>
</svg>
</div>
</div>
<div className="text-right">
<div className="font-label-md text-label-md text-on-surface font-semibold">22.40</div>
<div className="text-[11px] font-label-sm text-[#16a34a]">+1.80%</div>
</div>
</div>
<div className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
<div className="flex items-center gap-3">
<span className="font-body-md font-semibold text-on-surface w-10">HPG</span>
<div className="w-16 h-6 rounded bg-surface-variant flex items-center justify-center">
<svg className="w-full h-full text-[#16a34a]" preserveAspectRatio="none" viewBox="0 0 100 20">
<polyline fill="none" points="0,12 20,14 40,10 60,11 80,6 100,3" stroke="currentColor" strokeWidth="2"></polyline>
</svg>
</div>
</div>
<div className="text-right">
<div className="font-label-md text-label-md text-on-surface font-semibold">28.90</div>
<div className="text-[11px] font-label-sm text-[#16a34a]">+1.55%</div>
</div>
</div>
</div>
</div>
{/* Market Watch (Gold, USD, Crypto) */}
<div className="bg-surface-container-lowest rounded-[20px] p-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
<h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">public</span> Theo dõi thế giới
                    </h3>
<div className="flex flex-col divide-y divide-outline-variant/20">
<div className="flex justify-between items-center py-2">
<span className="font-label-md text-label-md text-on-surface">Vàng SJC</span>
<div className="text-right">
<span className="font-body-md font-semibold text-on-surface">80.5 - 82.5</span>
<span className="text-[10px] text-[#dc2626] ml-1">-100k</span>
</div>
</div>
<div className="flex justify-between items-center py-2">
<span className="font-label-md text-label-md text-on-surface">USD/VND</span>
<div className="text-right">
<span className="font-body-md font-semibold text-on-surface">25,430</span>
<span className="text-[10px] text-[#16a34a] ml-1">+15đ</span>
</div>
</div>
<div className="flex justify-between items-center py-2">
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1">BTC/USD</span>
<div className="text-right">
<span className="font-body-md font-semibold text-on-surface">64,210.50</span>
<span className="text-[10px] text-[#16a34a] ml-1">+2.4%</span>
</div>
</div>
<div className="flex justify-between items-center py-2">
<span className="font-label-md text-label-md text-on-surface flex items-center gap-1">ETH/USD</span>
<div className="text-right">
<span className="font-body-md font-semibold text-on-surface">3,450.20</span>
<span className="text-[10px] text-[#dc2626] ml-1">-0.8%</span>
</div>
</div>
</div>
</div>
{/* Financial Calendar */}
<div className="bg-surface-container-lowest rounded-[20px] p-sm shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-outline-variant/30">
<h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">calendar_month</span> Sự kiện sắp tới
                    </h3>
<div className="flex flex-col gap-3">
<div className="flex gap-3">
<div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface-container text-center flex-shrink-0">
<span className="text-[10px] font-label-sm text-on-surface-variant uppercase">Thg 9</span>
<span className="font-headline-md text-headline-md font-bold text-primary leading-none">15</span>
</div>
<div>
<h4 className="font-label-md text-label-md font-semibold text-on-surface">FED công bố lãi suất</h4>
<p className="text-[11px] font-label-sm text-on-surface-variant mt-0.5">Mỹ • Tầm quan trọng: Cao</p>
</div>
</div>
<div className="flex gap-3">
<div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface-container text-center flex-shrink-0">
<span className="text-[10px] font-label-sm text-on-surface-variant uppercase">Thg 9</span>
<span className="font-headline-md text-headline-md font-bold text-on-surface leading-none">20</span>
</div>
<div>
<h4 className="font-label-md text-label-md font-semibold text-on-surface">Đáo hạn Phái sinh</h4>
<p className="text-[11px] font-label-sm text-on-surface-variant mt-0.5">VN • VN30F2409</p>
</div>
</div>
</div>
<button className="w-full mt-3 text-center text-primary font-label-sm text-label-sm hover:underline">Xem lịch chi tiết</button>
</div>
</aside>
</div>

    </>
  );
}
