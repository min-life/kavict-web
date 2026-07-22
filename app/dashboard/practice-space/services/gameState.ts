// ============================================================
// KAVICT Game State Engine
// Pure functions — no side effects, no Firebase
// ============================================================

import { GameEvent, EventOption, buildDayEvents } from "../data/gameEvents";
import { MoneyIQStats } from "../components/MoneyIQBoard";

export interface PlayerGameState {
  balance: number;
  initialBalance: number;                   // Starting balance (monthly income)
  actualSpending: Record<string, number>;   // category -> total spent this game
  moneyIQ: MoneyIQStats;
  isEliminated: boolean;
  eliminationReason?: string;
  dayEventsDone: boolean;                   // Has this player finished today's events?
  eventsForToday: GameEvent[];
  currentEventIndex: number;
  phase: GamePhase;
  isRespondingToFriend?: boolean; // True when currently processing a friend request response
}

export type GamePhase =
  | "event_display"          // Showing event card
  | "waiting_decision"       // Player must decide (timer running)
  | "applying_effect"        // Showing result of decision
  | "waiting_friend_response"// Waiting for target player to respond (multiplayer)
  | "day_summary"            // Day finished, showing summary
  | "month_summary"          // Month over, showing monthly recap
  | "game_over";             // Game ended

export interface PendingFriendRequest {
  fromPlayerId: string;
  toPlayerId: string;
  eventId: string;
  optionIndex: number; // which option the initiator chose to send
}

export interface GameState {
  currentMonth: number;        // 1-based
  currentDay: number;          // 1-based (1-30)
  totalMonths: number;
  playerStates: Record<string, PlayerGameState>;
  pendingFriendRequest?: PendingFriendRequest;
  characterId: string;
  categories: string[];        // Full category list for this character
  savingsGoal: number;         // Monthly savings goal
  monthlyIncome: number;       // Monthly income
  isMultiplayer: boolean;
  decisions?: Record<string, Record<string, number>>; // { playerId: { eventId: optionIndex } }
}

// ============================================================
// INIT
// ============================================================
export function initGameState(params: {
  playerIds: string[];
  characterId: string;
  categories: string[];
  monthlyIncome: number;
  savingsGoal: number;
  durationMonths: number;
  isMultiplayer: boolean;
}): GameState {
  const { playerIds, characterId, categories, monthlyIncome, savingsGoal, durationMonths, isMultiplayer } = params;

  const playerStates: Record<string, PlayerGameState> = {};
  for (const id of playerIds) {
    playerStates[id] = createInitialPlayerState(monthlyIncome, categories, characterId, isMultiplayer);
  }

  return {
    currentMonth: 1,
    currentDay: 1,
    totalMonths: durationMonths,
    playerStates,
    characterId,
    categories,
    savingsGoal,
    monthlyIncome,
    isMultiplayer,
  };
}

function createInitialPlayerState(
  monthlyIncome: number,
  categories: string[],
  characterId: string,
  isMultiplayer: boolean
): PlayerGameState {
  return {
    balance: monthlyIncome,
    initialBalance: monthlyIncome,
    actualSpending: Object.fromEntries(categories.map((c) => [c, 0])),
    moneyIQ: {
      savingsScore: 0,
      intelligenceScore: 50,
      happinessScore: 50,
      disciplineScore: 100,
    },
    isEliminated: false,
    dayEventsDone: false,
    eventsForToday: buildDayEvents(characterId, new Set(), isMultiplayer),
    currentEventIndex: 0,
    phase: "event_display",
  };
}

