"use client";
import React, { useState, useRef, useEffect } from "react";

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  suggestionClassName?: string;
}

export default function MoneyInput({ value, onChange, className, placeholder, suggestionClassName }: MoneyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value ? value.toString() : "");
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(val);
    onChange(Number(val));
  };

  const currentNum = Number(inputValue);
  const showSuggestions = isFocused && currentNum > 0 && currentNum < 1000000;

  const suggestions = showSuggestions ? [
    currentNum * 1000,
    currentNum * 10000,
    currentNum * 100000,
    currentNum * 1000000,
  ] : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="flex-1 min-w-0" ref={containerRef}>
      <input
        type="text"
        inputMode="numeric"
        value={isFocused ? inputValue : (value ? new Intl.NumberFormat("vi-VN").format(value) : "")}
        onChange={handleInputChange}
        onFocus={() => {
          setInputValue(value ? value.toString() : "");
          setIsFocused(true);
        }}
        className={className}
        placeholder={placeholder}
      />
      {showSuggestions && (
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`absolute top-full mt-2 z-50 flex gap-2 overflow-x-auto pb-1 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${suggestionClassName || "left-0 w-full"}`}
        >
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(s);
                setInputValue(s.toString());
                setIsFocused(false);
              }}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 bg-surface text-on-surface text-xs font-bold rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors shadow-sm pointer-events-auto"
            >
              {new Intl.NumberFormat("vi-VN").format(s)} ₫
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
