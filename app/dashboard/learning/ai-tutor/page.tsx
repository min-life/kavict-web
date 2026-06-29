export default function AiTutor() {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)]">
      <div className="flex w-full flex-1 gap-lg overflow-hidden">
{/* Left Column: AI Avatar (30%) */}
<aside className="w-[30%] bg-surface-container-lowest rounded-2xl shadow-ambient p-md flex flex-col items-center justify-center relative border border-surface-container-high">
<div className="absolute top-md left-md flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-surface-container-high">
<div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
<span className="font-label-sm text-label-sm text-on-surface-variant">Đang lắng nghe</span>
</div>
<div className="absolute top-md right-md bg-surface px-3 py-1.5 rounded-full border border-surface-container-high">
<span className="font-label-sm text-label-sm text-on-surface-variant font-medium">14:23</span>
</div>
<div className="flex flex-col items-center mt-xl">
{/* Avatar */}
<div className="relative w-48 h-48 rounded-full border-4 border-surface shadow-ambient-hover mb-md overflow-hidden bg-surface-variant">
<img className="w-full h-full object-cover" data-alt="A highly detailed, modern 3D illustration of an AI avatar representing a friendly, professional financial tutor. The character has a sleek, minimalist design with a clean white and primary blue color palette, set against a pristine, well-lit light mode background. Soft, diffused lighting creates a premium, approachable atmosphere, emphasizing clarity and modern SaaS aesthetics." src="https://lh3.googleusercontent.com/aida/AP1WRLviK1C5QGY-MA8toZfN83_xj_Tv-j83xb2hIeLmALyJaxGqmmn4Mg2CwQClzCZ00epE7Rxt3Vusl5lrbLhXggBZo3DSCPH5EJN0b9a2jWB_1oZywKkPabIkbgzue149DG4di-zSU0K_rIBmMfrCdtTaYuBCtCTuAnSO2PD5-1VE5J7tkWV58euJVs4oyVCo0w_n0Kxknv7lot-NZj9LN0LbSd8aBnxVPxlIqmc3ChTgm5XIFoDwoSjyOLg" />
</div>
<h2 className="font-headline-md text-headline-md text-on-surface mb-xs">Kavi</h2>
<p className="font-label-md text-label-md text-secondary mb-xl">Chuyên gia Tài chính Cá nhân</p>
{/* Sound Wave Indicator */}
<div className="sound-wave mb-md">
<div className="bar"></div>
<div className="bar"></div>
<div className="bar"></div>
<div className="bar"></div>
<div className="bar"></div>
</div>
<div className="bg-primary-fixed px-4 py-2 rounded-full text-on-primary-fixed font-label-md text-label-md flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: '\'FILL\' 1'}}>mic</span>
                    Chế độ Giọng nói
                </div>
</div>
</aside>
{/* Middle Column: Chat (55% -> flex-1) */}
<section className="flex-1 bg-surface-container-lowest rounded-2xl shadow-ambient flex flex-col border border-surface-container-high overflow-hidden">
{/* Header */}
<div className="p-md border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
<div>
<h2 className="font-headline-md text-headline-md text-on-surface mb-1">Quản lý tài chính cá nhân</h2>
<p className="font-label-md text-label-md text-secondary">Bài 3 / 12</p>
</div>
<div className="flex items-center gap-3">
<span className="font-label-md text-label-md text-secondary">Tiến độ 25%</span>
<div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full w-1/4"></div>
</div>
</div>
</div>
{/* Chat Transcript */}
<div className="flex-1 overflow-y-auto p-md flex flex-col gap-lg hide-scrollbar scroll-smooth">
{/* System Message */}
<div className="text-center">
<span className="font-label-sm text-label-sm text-secondary bg-surface px-4 py-1.5 rounded-full border border-surface-container">Hôm nay</span>
</div>
{/* User Message */}
<div className="flex justify-end">
<div className="max-w-[75%] bg-surface text-on-surface p-sm rounded-2xl rounded-tr-sm border border-surface-container shadow-sm">
<p className="font-body-md text-body-md">Chào Kavi, ở bài trước mình đã học về lập ngân sách. Hôm nay chúng ta sẽ tiếp tục với phần nào?</p>
</div>
</div>
{/* AI Message */}
<div className="flex justify-start gap-sm">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 text-on-primary">
<span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>robot_2</span>
</div>
<div className="max-w-[75%]">
<div className="text-on-surface p-sm rounded-2xl rounded-tl-sm border border-surface-container shadow-sm bg-surface-container-lowest">
<p className="font-body-md text-body-md mb-2">Chào bạn! Rất tuyệt khi bạn đã nắm vững cách lập ngân sách. Hôm nay, chúng ta sẽ chuyển sang một khái niệm quan trọng tiếp theo: <span className="ai-message-highlight">Quỹ Dự Phòng (Emergency Fund)</span>.</p>
<p className="font-body-md text-body-md mb-3">Quỹ dự phòng là số tiền bạn tiết kiệm riêng biệt để sử dụng cho những tình huống khẩn cấp, không lường trước được như mất việc, ốm đau, hoặc sửa chữa lớn.</p>
<div className="bg-surface p-3 rounded-lg border border-surface-container-high">
<p className="font-label-md text-label-md text-secondary mb-1 flex items-center gap-2">
<span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: '\'FILL\' 1'}}>info</span>
                                    Nguyên tắc cơ bản
                                </p>
