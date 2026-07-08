"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ref, onValue, update, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";
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
import { GameEvent, buildDayEvents, EVENT_POOL } from "../data/gameEvents";
import { GameConfig, GameRoom } from "../services/roomService";
import { CATEGORIES } from "../components/PlanningPhase";
import { CHARACTERS } from "../components/GameConfigForm";

export interface UseMultiplayerGameEngineProps {
  roomCode: string;
  userId: string;
  isHost: boolean;
  config: GameConfig;
  room: GameRoom;
}

export function useMultiplayerGameEngine({
  roomCode,
  userId,
  isHost,
  config,
  room,
}: UseMultiplayerGameEngineProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerState, setMyPlayerState] = useState<PlayerGameState | null>(null);
  const recentEventIds = useRef<string[]>([]);

  // 1. Host initializes game state if it doesn't exist
  useEffect(() => {
    if (!isHost) return;

    const gameStateRef = ref(rtdb, `gameRooms/${roomCode}/gameState`);
    
    // Check if game state exists first
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      if (!snapshot.exists()) {
        const categories = CATEGORIES[config.characterId] || [];
        const character = CHARACTERS.find((c) => c.id === config.characterId);
        const monthlyIncome = character?.income ?? 0;
        const playerIds = Object.keys(room.players || {});

        const initialState = initGameState({
          playerIds,
          characterId: config.characterId,
          categories,
          monthlyIncome,
          savingsGoal: config.savingsGoal,
          durationMonths: config.durationMonths,
          isMultiplayer: true,
        });

        // Clean any undefined values before sending to Firebase
        const cleanState = JSON.parse(JSON.stringify(initialState));

        set(gameStateRef, cleanState).catch((err) => {
          console.error("Firebase set error:", err);
        });
      }
    }, { onlyOnce: true });
    
  }, [isHost, roomCode, config, room.players]);

  // 2. Listen to game state from Firebase
  useEffect(() => {
    const gameStateRef = ref(rtdb, `gameRooms/${roomCode}/gameState`);
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      if (snapshot.exists()) {
        const state = snapshot.val() as GameState;
        
        // Firebase might drop empty arrays (like eventsForToday if it's empty), ensure default structure
        if (!state.playerStates) state.playerStates = {};
        if (!state.categories) state.categories = CATEGORIES[config.characterId] || [];
        
        // Handle maps where keys might be missing (e.g. actualSpending)
        Object.keys(state.playerStates).forEach(pid => {
          const ps = state.playerStates[pid];
          if (!ps.actualSpending) ps.actualSpending = {};
          if (!ps.eventsForToday || ps.eventsForToday.length === 0) {
            ps.eventsForToday = buildDayEvents(state.characterId || config.characterId, new Set(), true);
          }
          if (ps.currentEventIndex === undefined) ps.currentEventIndex = 0;
          if (!ps.phase) ps.phase = "event_display";
        });

        setGameState(state);
        if (state.playerStates[userId]) {
          setMyPlayerState(state.playerStates[userId]);
        }
      } else {
        setGameState(null);
        setMyPlayerState(null);
      }
    });

    return () => unsubscribe();
  }, [roomCode, userId, config.characterId]);
  const [lastDecidedKey, setLastDecidedKey] = useState<string | null>(null);

  // Derive the active event
  const pendingEvent = gameState?.pendingFriendRequest?.toPlayerId === userId
    ? Object.values(EVENT_POOL).flat().find(e => e.id === gameState.pendingFriendRequest?.eventId)
    : null;

  const currentEvent = myPlayerState
    ? myPlayerState.eventsForToday[myPlayerState.currentEventIndex] ?? null
    : null;
    
  const displayEvent = pendingEvent || currentEvent;
  const currentKey = pendingEvent 
    ? `pending_${pendingEvent.id}` 
    : `normal_${myPlayerState?.currentEventIndex}`;

  const phase = myPlayerState?.phase ?? null;
  const isGameOver = phase === "game_over";
  const gameResults = isGameOver && gameState ? getGameResults(gameState) : null;

  const decided = lastDecidedKey === currentKey;

  // 3. Apply decision and sync to Firebase
  const applyDecision = useCallback(
    async (optionIndex: number, friendTargetId?: string) => {
      if (!gameState || !myPlayerState || decided) return;
      
      const event = displayEvent;
      if (!event) return;

      const playerAllocations = room.playerAllocations?.[userId] || {};
      let updatedPlayerState = myPlayerState;
      let pendingFriendRequest = gameState.pendingFriendRequest;
      
      // Mark as decided locally immediately to prevent double clicks
      setLastDecidedKey(currentKey);

      // Handle Friend Interaction Event
      if (event.type === "friend_interaction" && event.friendInteraction) {
        if (friendTargetId) {
          // I am the initiator
          pendingFriendRequest = {
            fromPlayerId: userId,
            toPlayerId: friendTargetId,
            eventId: event.id,
            optionIndex: 0 // Ignored for initiator, we apply initiatorEffect
          };
          updatedPlayerState = applyOptionToPlayer(
            myPlayerState,
            event.friendInteraction.initiatorEffect,
            gameState.categories,
            gameState.savingsGoal,
            gameState.totalMonths,
            playerAllocations
          );
        } else if (pendingFriendRequest && pendingFriendRequest.toPlayerId === userId) {
          // I am the target and I'm responding
          if (optionIndex === 0) { // Accept
            updatedPlayerState = applyOptionToPlayer(
              myPlayerState,
              event.friendInteraction.targetAcceptEffect,
              gameState.categories,
              gameState.savingsGoal,
              gameState.totalMonths,
              playerAllocations
            );
          } else { // Decline
            updatedPlayerState = {
              ...updatedPlayerState,
              moneyIQ: {
                ...updatedPlayerState.moneyIQ,
                happinessScore: Math.max(0, updatedPlayerState.moneyIQ.happinessScore + event.friendInteraction.targetDeclineHappiness)
              }
            };
          }
          updatedPlayerState.isRespondingToFriend = true; // Flag for auto-advance logic
          // Do NOT clear pendingFriendRequest here, it must stay in Firebase so the UI keeps showing the event card
          // during the 1.2s applying_effect animation. We will clear it in the timer.
        } else if (optionIndex === -1) {
           // Skip inviting
        }
      } 
      // Handle Normal Choice or Forced Event
      else {
        const option = event.options?.[optionIndex] ?? event.forcedEffect;
        if (option) {
          updatedPlayerState = applyOptionToPlayer(
            myPlayerState,
            option,
            gameState.categories,
            gameState.savingsGoal,
            gameState.totalMonths,
            playerAllocations
          );
        }
      }

      // Check elimination
      const elimCheck = checkElimination(updatedPlayerState);
      if (elimCheck.eliminated) {
        updatedPlayerState = {
          ...updatedPlayerState,
          isEliminated: true,
          eliminationReason: elimCheck.reason,
        };
      }
      
      updatedPlayerState.phase = "applying_effect";

      // Track recent event globally for randomizer
      recentEventIds.current = [event.id, ...recentEventIds.current].slice(0, 20);

      const updates: Record<string, any> = {
        [`gameRooms/${roomCode}/gameState/playerStates/${userId}`]: updatedPlayerState,
        [`gameRooms/${roomCode}/gameState/decisions/${userId}/${event.id}`]: optionIndex
      };

      // Only update pending request if it changed
      if (pendingFriendRequest !== gameState.pendingFriendRequest) {
         updates[`gameRooms/${roomCode}/gameState/pendingFriendRequest`] = pendingFriendRequest || null;
      }

      // Sync player state and decision to Firebase
      await update(ref(rtdb), updates);
    },
    [gameState, myPlayerState, decided, displayEvent, currentKey, roomCode, userId, room.playerAllocations]
  );

  const handleDecision = useCallback((optionIndex: number) => {
    applyDecision(optionIndex);
  }, [applyDecision]);

  const handleAutoSelect = useCallback(() => {
    if (!displayEvent) return;
    
    if (gameState?.pendingFriendRequest?.toPlayerId === userId && 
        displayEvent.type === "friend_interaction") {
      applyDecision(1); // Default to decline for target
      return;
    }

    const autoIndex = getAutoSelectOptionIndex(displayEvent);
    applyDecision(autoIndex);
  }, [displayEvent, gameState?.pendingFriendRequest, userId, applyDecision]);

  const handleConfirmForced = useCallback(() => {
    applyDecision(0);
  }, [applyDecision]);

  const handleSelectFriendTarget = useCallback((targetId: string) => {
    applyDecision(0, targetId);
  }, [applyDecision]);

  // 4. Auto advance from applying_effect for current user
  useEffect(() => {
    if (myPlayerState?.phase === "applying_effect") {
      const timer = setTimeout(() => {
        if (!gameState) return;
        
        let updatedState = { ...myPlayerState };
        
        if (updatedState.isRespondingToFriend) {
          updatedState.isRespondingToFriend = false; // clear flag
          // Restore correct phase without advancing index
          if (updatedState.isEliminated) {
            updatedState.phase = "game_over";
          } else if (updatedState.currentEventIndex < updatedState.eventsForToday.length) {
            updatedState.phase = "event_display";
          } else {
            updatedState.phase = "day_summary";
          }

          // Clear the pending friend request now that animation is done
          update(ref(rtdb), {
            [`gameRooms/${roomCode}/gameState/playerStates/${userId}`]: updatedState,
            [`gameRooms/${roomCode}/gameState/pendingFriendRequest`]: null
          });
        } else {
          // Normal advance
          const nextEventIndex = updatedState.currentEventIndex + 1;
          
          if (updatedState.isEliminated) {
             updatedState.phase = "game_over";
          } else if (nextEventIndex < updatedState.eventsForToday.length) {
             updatedState.currentEventIndex = nextEventIndex;
             updatedState.phase = "event_display";
          } else {
             updatedState.phase = "day_summary";
          }

          update(ref(rtdb), {
            [`gameRooms/${roomCode}/gameState/playerStates/${userId}`]: updatedState
          });
        }
      }, 1200); // Wait 1.2s to show effect
      
      return () => clearTimeout(timer);
    }
  }, [myPlayerState?.phase, userId, roomCode, gameState]);

  // 5. Host logic: check if all active players are ready for next day or game over
  useEffect(() => {
    if (!isHost || !gameState || isGameOver) return;
    
    const activePlayers = Object.values(gameState.playerStates).filter(p => !p.isEliminated);
    
    // Check if game is over (all eliminated or 1 winner left)
    const playersCount = Object.keys(room.players || {}).length;
    const isGameOverState = (playersCount > 1 && activePlayers.length <= 1) || activePlayers.length === 0;
    
    if (isGameOverState) {
       // if not already game over for everyone
       const anyNotGameOver = Object.values(gameState.playerStates).some(p => p.phase !== "game_over");
       if (anyNotGameOver) {
          const nextState = { ...gameState };
          Object.keys(nextState.playerStates).forEach(id => {
             nextState.playerStates[id].phase = "game_over";
          });
          set(ref(rtdb, `gameRooms/${roomCode}/gameState`), nextState);
       }
       return;
    }

    // Check if all active players are at day_summary
    const allAtSummary = activePlayers.length > 0 && activePlayers.every(p => p.phase === "day_summary" || p.phase === "month_summary");
    
    if (allAtSummary) {
       const timer = setTimeout(() => {
          const nextState = advanceDay(gameState, new Set(recentEventIds.current));
          nextState.decisions = {}; // reset decisions
          set(ref(rtdb, `gameRooms/${roomCode}/gameState`), nextState);
       }, 2500); // Wait 2.5s to read the summary before advancing
       
       return () => clearTimeout(timer);
    }
  }, [isHost, gameState, roomCode, room.players, isGameOver]);

  const proceedFromSummary = useCallback(() => {
    // Deprecated, auto-advanced by host timeout
  }, []);

  return {
    gameState,
    currentEvent,
    myPlayerState,
    phase,
    gameResults,
    isGameOver,
    decided,
    handleDecision,
    handleAutoSelect,
    handleConfirmForced,
    handleSelectFriendTarget,
    proceedFromSummary,
    isHost
  };
}
