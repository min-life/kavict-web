"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface LessonNode {
  id: number;
  level: string;
  title: string;
  subtitle: string;
  description: string;
  status: "completed" | "current" | "locked";
  xpReward: number;
  topic: string;
}

const ROADMAP_LESSONS: LessonNode[] = [
  {
    id: 1,
    level: "Cấp độ 1",
    title: "Quản lý chi tiêu",
    subtitle: "Làm sao để theo dõi dòng tiền hàng ngày?",
    description: "Học cách quản lý dòng tiền cá nhân và phân chia chi tiêu khoa học theo quy tắc 50/30/20.",
    status: "completed",
    xpReward: 50,
    topic: "Ngân sách"
  },
  {
    id: 2,
    level: "Cấp độ 2",
    title: "Tiết kiệm",
    subtitle: "Xây dựng thói quen tích lũy tiền bạc",
    description: "Tìm hiểu nguyên tắc 'trả cho mình trước' và cách thiết lập tự động hóa tiết kiệm thông minh.",
    status: "completed",
    xpReward: 50,
    topic: "Tích lũy"
  },
  {
    id: 3,
    level: "Cấp độ 3",
    title: "Quỹ dự phòng",
    subtitle: "Tấm khiên bảo vệ tài chính trước rủi ro",
    description: "Cách tính toán quy mô và nơi lưu trữ an toàn cho quỹ khẩn cấp tương đương 3-6 tháng chi phí.",
    status: "completed",
    xpReward: 50,
    topic: "An toàn"
  },
  {
    id: 4,
    level: "Cấp độ 4",
    title: "Lãi kép",
    subtitle: "Kỳ quan thứ 8 hoạt động thế nào?",
    description: "Khám phá sức mạnh nhân số mũ của lãi kép qua thời gian và chiến lược tái đầu tư lợi nhuận.",
    status: "current",
    xpReward: 50,
    topic: "Tiết kiệm & Đầu tư"
  },
  {
    id: 5,
    level: "Cấp độ 5",
    title: "Đầu tư chứng khoán",
    subtitle: "Làm quen với thị trường cổ phiếu",
    description: "Nhập môn chứng khoán, tìm hiểu cách hoạt động của thị trường cổ phiếu và định giá doanh nghiệp cơ bản.",
    status: "locked",
    xpReward: 100,
    topic: "Đổ vốn"
  },
  {
    id: 6,
    level: "Cấp độ 6",
    title: "Quỹ mở",
    subtitle: "Đầu tư an toàn qua chứng chỉ quỹ",
    description: "Tìm hiểu phương pháp ủy thác đầu tư an toàn, giảm thiểu rủi ro qua các quỹ mở uy tín.",
    status: "locked",
    xpReward: 100,
    topic: "Quỹ thác"
  },
  {
    id: 7,
    level: "Cấp độ 7",
    title: "Crypto & Blockchain",
    subtitle: "Thế giới tài sản số thế hệ mới",
    description: "Tìm hiểu kiến thức nền tảng về tiền mã hóa, blockchain và các nguyên tắc quản trị rủi ro crypto.",
    status: "locked",
    xpReward: 100,
    topic: "Tài sản số"
  },
  {
    id: 8,
    level: "Cấp độ 8",
    title: "Phân bổ tài sản",
    subtitle: "Xây dựng danh mục đầu tư đa dạng",
    description: "Thiết lập công thức phân bổ tài sản phù hợp với khẩu vị rủi ro và độ tuổi cá nhân.",
    status: "locked",
    xpReward: 100,
    topic: "Quản trị"
  },
  {
    id: 9,
    level: "Cấp độ 9",
    title: "Tự do tài chính",
    subtitle: "Đạt cột mốc làm chủ cuộc sống",
    description: "Hoạch định kế hoạch nghỉ hưu sớm, tính toán con số tự do tài chính (FI/RE Number) của bạn.",
    status: "locked",
    xpReward: 150,
    topic: "Tối thượng"
  }
];

