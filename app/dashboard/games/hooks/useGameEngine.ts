"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GameState,
  PlayerGameState,
  initGameState,
  applyOptionToPlayer,
  checkElimination,
  advanceDay,
  getAutoSelectOptionIndex,
  getGameResults,
  GameResult,
} from "../services/gameState";
import { GameEvent } from "../data/gameEvents";
import { GameConfig } from "../services/roomService";
import { CATEGORIES } from "../components/PlanningPhase";
import { CHARACTERS } from "../components/GameConfigForm";

interface UseGameEngineProps {
  config: GameConfig;
  userId: string;
  plannedAllocations: Record<string, number>;
}

export interface GameEngineState {
  gameState: GameState | null;
  currentEvent: GameEvent | null;
  myPlayerState: PlayerGameState | null;
  phase: PlayerGameState["phase"] | null;
  gameResults: GameResult[] | null;
  isGameOver: boolean;
  // Actions
  handleDecision: (optionIndex: number) => void;
  handleAutoSelect: () => void;
  handleConfirmForced: () => void;
  proceedFromSummary: () => void;
}

const RECENT_EVENT_IDS_MAX = 20; // Don't repeat the same event within last N events

export function useGameEngine({ config, userId, plannedAllocations }: UseGameEngineProps): GameEngineState {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const recentEventIds = useRef<string[]>([]);

  // Initialize game on mount
  useEffect(() => {
    const categories = CATEGORIES[config.characterId] || [];
    const character = CHARACTERS.find((c) => c.id === config.characterId);
    const monthlyIncome = character?.income ?? 0;

    const initialState = initGameState({
      playerIds: [userId],
      characterId: config.characterId,
      categories,
      monthlyIncome,
      savingsGoal: config.savingsGoal,
      durationMonths: config.durationMonths,
      isMultiplayer: false,
    });

    setGameState(initialState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const myPlayerState = gameState?.playerStates[userId] ?? null;

  const currentEvent = myPlayerState
    ? myPlayerState.eventsForToday[myPlayerState.currentEventIndex] ?? null
    : null;

  const isGameOver = myPlayerState?.phase === "game_over";

  const gameResults = isGameOver && gameState
    ? getGameResults(gameState)
    : null;

  // -------------------------------------------------------
  // Core: apply a decision and advance game state
  // -------------------------------------------------------
  const applyDecision = useCallback((optionIndex: number) => {
    setGameState((prev) => {
      if (!prev) return prev;

      const myState = prev.playerStates[userId];
      const event = myState.eventsForToday[myState.currentEventIndex];
      if (!event) return prev;

      const option = event.options?.[optionIndex] ?? event.forcedEffect;
      if (!option) return prev;

      // Apply to player
      let updatedPlayerState = applyOptionToPlayer(
        myState,
        option,
        prev.categories,
        prev.savingsGoal,
        prev.totalMonths,
        plannedAllocations
      );

      // Check elimination
      const elimCheck = checkElimination(updatedPlayerState);
      if (elimCheck.eliminated) {
        updatedPlayerState = {
          ...updatedPlayerState,
          isEliminated: true,
          eliminationReason: elimCheck.reason,
        };
      }

      // Track recent event
      recentEventIds.current = [
        event.id,
        ...recentEventIds.current,
      ].slice(0, RECENT_EVENT_IDS_MAX);

      // Only update player states and set phase to applying_effect
      updatedPlayerState = {
         ...updatedPlayerState,
         phase: "applying_effect"
      };

      return {
        ...prev,
        playerStates: {
          ...prev.playerStates,
          [userId]: updatedPlayerState,
        },
      };
    });
  }, [userId, plannedAllocations]);

  const handleDecision = useCallback((optionIndex: number) => {
    applyDecision(optionIndex);
  }, [applyDecision]);

  const handleAutoSelect = useCallback(() => {
    if (!currentEvent) return;
    const autoIndex = getAutoSelectOptionIndex(currentEvent);
    applyDecision(autoIndex);
  }, [currentEvent, applyDecision]);

  const handleConfirmForced = useCallback(() => {
    applyDecision(0); // forced events only have forcedEffect, treated as option 0
  }, [applyDecision]);

  // After applying_effect, auto-advance to next event display or summary
  useEffect(() => {
    if (myPlayerState?.phase === "applying_effect") {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          const myState = prev.playerStates[userId];
          if (myState.phase !== "applying_effect") return prev;
          
          const nextEventIndex = myState.currentEventIndex + 1;
          
          if (myState.isEliminated) {
            return {
               ...prev,
               playerStates: { ...prev.playerStates, [userId]: { ...myState, currentEventIndex: nextEventIndex, phase: "game_over" } }
            };
          }
          
          if (nextEventIndex < myState.eventsForToday.length) {
            return {
               ...prev,
               playerStates: { ...prev.playerStates, [userId]: { ...myState, currentEventIndex: nextEventIndex, phase: "event_display" } }
            };
          }
          
          return {
             ...prev,
             playerStates: { ...prev.playerStates, [userId]: { ...myState, currentEventIndex: nextEventIndex, phase: "day_summary" } }
          };
        });
      }, 1200); // Wait 1.2s to show the animation
      return () => clearTimeout(timer);
    }
  }, [myPlayerState?.phase, userId]);

  // Auto advance from summary
  useEffect(() => {
    if (myPlayerState?.phase === "day_summary" || myPlayerState?.phase === "month_summary") {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return advanceDay(prev, new Set(recentEventIds.current));
        });
      }, 2500); // 2.5s summary
      return () => clearTimeout(timer);
    }
  }, [myPlayerState?.phase]);

  const proceedFromSummary = useCallback(() => {}, []);

  return {
    gameState,
    currentEvent,
    myPlayerState,
    phase: myPlayerState?.phase ?? null,
    gameResults,
    isGameOver,
    handleDecision,
    handleAutoSelect,
    handleConfirmForced,
    proceedFromSummary,
  };
}
