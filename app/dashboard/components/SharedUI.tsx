"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ target, suffix = "" }: { target: number, suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        const duration = 2000;
        const stepTime = Math.abs(Math.floor(duration / 60));
        let current = 0;
        const increment = target / (duration / stepTime);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setValue(target);
            clearInterval(timer);
          } else {
            setValue(Math.ceil(current));
          }
        }, stepTime);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{new Intl.NumberFormat('vi-VN').format(value)}{suffix}</span>;
}

export function AnimatedProgressBar({ percent, className }: { percent: number, className?: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setTimeout(() => setWidth(percent), 200);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent]);

  return (
    <div ref={ref} className={className} style={{ width: `${width}%`, transition: 'width 1.5s ease-out' }}></div>
  );
}

export function AnimatedProgressRing({ percent }: { percent: number }) {
  const [offset, setOffset] = useState(251.2);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        setTimeout(() => {
          const radius = 40;
          const circumference = radius * 2 * Math.PI;
          setOffset(circumference - (percent / 100) * circumference);
        }, 500);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent]);

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
      <circle ref={ref} className="text-primary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={offset} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dashoffset 1s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}></circle>
    </svg>
  );
}