<p className="font-body-md text-body-md">Các chuyên gia tài chính khuyến nghị nên duy trì quỹ dự phòng tương đương <span className="font-medium text-on-surface">3 đến 6 tháng chi phí sinh hoạt thiết yếu</span>.</p>
</div>
</div>
</div>
</div>
{/* User Message */}
<div className="flex justify-end">
<div className="max-w-[75%] bg-surface text-on-surface p-sm rounded-2xl rounded-tr-sm border border-surface-container shadow-sm">
<p className="font-body-md text-body-md">Vậy làm sao để xây dựng nó khi lương mình không cao?</p>
</div>
</div>
{/* AI Message (Typing) */}
<div className="flex justify-start gap-sm">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 text-on-primary">
<span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>robot_2</span>
</div>
<div className="max-w-[75%]">
<div className="text-on-surface p-sm rounded-2xl rounded-tl-sm border border-surface-container shadow-sm bg-surface-container-lowest">
<p className="font-body-md text-body-md typing">Đó là một câu hỏi rất thực tế. Ngay cả khi thu nhập chưa cao, bạn vẫn có thể xây dựng quỹ dự phòng bằng chiến lược <span className="ai-message-highlight">Tích lũy nhỏ từng bước</span>. Bạn có thể bắt đầu với việc trích ra 5%</p>
</div>
</div>
</div>
</div>
{/* Input Area */}
<div className="p-md bg-surface-container-lowest border-t border-surface-container-high">
{/* Suggestion Chips */}
<div className="flex gap-2 mb-sm overflow-x-auto hide-scrollbar pb-1">
<button className="whitespace-nowrap px-4 py-1.5 bg-surface rounded-full border border-surface-container-high font-label-sm text-label-sm text-secondary hover:bg-surface-container transition-colors">
                        Giải thích đơn giản hơn
                    </button>
<button className="whitespace-nowrap px-4 py-1.5 bg-surface rounded-full border border-surface-container-high font-label-sm text-label-sm text-secondary hover:bg-surface-container transition-colors">
                        Cho ví dụ thực tế
                    </button>
<button className="whitespace-nowrap px-4 py-1.5 bg-surface rounded-full border border-surface-container-high font-label-sm text-label-sm text-secondary hover:bg-surface-container transition-colors">
                        Kiểm tra kiến thức
                    </button>
</div>
{/* Input Box */}
<div className="flex items-end gap-2 bg-surface border border-outline-variant rounded-2xl p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-fixed transition-all relative shadow-sm">
<button className="p-2 text-secondary hover:bg-surface-container rounded-xl transition-colors flex-shrink-0" title="Tải lên (PDF, Hình ảnh)">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>attach_file</span>
</button>
<textarea className="w-full bg-transparent border-none focus:ring-0 resize-none font-body-md text-body-md text-on-surface placeholder-secondary py-2 max-h-32 hide-scrollbar" placeholder="Nhập câu hỏi hoặc nói với Kavi..." rows={1}></textarea>
<div className="flex items-center gap-1 flex-shrink-0">
<button className="p-2 text-primary hover:bg-primary-fixed rounded-xl transition-colors" title="Bật/Tắt Mic">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 1'}}>mic</span>
</button>
<button className="p-2 bg-primary-container text-on-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center h-10 w-10">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 1'}}>send</span>
</button>
</div>
</div>
</div>
</section>
{/* Right Column: Floating Toolbar */}
<aside className="w-16 flex flex-col gap-2 items-center pt-xl">
<div className="bg-surface-container-lowest rounded-full shadow-ambient p-2 border border-surface-container-high flex flex-col gap-2">
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>summarize</span>
{/* Tooltip */}
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Tóm tắt</span>
</button>
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>edit_note</span>
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Ghi chú</span>
</button>
<div className="w-8 h-px bg-surface-container-high mx-auto my-1"></div>
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>quiz</span>
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Tạo Quiz</span>
</button>
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>style</span>
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Flashcard</span>
</button>
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>menu_book</span>
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Thuật ngữ</span>
</button>
<button className="w-12 h-12 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container hover:text-on-surface transition-colors group relative">
<span className="material-symbols-outlined" style={{fontVariationSettings: '\'FILL\' 0'}}>assignment</span>
<span className="absolute right-full mr-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Bài tập</span>
</button>
</div>
</aside>

      </div>
    </div>
  );
}