export default function LearningPath() {
  // Level 4 (Lãi kép) is at index 3. Default center focus.
  const [currentIndex, setCurrentIndex] = useState(3);
  
  // Real-time drag distance states
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const dragDistance = useRef(0);
  const dragStartTime = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    dragDistance.current = 0;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX.current;
    dragDistance.current = diff;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset(0);

    const duration = Date.now() - dragStartTime.current;
    const distance = dragDistance.current;

    // Calculate drag velocity (pixels per millisecond)
    const velocity = duration > 0 ? distance / duration : 0;
    
    // Add inertia based on velocity to support multi-card flicking
    const projectedDistance = distance + (velocity * 250);
    
    // Calculate number of cards to shift
    const cardsShift = Math.round(projectedDistance / 320);

    if (cardsShift !== 0) {
      setCurrentIndex((prev) => {
        const target = prev - cardsShift;
        return Math.max(0, Math.min(ROADMAP_LESSONS.length - 1, target));
      });
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Touch handlers for mobile swipe compatibility
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragDistance.current = 0;
    dragStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    dragDistance.current = diff;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleCardClick = (index: number) => {
    // Prevent triggering centring if we actually were dragging
    if (Math.abs(dragDistance.current) > 10) return;
    setCurrentIndex(index);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Intercept Link click if user was dragging
    if (Math.abs(dragDistance.current) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] justify-center relative overflow-hidden">
      
      {/* Sticky Streak & Achievements Card (RESTORED TO ORIGINAL STICKY LAYOUT) */}
      <div className="sticky top-0 z-50 w-full h-0 flex justify-end items-start pointer-events-none">
        <div className="bg-surface-container-lowest rounded-[24px] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-surface-variant flex items-center gap-3 fade-in-up pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-display text-2xl">🔥</span>
            <div>
              <div className="font-label-sm text-[10px] text-secondary">Streak</div>
              <div className="font-headline-md text-xs font-bold text-on-surface">15 ngày</div>
            </div>
          </div>
          <div className="w-px h-10 bg-surface-variant"></div>
          <div className="flex items-center gap-2">
            <span className="text-display text-2xl">🏆</span>
            <div>
              <div className="font-label-sm text-[10px] text-secondary">Bài học</div>
              <div className="font-headline-md text-xs font-bold text-on-surface">28</div>
            </div>
          </div>
          <div className="w-px h-10 bg-surface-variant"></div>
          <div className="flex items-center gap-2">
            <div className="font-label-md text-xs text-primary font-bold">1.450 XP</div>
          </div>
          <div className="w-px h-10 bg-surface-variant"></div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
              <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="80, 100" strokeLinecap="round" strokeWidth="3"></path>
            </svg>
            <span className="absolute font-label-sm text-[10px] text-on-surface">80%</span>
          </div>
        </div>
      </div>
      
      {/* Slideshow Centered Viewport Container (Centered Vertically) */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
        
        {/* Slideshow drag viewport */}
        <div 
          className="w-full h-[450px] overflow-hidden relative cursor-grab active:cursor-grabbing select-none flex items-center z-10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Slides Track centered relative to parent using left-1/2 and translateX */}
          <div 
            className="absolute left-1/2 top-0 h-full flex items-center will-change-transform" 
            style={{ 
              transform: `translateX(calc(-${currentIndex * 320 + 160}px + ${dragOffset}px))`,
              transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {ROADMAP_LESSONS.map((lesson, index) => {
              const isActive = index === currentIndex;
              return (
                <div 
                  key={lesson.id}
                  className="w-[320px] flex-shrink-0 flex justify-center px-2.5"
                >
                  <div 
                    onClick={() => handleCardClick(index)}
                    className={`w-[300px] h-[390px] rounded-[32px] p-6 border transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${
                      isActive 
                        ? 'bg-surface-container-lowest border-[#F59E0B] shadow-[0_20px_50px_rgba(245,158,11,0.12)] scale-105 z-20' 
                        : 'bg-surface-container-lowest/60 border-outline-variant/20 opacity-45 scale-90 z-10 grayscale hover:opacity-75 hover:scale-95'
                    }`}
                  >
                    {/* Active highlight glow */}
                    {isActive && (
                      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#F59E0B]/5 rounded-full blur-2xl pointer-events-none"></div>
                    )}
                    
                    {/* Level Badge Header */}
                    <div className="flex justify-between items-center w-full">
                      <span className="font-label-sm text-xs font-bold text-secondary uppercase tracking-widest">
                        {lesson.level}
                      </span>
                      <span className={`font-label-sm text-[10px] px-2.5 py-1 rounded-full border ${
                        isActive 
                          ? 'bg-[#F59E0B]/5 text-[#F59E0B] border-[#F59E0B]/20' 
                          : 'bg-surface-container text-on-surface-variant/80 border-outline-variant/20'
                      }`}>
                        {lesson.topic}
                      </span>
                    </div>

                    {/* Lesson Core Information */}
                    <div className="flex flex-col items-center text-center my-auto gap-4">
                      {/* State node */}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center relative shadow-sm transition-all duration-500 ${
                        lesson.status === 'completed' 
                          ? 'bg-emerald-600 text-white' 
                          : lesson.status === 'current' 
                            ? 'bg-[#F59E0B]/10 border-4 border-[#F59E0B] text-[#F59E0B]' 
                            : 'bg-surface-container-high border-2 border-outline-variant text-outline'
                      }`}>
                        {lesson.status === 'current' && (
                          <div className="absolute inset-0 rounded-full border-4 border-[#F59E0B] pulse-ring"></div>
                        )}
                        <span className="material-symbols-outlined !text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>
                          {lesson.status === 'completed' ? 'verified' : lesson.status === 'current' ? 'play_arrow' : 'lock'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-headline-md text-base md:text-lg text-on-surface font-bold leading-tight">
                          {lesson.title}
                        </h3>
                        <p className="font-body-md text-xs text-on-surface-variant leading-relaxed line-clamp-3 px-3">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Action Button */}
                    <div className="w-full">
                      {lesson.status === 'locked' ? (
                        <button 
                          disabled 
                          className="w-full h-11 bg-outline-variant/30 text-on-surface-variant/40 rounded-2xl font-label-md text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed border-none"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          Chưa mở khóa
                        </button>
                      ) : isActive ? (
                        <Link href={`/dashboard/learning/lesson/${lesson.id}`} className="w-full block" onClick={handleLinkClick}>
                          <button className="w-full h-11 bg-primary text-on-primary rounded-2xl font-label-md text-xs font-bold hover:bg-primary-fixed-variant transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                            {lesson.status === 'current' ? 'Học tiếp ngay' : 'Xem lại bài học'}
                          </button>
                        </Link>
                      ) : (
                        <button 
                          onClick={() => handleCardClick(index)}
                          className="w-full h-11 border border-outline text-secondary hover:text-on-surface hover:bg-surface rounded-2xl font-label-md text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          Chọn bài học
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Navigation Indicator Dots */}
        <div className="flex gap-2 justify-center mt-4 select-none z-30">
          {ROADMAP_LESSONS.map((_, index) => (
            <button 
              key={index}
              onClick={() => handleCardClick(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-outline-variant/60 hover:bg-outline-variant'
              }`}
              title={`Cấp độ ${index + 1}`}
            ></button>
          ))}
        </div>

      </div>

    </div>
  );
}
