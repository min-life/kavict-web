"use client";
import React, { useState, useRef, useEffect } from "react";

const PREDEFINED_CATEGORIES = [
  { name: "Ăn uống", icon: "restaurant", color: "text-orange-500", bg: "bg-orange-100" },
  { name: "Di chuyển", icon: "directions_car", color: "text-blue-500", bg: "bg-blue-100" },
  { name: "Hóa đơn", icon: "receipt_long", color: "text-red-500", bg: "bg-red-100" },
  { name: "Mua sắm", icon: "shopping_bag", color: "text-pink-500", bg: "bg-pink-100" },
  { name: "Sức khỏe", icon: "medical_services", color: "text-green-500", bg: "bg-green-100" },
  { name: "Giải trí", icon: "movie", color: "text-purple-500", bg: "bg-purple-100" },
  { name: "Tiết kiệm", icon: "savings", color: "text-teal-500", bg: "bg-teal-100" },
  { name: "Giáo dục", icon: "school", color: "text-yellow-600", bg: "bg-yellow-100" }
];

const COLORS = [
  { text: "text-orange-500", bg: "bg-orange-100" },
  { text: "text-blue-500", bg: "bg-blue-100" },
  { text: "text-red-500", bg: "bg-red-100" },
  { text: "text-pink-500", bg: "bg-pink-100" },
  { text: "text-green-500", bg: "bg-green-100" },
  { text: "text-purple-500", bg: "bg-purple-100" },
  { text: "text-teal-500", bg: "bg-teal-100" },
  { text: "text-yellow-600", bg: "bg-yellow-100" },
  { text: "text-gray-500", bg: "bg-gray-100" }
];

const ICONS = ["restaurant", "directions_car", "receipt_long", "shopping_bag", "medical_services", "movie", "savings", "school", "home", "flight", "payments", "account_balance_wallet", "favorite", "pets", "fitness_center", "local_cafe"];

interface IconPickerProps {
  currentIcon?: string;
  currentColor?: string; // e.g. text-orange-500
  currentBg?: string; // e.g. bg-orange-100
  onSelect: (data: { icon: string; color: string; bg: string; name?: string }) => void;
  children: React.ReactNode;
}

export default function IconPicker({ currentIcon, currentColor, currentBg, onSelect, children }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"preset" | "custom">("preset");
  const containerRef = useRef<HTMLDivElement>(null);

  const [customIcon, setCustomIcon] = useState(currentIcon || "category");
  const [customColor, setCustomColor] = useState(currentColor || "text-gray-500");
  const [customBg, setCustomBg] = useState(currentBg || "bg-gray-100");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col p-2 animate-fade-in">
          <div className="flex bg-surface-container-low rounded-lg p-1 mb-3">
            <button 
              onClick={() => setTab("preset")} 
              className={`flex-1 py-1 text-xs font-bold rounded-md ${tab === "preset" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Danh mục
            </button>
            <button 
              onClick={() => setTab("custom")} 
              className={`flex-1 py-1 text-xs font-bold rounded-md ${tab === "custom" ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Tùy chỉnh
            </button>
          </div>

          {tab === "preset" ? (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto hide-scrollbar p-1">
              {PREDEFINED_CATEGORIES.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelect({ icon: c.icon, color: c.color, bg: c.bg, name: c.name });
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface truncate">{c.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-1 space-y-4 max-h-60 overflow-y-auto hide-scrollbar">
              <div>
                <p className="text-xs font-bold text-on-surface-variant mb-2">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => { setCustomColor(c.text); setCustomBg(c.bg); }}
                      className={`w-8 h-8 rounded-full ${c.bg} ${customColor === c.text ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-on-surface-variant mb-2">Biểu tượng</p>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic, i) => (
                    <button
                      key={i}
                      onClick={() => setCustomIcon(ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container ${customIcon === ic ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  onSelect({ icon: customIcon, color: customColor, bg: customBg });
                  setIsOpen(false);
                }}
                className="w-full bg-primary text-on-primary py-2 rounded-xl font-bold text-sm shadow-sm"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
