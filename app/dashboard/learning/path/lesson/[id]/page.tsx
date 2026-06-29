"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export default function LessonDetail() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Quiz 2: Matching
  const leftItems = ["Thu nhập", "Chi tiêu", "Tiết kiệm"];
  const rightItems = ["Expense", "Income", "Savings"];
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [selectedMatchRight, setSelectedMatchRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleMatchLeft = (item: string) => {
    if (selectedMatchRight) {
      setMatches(prev => ({ ...prev, [item]: selectedMatchRight }));
      setSelectedMatchRight(null);
      setSelectedMatchLeft(null);
    } else {
      setSelectedMatchLeft(item);
    }
  };

  const handleMatchRight = (item: string) => {
    if (selectedMatchLeft) {
      setMatches(prev => ({ ...prev, [selectedMatchLeft]: item }));
      setSelectedMatchLeft(null);
      setSelectedMatchRight(null);
    } else {
      setSelectedMatchRight(item);
    }
  };

  // Quiz 3: Multiple choice
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const mcqOptions = [
    'Chi tiêu trong 1 tháng', 
    'Chi tiêu trong 3 - 6 tháng', 
    'Tất cả số tiền nhàn rỗi', 
    'Không cần quỹ dự phòng'
  ];

  // Quiz 4: Ordering
  const [orderItems, setOrderItems] = useState([
    "Lập ngân sách chi tiết",
    "Ghi nhận tổng thu nhập",
    "Đánh giá hiệu quả cuối tháng",
    "Theo dõi chi tiêu hàng ngày"
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...orderItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setOrderItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === orderItems.length - 1) return;
    const newItems = [...orderItems];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setOrderItems(newItems);
  };

  // Quiz 5: Fill in the blank
  const [filledWord, setFilledWord] = useState<string | null>(null);
  const blankWords = ['đơn', 'kép', 'suất', 'vay'];

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Scroll to the celebration section smoothly
    setTimeout(() => {
        document.getElementById('celebration-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="flex flex-col gap-xl">
      {/* Section 1: Video Lesson */}
      <section className="flex flex-col gap-sm animate-fade-in">
        <div className="relative w-full max-h-[60vh] md:max-h-[500px] aspect-video rounded-3xl overflow-hidden glass-card group cursor-pointer mx-auto bg-black">
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60" style={{backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuBwElrO7fgd7DjRmOjZWwZ9wZbhBX2DtX4FnniOG3jdiUCo0fhkXry5XN2X-NYT_ejrLfJnaiyIXypxphV0xbbctiLD6VI-U8BL8ooCFy_Vowa5_VTplOD4lzQ13Owg_wptMQaL3w4x7TrgD3fno15V97abDbZpL9qTI3j8XY0Ewn2YYXn6yxvi7EpplCOHr1x-bhaQ6xMndUqU5oUr6cAX_rkjy5ViO3irZPzNHuA2MujEU4yjqBiWG8d6sh5t0IRHsTFf20U63ng\')'}}></div>
            <button className="relative z-10 w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <span className="material-symbols-outlined !text-4xl translate-x-1">play_arrow</span>
            </button>
            {/* Video Controls Placeholder */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
              <div className="h-full bg-primary-container w-1/3"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-xs mt-base">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Bài 4: Lãi kép hoạt động như thế nào?</h1>
          <div className="flex flex-wrap gap-md items-center text-on-surface-variant font-label-md">
            <span className="flex items-center gap-base">
              <span className="material-symbols-outlined text-primary">schedule</span>
              12 phút
            </span>
            <span className="flex items-center gap-base">
              <span className="material-symbols-outlined text-primary">school</span>
              Cấp độ Cơ bản
            </span>
            <span className="flex items-center gap-base">
              <span className="material-symbols-outlined text-primary">target</span>
              Chủ đề: Tiết kiệm &amp; Đầu tư
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Lesson Content Card */}
      <section className="glass-card p-lg border border-outline-variant/30">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Kiến thức trọng tâm</h2>
        <div className="space-y-sm text-on-surface-variant font-body-lg">
          <p>
            Lãi kép (Compound Interest) được mệnh danh là "Kỳ quan thứ 8 của thế giới". Khác với lãi đơn, lãi kép là phần lãi được tính trên cả vốn gốc lẫn phần lãi đã tích lũy từ các kỳ trước đó.
          </p>
          <ul className="space-y-sm list-none mt-md">
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span><strong>Tái đầu tư:</strong> Toàn bộ lợi nhuận được cộng dồn vào vốn gốc để tiếp tục sinh lời.</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span><strong>Thời gian là chìa khóa:</strong> Càng bắt đầu sớm, sức mạnh của lãi kép càng phát huy tối đa.</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
              <span><strong>Tần suất:</strong> Lãi suất được nhập gốc càng thường xuyên (tháng, quý, năm), tài sản càng tăng nhanh.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Interactive Quizzes */}
      <section className="flex flex-col gap-lg pb-xl">
        <h3 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-sm">
          <span className="material-symbols-outlined">quiz</span> Kiểm tra kiến thức
        </h3>

        {/* Quiz 1: Flashcard */}
        <div className="flip-card glass-card h-48 cursor-pointer group" onClick={(e) => { e.currentTarget.classList.toggle('flipped') }}>
          <div className="flip-card-inner relative w-full h-full text-center">
            {/* Front */}
            <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center p-md bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
              <span className="font-label-md text-primary mb-xs">Flashcard</span>
              <h4 className="font-headline-md text-headline-md">Lãi kép là gì?</h4>
              <p className="text-on-surface-variant text-sm mt-sm">Bấm để xem đáp án</p>
            </div>
            {/* Back */}
            <div className="flip-card-back absolute inset-0 flex flex-col items-center justify-center p-md bg-primary-container text-on-primary-container rounded-3xl">
              <p className="font-body-lg px-md">Là tiền lãi được tính trên vốn gốc ban đầu và tất cả các khoản lãi tích lũy của các kỳ trước.</p>
            </div>
          </div>
        </div>

        {/* Quiz 2: Matching */}
        <div className="glass-card p-lg flex flex-col gap-md">
          <div className="flex justify-between items-center">
            <h4 className="font-headline-md text-headline-md">Kết nối thuật ngữ</h4>
            <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-md">Nối từ tương ứng</span>
          </div>
          <div className="grid grid-cols-2 gap-md mt-sm">
            <div className="flex flex-col gap-sm">
              {leftItems.map(item => {
                const isMatched = Object.keys(matches).includes(item);
                const isSelected = selectedMatchLeft === item;
                return (
                  <button 
                    key={item}
                    onClick={() => handleMatchLeft(item)}
                    disabled={isMatched}
                    className={`p-sm rounded-xl border text-center transition-all ${
                      isMatched ? 'bg-primary-container text-on-primary-container border-primary-container opacity-60 line-through' :
                      isSelected ? 'bg-primary/20 border-primary text-primary shadow-sm' :
                      'bg-surface-container-high border-dashed border-outline hover:border-primary'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-sm">
              {rightItems.map(item => {
                const isMatched = Object.values(matches).includes(item);
                const isSelected = selectedMatchRight === item;
                return (
                  <button 
                    key={item}
                    onClick={() => handleMatchRight(item)}
                    disabled={isMatched}
                    className={`p-sm rounded-xl border border-solid text-center transition-all ${
                      isMatched ? 'bg-primary-container text-on-primary-container border-primary-container opacity-60 line-through' :
                      isSelected ? 'bg-primary/20 border-primary text-primary shadow-sm' :
                      'bg-primary/5 text-primary border-primary hover:bg-primary/10'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
          {Object.keys(matches).length > 0 && (
            <div className="mt-sm flex gap-2 flex-wrap">
              {Object.entries(matches).map(([l, r]) => (
                <span key={l} className="bg-surface-container-high px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-fade-in">
                  <span className="font-bold">{l}</span> ↔ <span>{r}</span>
                  <button onClick={() => {
                    const newMatches = {...matches};
                    delete newMatches[l];
                    setMatches(newMatches);
                  }} className="text-error hover:text-error-hover material-symbols-outlined text-[16px] ml-1">close</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quiz 3: Multiple Choice */}
        <div className="glass-card p-lg flex flex-col gap-md">
          <h4 className="font-headline-md text-headline-md">Câu hỏi trắc nghiệm</h4>
          <p className="font-body-lg text-on-surface">Điều nào sau đây là quỹ dự phòng hợp lý cho người đi làm?</p>
          <div className="grid grid-cols-1 gap-sm mt-xs">
            {mcqOptions.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const label = String.fromCharCode(65 + i); // A, B, C, D
              return (
                <button 
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`flex items-center gap-sm p-sm border rounded-2xl text-left transition-all group ${
                    isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-outline-variant hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-label-md transition-colors ${
                    isSelected ? 'border-primary text-primary bg-primary-container/50' : 'border-outline group-hover:border-primary group-hover:text-primary'
                  }`}>{label}</span>
                  <span className={isSelected ? 'text-primary font-bold' : ''}>{opt}</span>
                  {isSelected && <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quiz 4: Ordering */}
        <div className="glass-card p-lg flex flex-col gap-md">
          <div className="flex justify-between items-center">
            <h4 className="font-headline-md text-headline-md">Sắp xếp trình tự</h4>
            <span className="text-on-surface-variant font-label-md">Các bước quản lý tài chính tháng</span>
          </div>
          <div className="flex flex-col gap-xs mt-xs">
            {orderItems.map((item, index) => (
              <div key={item} className="flex items-center gap-md p-sm bg-surface-container-low border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-colors">
                <div className="flex flex-col bg-surface-container rounded-lg p-1">
                  <button 
                    onClick={() => moveUp(index)} 
                    disabled={index === 0} 
                    className={`material-symbols-outlined text-[16px] leading-none ${index === 0 ? 'text-outline-variant/30 cursor-not-allowed' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    expand_less
                  </button>
                  <button 
                    onClick={() => moveDown(index)} 
                    disabled={index === orderItems.length - 1} 
                    className={`material-symbols-outlined text-[16px] leading-none ${index === orderItems.length - 1 ? 'text-outline-variant/30 cursor-not-allowed' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    expand_more
                  </button>
                </div>
                <span className="font-body-md">{index + 1}. {item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz 5: Fill in the blanks */}
        <div className="glass-card p-lg flex flex-col gap-md">
          <h4 className="font-headline-md text-headline-md">Điền vào chỗ trống</h4>
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-2xl">
            <p className="font-body-lg leading-loose">
              Lãi <span 
                className={`px-4 py-1 border-b-2 rounded-lg cursor-pointer transition-colors inline-block min-w-[80px] text-center mx-1 ${
                    filledWord ? 'bg-primary/10 border-primary text-primary font-bold hover:bg-error/10 hover:border-error hover:text-error hover:line-through' : 'bg-surface-container-high border-outline text-outline-variant border-dashed'
                }`}
                onClick={() => setFilledWord(null)}
                title={filledWord ? "Bấm để gỡ bỏ" : "Hãy chọn từ bên dưới"}
              >
                {filledWord || '______'}
              </span> giúp tài sản của bạn tăng nhanh một cách đột biến theo thời gian nhờ sức mạnh của sự tích lũy.
            </p>
          </div>
          <div className="flex flex-wrap gap-sm mt-xs">
            {blankWords.map(word => (
              <button 
                key={word}
                onClick={() => setFilledWord(word)}
                className={`px-6 py-2 rounded-full border font-label-md transition-all ${
                  filledWord === word ? 'border-primary bg-primary text-white shadow-sm' : 'border-outline-variant hover:border-primary hover:text-primary'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-center mt-xl fade-in-up">
            <button 
              onClick={handleSubmit} 
              className="px-8 py-4 bg-primary text-white rounded-full font-label-lg shadow-md hover:shadow-lg hover:bg-primary-hover transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined">send</span> 
              Nộp bài
            </button>
          </div>
        )}

        {/* Section 4: Completion State */}
        {isSubmitted && (
          <section id="celebration-section" className="glass-card p-xl flex flex-col items-center text-center gap-lg bg-surface-bright border-2 border-primary/20 relative overflow-hidden mt-xl fade-in-up">
            {/* Decorative celebratory elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-sm shadow-xl mx-auto bounce-animation">
                <span className="material-symbols-outlined !text-5xl" style={{fontVariationSettings: '\'FILL\' 1'}}>workspace_premium</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mt-sm">🎉 Chúc mừng! Bạn đã hoàn thành bài học.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg w-full max-w-[672px]">
              <div className="flex flex-col items-center gap-xs">
                <span className="text-on-surface-variant font-label-md">Điểm kinh nghiệm</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '\'FILL\' 1'}}>stars</span>
                  <span className="font-display text-headline-md text-primary">+50 XP</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-xs">
                <span className="text-on-surface-variant font-label-md">Chuỗi học tập</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-error" style={{fontVariationSettings: '\'FILL\' 1'}}>local_fire_department</span>
                  <span className="font-display text-headline-md text-error">+1 Ngày</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-xs">
                <span className="text-on-surface-variant font-label-md">Tiến độ khóa học</span>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-on-primary-fixed-variant" style={{fontVariationSettings: '\'FILL\' 1'}}>leaderboard</span>
                  <span className="font-display text-headline-md text-on-primary-fixed-variant">75%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-md w-full max-w-[448px] mt-sm">
              <button className="flex-1 h-12 bg-primary text-white rounded-xl font-label-md hover:bg-primary-container transition-all shadow-md active:scale-95">
                Tiếp tục bài học tiếp theo
              </button>
              <button className="flex-1 h-12 border border-outline-variant text-on-surface-variant rounded-xl font-label-md hover:bg-surface-variant/20 transition-all active:scale-95" onClick={() => window.location.href = '/dashboard/learning/path'}>
                Quay về lộ trình
              </button>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
