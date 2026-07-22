"use client";

import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameEvent, EventOption } from "../data/gameEvents";

interface EventCardProps {
  event: GameEvent;
  decisionTimeSeconds: number;
  onDecide: (optionIndex: number) => void;
  onConfirmForced: () => void;
  onAutoSelect: () => void;
  // Multiplayer props
  isMultiplayer?: boolean;
  players?: Array<{ id: string; name: string; avatarLetter: string }>;
  myPlayerId?: string;
  onSelectFriendTarget?: (targetId: string) => void;
  // State after decision
  lastDecisionLabel?: string;
}

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(({
  event,
  decisionTimeSeconds,
  onDecide,
  onConfirmForced,
  onAutoSelect,
  isMultiplayer = false,
  players = [],
  myPlayerId,
  onSelectFriendTarget,
  lastDecisionLabel,
}, ref) => {
  const [timeLeft, setTimeLeft] = useState(decisionTimeSeconds);
  const [decided, setDecided] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [friendSelectMode, setFriendSelectMode] = useState(false);
  const [isAutoSelected, setIsAutoSelected] = useState(false);

  // Countdown timer (only for choice events)
  useEffect(() => {
    if (event.type === "forced" || decided) return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (timeLeft === 1) {
        setTimeLeft(0);
        setIsAutoSelected(true);
        onAutoSelect();
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, decided, event.type, onAutoSelect]);

  const handleDecide = useCallback((idx: number) => {
    if (decided) return;
    setSelectedIndex(idx);
    setDecided(true);

    if (event.type === "friend_interaction") {
      // Show friend selector
      setFriendSelectMode(true);
    } else {
      onDecide(idx);
    }
  }, [decided, event.type, onDecide]);

  const handleConfirmForced = useCallback(() => {
    if (decided) return;
    setDecided(true);
    onConfirmForced();
  }, [decided, onConfirmForced]);

  const progressPct = event.type !== "forced"
    ? (timeLeft / decisionTimeSeconds) * 100
    : 100;

  const timerColor = progressPct > 50
    ? "bg-primary"
    : progressPct > 25
      ? "bg-amber-400"
      : "bg-error";

  const otherPlayers = players.filter((p) => p.id !== myPlayerId);

  const selectedOption = decided && selectedIndex !== null && event.type === "choice" ? event.options?.[selectedIndex]
    : decided && event.type === "forced" ? event.forcedEffect
    : decided && event.type === "friend_interaction" && selectedIndex === 0 ? event.friendInteraction?.initiatorEffect
    : null;

  return (
    <motion.div
      ref={ref}
      key={event.id}
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -24 }}
      className="w-full min-w-[280px] max-w-[340px] mx-auto shrink min-h-0 flex flex-col"
    >
      <div className="bg-surface rounded-3xl shadow-2xl border border-surface-variant overflow-hidden relative h-auto max-h-full min-h-[380px] flex flex-col shrink-0">
        
        {/* Big Circular Countdown Timer (Top Right) */}
        {event.type !== "forced" && !decided && (
          <div className={`absolute top-4 right-4 w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold tabular-nums text-lg shadow-sm bg-surface
            ${timeLeft <= 5 ? "border-error text-error animate-pulse scale-110 transition-transform" : "border-primary text-primary"}`}>
             {timeLeft}
          </div>
        )}

        {/* Timer bar (top) */}
        {event.type !== "forced" && (
          <div className="h-1 bg-surface-variant">
            <motion.div
              className={`h-full transition-colors duration-500 ${timerColor}`}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
            />
          </div>
        )}

        {/* Floating Animation for Stats Overlay */}
        <AnimatePresence>
          {decided && selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-50 px-4 text-center"
            >
              {selectedOption.happinessChange !== 0 && (
                 <div className="text-lg md:text-xl font-bold text-rose-600 bg-white/95 px-5 py-1.5 rounded-full mb-2 shadow-lg border border-rose-100 flex items-center gap-2">
                   {selectedOption.happinessChange > 0 ? "+" : ""}{selectedOption.happinessChange} Hạnh phúc <span className="text-xl">😊</span>
                 </div>
              )}
              {selectedOption.intelligenceChange !== 0 && (
                 <div className="text-lg md:text-xl font-bold text-blue-600 bg-white/95 px-5 py-1.5 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 mb-3">
                   {selectedOption.intelligenceChange > 0 ? "+" : ""}{selectedOption.intelligenceChange} Thông minh <span className="text-xl">💡</span>
                 </div>
              )}
              <div className="text-sm md:text-base font-medium text-white bg-slate-800/95 px-5 py-2.5 rounded-2xl shadow-2xl max-w-full leading-snug backdrop-blur-md">
                {selectedOption.message || getFallbackMessage(selectedOption)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-selected overlay text */}
        <AnimatePresence>
          {isAutoSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-error text-on-error px-4 py-1 rounded-full font-bold text-sm shadow-md z-40 whitespace-nowrap"
            >
              Hết giờ! Tự động chọn
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="p-4 sm:p-6 pt-10 sm:pt-10 relative z-10 flex-1 min-h-0 flex flex-col justify-center overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-4 sm:mb-6 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-2 sm:mb-4">
              <span className="material-symbols-outlined text-[32px] sm:text-[40px]">{event.icon}</span>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-2">
              {event.isMealEvent && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Bữa ăn cố định
                </span>
              )}
              {event.type === "forced" && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Sự kiện bắt buộc
                </span>
              )}
              {event.type === "friend_interaction" && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Tương tác bạn bè
                </span>
              )}
            </div>

            <h3 className="font-bold text-xl sm:text-2xl text-on-surface mb-1 sm:mb-2">{event.title}</h3>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">{event.description}</p>
          </div>

          {/* Forced event — single confirm button */}
          {event.type === "forced" && event.forcedEffect && (
            <div className="space-y-3">
              <EffectPreview option={event.forcedEffect} />
              <button
                onClick={handleConfirmForced}
                disabled={decided}
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-base hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          )}

          {/* Choice event — 2 options */}
          {event.type === "choice" && event.options && (
            <div className="space-y-4">
              {event.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDecide(idx)}
                  disabled={decided}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all active:scale-95 shrink-0
                    ${selectedIndex === idx
                      ? "border-primary bg-primary/10"
                      : "border-surface-variant hover:border-primary/40 hover:bg-surface-variant/50"
                    }
                    ${decided && selectedIndex !== idx ? "opacity-40" : ""}
                    disabled:cursor-default`}
                >
                  <div className="font-bold text-on-surface text-base mb-1.5">{option.label}</div>
                  <EffectPreview option={option} />
                </button>
              ))}
            </div>
          )}

          {/* Friend interaction — pick initiator option then select target */}
          {event.type === "friend_interaction" && event.friendInteraction && (
            <div className="space-y-3">
              {!friendSelectMode ? (
                <>
                  <EffectPreview option={event.friendInteraction.initiatorEffect} />
                  {isMultiplayer && otherPlayers.length > 0 ? (
                    <button
                      onClick={() => handleDecide(0)}
                      disabled={decided}
                      className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-base hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                    >
                      Chọn người mời
                    </button>
                  ) : (
                    <p className="text-center text-on-surface-variant text-sm py-3">
                      Không có người chơi khác để mời.
                    </p>
                  )}
                  <button
                    onClick={() => onDecide(-1)}
                    disabled={decided}
                    className="w-full py-2 rounded-2xl border border-surface-variant text-on-surface-variant text-sm hover:bg-surface-variant/50 transition-all disabled:opacity-50"
                  >
                    Bỏ qua
                  </button>
                </>
              ) : (
                /* Friend selection grid */
                <div className="space-y-2">
                  <p className="text-center text-sm text-on-surface-variant font-medium mb-3">
                    Chọn người bạn muốn mời:
                  </p>
                  {otherPlayers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectFriendTarget?.(p.id);
                      }}
                      className="w-full p-3 rounded-2xl border border-surface-variant hover:border-primary hover:bg-primary/5 flex items-center gap-3 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-lg">
                        {p.avatarLetter}
                      </div>
                      <span className="font-semibold text-on-surface">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

EventCard.displayName = "EventCard";

// Small component to preview effect of an option
function EffectPreview({ option, compact = false }: { option: EventOption; compact?: boolean }) {
  const costLabel = option.cost === 0
    ? "Miễn phí"
    : option.cost < 0
      ? `+${Math.abs(option.cost).toLocaleString()}đ`
      : `-${option.cost.toLocaleString()}đ`;
  const costColor = option.cost < 0 ? "text-primary" : option.cost === 0 ? "text-on-surface-variant" : "text-error";

  return (
    <div className={`flex items-center gap-3 ${compact ? "text-xs" : "text-sm"}`}>
      <span className={`font-bold tabular-nums ${costColor}`}>{costLabel}</span>
      {option.category && (
        <span className="text-on-surface-variant opacity-70">• {option.category}</span>
      )}
      {/* Happiness and Intelligence have been moved to floating animations over the card */}
    </div>
  );
}

function getFallbackMessage(option: EventOption): string {
  if (option.happinessChange > 0 && option.intelligenceChange > 0) return "Lựa chọn tuyệt vời! Vui vẻ và bổ ích.";
  if (option.happinessChange < 0 && option.intelligenceChange > 0) return "Hơi buồn một chút, nhưng tốt cho tương lai!";
  if (option.happinessChange > 0 && option.cost > 100000) return "Chơi lớn đấy! Nhớ cân đối ngân sách nhé.";
  if (option.cost === 0) return "Tuyệt vời, không tốn một đồng nào!";
  if (option.happinessChange < 0 && option.cost < 50000) return "Tiết kiệm là quốc sách!";
  if (option.happinessChange === 0 && option.intelligenceChange === 0) return "Một quyết định an toàn.";
  return "Hãy tiếp tục phát huy nhé!";
}

export default EventCard;
