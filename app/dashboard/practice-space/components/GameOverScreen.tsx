"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GameResult, calculateFinalScore } from "../services/gameState";
import { MoneyIQStats } from "./MoneyIQBoard";

interface GameOverScreenProps {
  results: GameResult[];
  playerNames: Record<string, string>; // playerId -> display name
  onPlayAgain: () => void;
  onExit: () => void;
}

const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600", "text-on-surface-variant"];
const RANK_ICONS = ["emoji_events", "workspace_premium", "military_tech", "social_leaderboard"];

export default function GameOverScreen({ results, playerNames, onPlayAgain, onExit }: GameOverScreenProps) {
  const winner = results[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-w-[320px] max-w-lg mx-auto flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-surface rounded-3xl shadow-2xl border border-surface-variant h-auto max-h-full min-h-0 shrink"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-4 sm:mb-6 shrink-0"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 sm:mb-4">
          <span className="material-symbols-outlined text-[32px] sm:text-[40px]">emoji_events</span>
        </div>
        <h1 className="font-bold text-2xl sm:text-3xl text-on-surface mb-1">Kết quả ván chơi</h1>
        {winner && !winner.isEliminated ? (
          <p className="text-on-surface-variant text-base">
            🏆 Người chiến thắng: <strong className="text-primary">{playerNames[winner.playerId] ?? winner.playerId}</strong>
          </p>
        ) : (
          <p className="text-error font-medium text-base">
            💔 Không có người chiến thắng
          </p>
        )}
      </motion.div>

      {/* Rankings */}
      <div className="w-full min-w-[320px] max-w-lg flex-1 min-h-0 space-y-2 sm:space-y-3 mb-4 sm:mb-6 px-2 sm:px-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {results.map((result, idx) => (
          <motion.div
            key={result.playerId}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className={`bg-surface rounded-2xl border p-3 sm:p-4 shrink-0 ${idx === 0 && !result.isEliminated ? "border-primary shadow-lg" : "border-surface-variant"}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className={`material-symbols-outlined text-[24px] sm:text-[28px] ${RANK_COLORS[idx] ?? RANK_COLORS[3]}`}>
                {RANK_ICONS[idx] ?? RANK_ICONS[3]}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-on-surface leading-tight">{playerNames[result.playerId] ?? result.playerId}</span>
                  {result.isEliminated && (
                    <span className="text-[10px] font-semibold text-error bg-error-container px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Bị loại</span>
                  )}
                </div>
                {result.isEliminated && result.eliminationReason && (
                  <p className="text-xs text-error">{result.eliminationReason}</p>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-primary">{result.finalScore}</div>
                <div className="text-xs text-on-surface-variant">Money IQ</div>
              </div>
            </div>

            {/* 4 metrics */}
            <div className="flex flex-wrap justify-between items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
              {[
                { label: "Tiết kiệm", value: result.moneyIQ.savingsScore, color: "text-yellow-600", icon: "savings" },
                { label: "Thông minh", value: result.moneyIQ.intelligenceScore, color: "text-blue-500", icon: "lightbulb" },
                { label: "Hạnh phúc", value: result.moneyIQ.happinessScore, color: "text-rose-500", icon: "favorite" },
                { label: "Kỷ luật", value: result.moneyIQ.disciplineScore, color: "text-emerald-500", icon: "verified_user" },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="flex items-center gap-1 bg-surface-variant/30 px-2 py-1 rounded-lg" title={label}>
                  <span className={`material-symbols-outlined text-[14px] sm:text-[16px] ${color}`}>{icon}</span>
                  <span className="font-bold text-xs sm:text-sm text-on-surface">{value}</span>
                </div>
              ))}
            </div>

            {/* Final balance */}
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-surface-variant flex justify-between text-xs text-on-surface-variant">
              <span>Số dư cuối game</span>
              <span className="font-bold text-on-surface">{result.finalBalance.toLocaleString()}đ</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 sm:gap-3 shrink-0"
      >
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary/90 active:scale-95 transition-all"
        >
          Chơi lại
        </button>
        <button
          onClick={onExit}
          className="px-6 py-3 bg-surface-container text-on-surface rounded-full font-bold hover:bg-surface-container-high active:scale-95 transition-all"
        >
          Về trang chủ
        </button>
      </motion.div>
    </motion.div>
  );
}
