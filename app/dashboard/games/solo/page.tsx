"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameConfig } from "../services/roomService";
import GameConfigForm, { CHARACTERS } from "../components/GameConfigForm";
import PlanningPhase, { CATEGORIES } from "../components/PlanningPhase";
import MoneyIQBoard from "../components/MoneyIQBoard";
import BudgetTracker from "../components/BudgetTracker";
import EventCard from "../components/EventCard";
import DayHeader from "../components/DayHeader";
import GameOverScreen from "../components/GameOverScreen";
import { useGameEngine } from "../hooks/useGameEngine";
import { useAuth } from "@/features/auth/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

type SoloGamePhase = "configuring" | "planning" | "playing";

// Fake userId for solo play (no auth needed but use auth uid if available)
const SOLO_PLAYER_ID = "solo_player";

export default function SoloGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<SoloGamePhase>("configuring");
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [planningEndTime, setPlanningEndTime] = useState<number | undefined>();
  const [plannedAllocations, setPlannedAllocations] = useState<Record<string, number>>({});

  const userId = user?.uid ?? SOLO_PLAYER_ID;

  const handleConfigSubmit = (newConfig: GameConfig) => {
    setConfig(newConfig);
    setPlanningEndTime(Date.now() + newConfig.planningTimeSeconds * 1000);
    setPhase("planning");
  };

  const handleStartGame = (allocations?: Record<string, number>) => {
    if (allocations) setPlannedAllocations(allocations);
    setPhase("playing");
  };

  const character = config ? CHARACTERS.find((c) => c.id === config.characterId) : null;
  const categories = config ? CATEGORIES[config.characterId] ?? [] : [];

  return (
    <div className="flex flex-col min-h-screen bg-background" style={{ width: "100%", minWidth: 0 }}>
      <header className="flex items-center justify-between p-4 border-b border-surface-variant bg-surface">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          Chơi Đơn
        </h1>
        <Link
          href="/dashboard/games"
          className="flex items-center gap-1 text-sm font-medium text-error hover:bg-error-container px-3 py-1.5 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">exit_to_app</span>
          Thoát
        </Link>
      </header>

      <main className="w-full relative" style={{ width: "100%", minWidth: 0 }}>
        {phase === "configuring" && (
          <GameConfigForm isHost={true} onSubmit={handleConfigSubmit} />
        )}

        {phase === "planning" && config && (
          <div className="w-full p-4">
            <PlanningPhase
              config={config}
              planningEndTime={planningEndTime}
              onTimeUp={handleStartGame}
              isHost={true}
              onSkip={handleStartGame}
            />
          </div>
        )}

        {phase === "playing" && config && (
          <PlayingArea
            config={config}
            userId={userId}
            plannedAllocations={plannedAllocations}
            character={character ?? undefined}
            categories={categories}
            onRestart={() => {
              setConfig(null);
              setPlannedAllocations({});
              setPhase("configuring");
            }}
            onExit={() => router.push("/dashboard/games")}
          />
        )}
      </main>
    </div>
  );
}

// ─── Playing Area (isolated so game engine only mounts when playing) ──────────
interface PlayingAreaProps {
  config: GameConfig;
  userId: string;
  plannedAllocations: Record<string, number>;
  character: ReturnType<typeof CHARACTERS.find>;
  categories: string[];
  onRestart: () => void;
  onExit: () => void;
}

function PlayingArea({ config, userId, plannedAllocations, character, categories, onRestart, onExit }: PlayingAreaProps) {
  const {
    gameState,
    currentEvent,
    myPlayerState,
    phase,
    gameResults,
    isGameOver,
    handleDecision,
    handleAutoSelect,
    handleConfirmForced,
    proceedFromSummary,
  } = useGameEngine({ config, userId, plannedAllocations });

  if (!gameState || !myPlayerState) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const monthlyIncome = character?.income ?? 0;
  const actualBalance = myPlayerState.balance;

  return (
    <div className="w-full h-full bg-surface flex flex-row items-stretch justify-between p-4 overflow-x-auto gap-4">
      {/* LEFT COLUMN: Money IQ Board */}
      <div className="flex flex-col justify-start h-full w-min shrink-0 z-10 pt-4">
        <MoneyIQBoard stats={myPlayerState.moneyIQ} />
      </div>

      {/* CENTER COLUMN: Game play area */}
      <div className="flex-1 flex flex-col items-center justify-start min-w-[340px] max-w-[600px] mx-auto z-20 relative h-full shrink-0 pt-4">
        {/* Day/Month progress */}
        <div className="w-full mb-4 shrink-0 px-2">
          <DayHeader
            currentMonth={gameState.currentMonth}
            currentDay={gameState.currentDay}
            totalMonths={gameState.totalMonths}
            currentEventIndex={myPlayerState.currentEventIndex}
            totalEventsToday={myPlayerState.eventsForToday.length}
          />
        </div>

        {/* Event card */}
        <AnimatePresence mode="wait">
          {(phase === "event_display" || phase === "applying_effect") && currentEvent && (
            <EventCard
              key={currentEvent.id}
              event={currentEvent}
              decisionTimeSeconds={config.decisionTimeSeconds}
              onDecide={handleDecision}
              onConfirmForced={handleConfirmForced}
              onAutoSelect={handleAutoSelect}
            />
          )}

          {phase === "day_summary" && (
            <motion.div
              key="day_summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full shrink-0 px-2"
            >
              <div className="bg-surface rounded-3xl border border-surface-variant shadow-2xl p-6 h-auto max-h-full min-h-[380px] flex flex-col items-center justify-center text-center shrink min-h-0 w-full min-w-[280px]">
                <span className="material-symbols-outlined text-[48px] text-primary mb-4 block">check_circle</span>
                <h3 className="font-bold text-xl text-on-surface mb-1">
                  Xong ngày {gameState.currentDay}!
                </h3>
                <p className="text-on-surface-variant text-sm mb-4">
                  Tháng {gameState.currentMonth} · Số dư: <strong className="text-primary">{actualBalance.toLocaleString()}đ</strong>
                </p>
              </div>
            </motion.div>
          )}

          {isGameOver && gameResults && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mt-4"
            >
              <GameOverScreen
                results={gameResults}
                playerNames={{ [userId]: character ? `${character.name} (Bạn)` : "Bạn" }}
                onPlayAgain={onRestart}
                onExit={onExit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: Budget Tracker */}
      <div className="flex flex-col justify-start h-full w-72 shrink-0 z-10 pt-4">
        <BudgetTracker
          allCategories={categories}
          plannedAllocations={plannedAllocations}
          actualSpending={myPlayerState.actualSpending}
          totalAssets={actualBalance}
        />
      </div>
    </div>
  );
}