// ============================================================
// MONEY IQ CALCULATIONS
// ============================================================
export function recalculateMoneyIQ(
  player: PlayerGameState,
  savingsGoal: number,
  totalMonths: number,
  categories: string[],
  plannedAllocations: Record<string, number>
): MoneyIQStats {
  // Tiết kiệm: current balance / total savings goal * 100
  const totalSavingsGoal = savingsGoal * totalMonths;
  const savingsScore = totalSavingsGoal > 0
    ? Math.min(100, Math.max(0, Math.round((player.balance / totalSavingsGoal) * 100)))
    : 0;

  // Kỷ luật: (1 - overBudgetCategories / totalCategories) * 100
  const overBudgetCategories = categories.filter((cat) => {
    const planned = plannedAllocations[cat] ?? 0;
    const actual = player.actualSpending[cat] ?? 0;
    return planned > 0 && actual > planned;
  }).length;
  const disciplineScore = Math.max(0, Math.min(100,
    Math.round((1 - overBudgetCategories / Math.max(1, categories.length)) * 100)
  ));

  return {
    savingsScore,
    intelligenceScore: clamp(player.moneyIQ.intelligenceScore, 0, 100),
    happinessScore: clamp(player.moneyIQ.happinessScore, 0, 100),
    disciplineScore,
  };
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ============================================================
// AUTO-SELECT when timer expires
// Pick option with lowest absolute cost; ties go to option[0]
// ============================================================
export function getAutoSelectOptionIndex(event: GameEvent): number {
  if (!event.options) return 0;
  const [a, b] = event.options;
  return Math.abs(a.cost) <= Math.abs(b.cost) ? 0 : 1;
}

// ============================================================
// APPLY DECISION
// Returns updated PlayerGameState after applying option effects
// ============================================================
export function applyOptionToPlayer(
  player: PlayerGameState,
  option: EventOption,
  categories: string[],
  savingsGoal: number,
  totalMonths: number,
  plannedAllocations: Record<string, number>
): PlayerGameState {
  const newBalance = Math.max(0, player.balance - option.cost);

  const newSpending = { ...player.actualSpending };
  if (option.category && option.cost > 0) {
    newSpending[option.category] = (newSpending[option.category] ?? 0) + option.cost;
  }

  const newMoneyIQ = {
    ...player.moneyIQ,
    intelligenceScore: clamp(player.moneyIQ.intelligenceScore + option.intelligenceChange, 0, 100),
    happinessScore: clamp(player.moneyIQ.happinessScore + option.happinessChange, 0, 100),
  };

  const updated: PlayerGameState = {
    ...player,
    balance: newBalance,
    actualSpending: newSpending,
    moneyIQ: newMoneyIQ,
  };

  // Recalculate savings & discipline scores
  updated.moneyIQ = recalculateMoneyIQ(updated, savingsGoal, totalMonths, categories, plannedAllocations);

  return updated;
}

// ============================================================
// ELIMINATION CHECK
// ============================================================
export function checkElimination(player: PlayerGameState): {
  eliminated: boolean;
  reason?: string;
} {
  if (player.balance <= 0) {
    return { eliminated: true, reason: "Hết tiền! Số dư về 0." };
  }
  if (player.moneyIQ.happinessScore <= 0) {
    return { eliminated: true, reason: "Hạnh phúc về 0! Bạn đã từ bỏ." };
  }
  if (player.moneyIQ.disciplineScore <= 0) {
    return { eliminated: true, reason: "Kỷ luật về 0! Chi tiêu hoàn toàn mất kiểm soát." };
  }
  if (player.moneyIQ.savingsScore <= 0 && player.balance <= 0) {
    return { eliminated: true, reason: "Không còn tiết kiệm và hết tiền." };
  }
  return { eliminated: false };
}

// ============================================================
// ADVANCE DAY
// ============================================================
export function advanceDay(
  state: GameState,
  recentEventIds: Set<string>
): GameState {
  const nextDay = state.currentDay + 1;

  if (nextDay > 30) {
    // Month over
    return advanceMonth(state, recentEventIds);
  }

  // Reset dayEventsDone for all players and build new events
  const playerStates = { ...state.playerStates };
  for (const id of Object.keys(playerStates)) {
    if (!playerStates[id].isEliminated) {
      playerStates[id] = { 
        ...playerStates[id], 
        dayEventsDone: false,
        eventsForToday: buildDayEvents(state.characterId, recentEventIds, state.isMultiplayer),
        currentEventIndex: 0,
        phase: "event_display",
      };
    }
  }

  return {
    ...state,
    currentDay: nextDay,
    playerStates,
  };
}

// ============================================================
// ADVANCE MONTH
// Cộng lương đầu tháng mới (forced income event)
// ============================================================
export function advanceMonth(
  state: GameState,
  recentEventIds: Set<string>
): GameState {
  const nextMonth = state.currentMonth + 1;

  const playerStates = { ...state.playerStates };
  for (const id of Object.keys(playerStates)) {
    if (!playerStates[id].isEliminated) {
      playerStates[id] = {
        ...playerStates[id],
        balance: playerStates[id].balance + state.monthlyIncome,
        dayEventsDone: false,
        eventsForToday: buildDayEvents(state.characterId, recentEventIds, state.isMultiplayer),
        currentEventIndex: 0,
        phase: nextMonth > state.totalMonths ? "game_over" : "event_display",
      };
    } else {
      if (nextMonth > state.totalMonths) {
        playerStates[id] = { ...playerStates[id], phase: "game_over" };
      }
    }
  }

  return {
    ...state,
    currentMonth: nextMonth,
    currentDay: 1,
    playerStates,
  };
}

// ============================================================
// FINAL SCORE
// MoneyIQ = tiết kiệm*0.3 + thông minh*0.2 + hạnh phúc*0.2 + kỷ luật*0.3
// ============================================================
export function calculateFinalScore(moneyIQ: MoneyIQStats): number {
  return Math.round(
    moneyIQ.savingsScore * 0.3 +
    moneyIQ.intelligenceScore * 0.2 +
    moneyIQ.happinessScore * 0.2 +
    moneyIQ.disciplineScore * 0.3
  );
}

export interface GameResult {
  playerId: string;
  moneyIQ: MoneyIQStats;
  finalScore: number;
  finalBalance: number;
  isEliminated: boolean;
  eliminationReason?: string;
  rank: number;
}

export function getGameResults(state: GameState): GameResult[] {
  const results: GameResult[] = Object.entries(state.playerStates).map(
    ([playerId, ps]) => ({
      playerId,
      moneyIQ: ps.moneyIQ,
      finalScore: calculateFinalScore(ps.moneyIQ),
      finalBalance: ps.balance,
      isEliminated: ps.isEliminated,
      eliminationReason: ps.eliminationReason,
      rank: 0,
    })
  );

  // Sort: active players by score desc, eliminated players last
  results.sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.finalScore - a.finalScore;
  });

  results.forEach((r, i) => { r.rank = i + 1; });
  return results;
}
