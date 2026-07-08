"use client";

import { motion } from "framer-motion";

interface DayHeaderProps {
  currentMonth: number;
  currentDay: number;
  totalMonths: number;
  currentEventIndex: number;
  totalEventsToday: number;
}

export default function DayHeader({
  currentMonth,
  currentDay,
  totalMonths,
  currentEventIndex,
  totalEventsToday,
}: DayHeaderProps) {
  const dayPct = ((currentDay - 1) / 30) * 100;
  const monthPct = ((currentMonth - 1) / totalMonths) * 100;
  const eventPct = totalEventsToday > 0
    ? (currentEventIndex / totalEventsToday) * 100
    : 0;

  return (
    <div className="w-full min-w-[320px] max-w-[400px] mx-auto">
      {/* Main info row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
          <div>
            <span className="font-bold text-on-surface text-sm">
              Tháng {currentMonth}/{totalMonths}
            </span>
            <span className="text-on-surface-variant text-sm"> · Ngày {currentDay}/30</span>
          </div>
        </div>

        {/* Event progress */}
        <div className="text-xs text-on-surface-variant">
          Sự kiện {Math.min(currentEventIndex + 1, totalEventsToday)}/{totalEventsToday}
        </div>
      </div>

      {/* Event progress bar (primary) */}
      <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden mb-1">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${eventPct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Day + Month secondary bars */}
      <div className="flex gap-2">
        <div className="flex-1 h-0.5 bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary rounded-full"
            animate={{ width: `${dayPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex-1 h-0.5 bg-surface-variant rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-tertiary rounded-full"
            animate={{ width: `${monthPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant mt-0.5">
        <span>Tiến trình ngày</span>
        <span>Tiến trình game</span>
      </div>
    </div>
  );
}
