"use client";

import { useMultiplayerGameEngine } from "../hooks/useMultiplayerGameEngine";
import type { GameRoom, GameConfig, Player } from "../services/roomService";
import DayHeader from "./DayHeader";
import EventCard from "./EventCard";
import GameOverScreen from "./GameOverScreen";
import MoneyIQBoard from "./MoneyIQBoard";
import BudgetTracker from "./BudgetTracker";
import { motion, AnimatePresence } from "framer-motion";
import { CHARACTERS } from "./GameConfigForm";
import { CATEGORIES } from "./PlanningPhase";
import { EVENT_POOL, EventOption } from "../data/gameEvents";
import { useEffect, useRef } from "react";

interface MultiplayerActiveGameProps {
  roomCode: string;
  userId: string;
  isHost: boolean;
  config: GameConfig;
  room: GameRoom;
  localAllocations: Record<string, number>;
  onExit: () => void;
  // Media streams
  localStream?: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMicOn: boolean;
  isCameraOn: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
}

export default function MultiplayerActiveGame({
  roomCode,
  userId,
  isHost,
  config,
  room,
  localAllocations,
  onExit,
  localStream,
  remoteStreams,
  isMicOn,
  isCameraOn,
  toggleMic,
  toggleCamera,
}: MultiplayerActiveGameProps) {
  const {
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
  } = useMultiplayerGameEngine({ roomCode, userId, isHost, config, room });

  // Players array
  const players = Object.entries(room.players || {}).map(([id, player]) => ({
    id,
    ...player
  })).sort((a, b) => a.joinedAt - b.joinedAt);

  const character = CHARACTERS.find(c => c.id === config.characterId);
  const categories = CATEGORIES[config.characterId] || [];

  const pendingEventRaw = gameState?.pendingFriendRequest?.toPlayerId === userId
    ? Object.values(EVENT_POOL).flat().find(e => e.id === gameState.pendingFriendRequest?.eventId)
    : null;

  const pendingEvent = pendingEventRaw ? {
    ...pendingEventRaw,
    title: `${players.find(p => p.id === gameState!.pendingFriendRequest!.fromPlayerId)?.name || 'Ai đó'} rủ bạn`,
    description: pendingEventRaw.description + " Bạn có đồng ý không?",
    type: "choice" as const,
    options: [
      pendingEventRaw.friendInteraction!.targetAcceptEffect,
      {
         label: "Từ chối",
         cost: 0,
         happinessChange: pendingEventRaw.friendInteraction!.targetDeclineHappiness,
         intelligenceChange: 0
      }
    ] as [EventOption, EventOption]
  } : null;

  const displayEvent = pendingEvent || currentEvent;

  if (!gameState || !myPlayerState) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 relative">
        <button
          onClick={onExit}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 text-error bg-surface hover:bg-error/10 px-4 py-2 rounded-full font-bold shadow-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Thoát
        </button>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4" />
        <p className="text-on-surface-variant font-medium">Đang đồng bộ dữ liệu...</p>
        <div className="mt-4 text-xs font-mono text-left bg-surface-variant p-4 rounded-xl w-full max-w-sm overflow-auto text-on-surface">
          <p>Debug Info:</p>
          <p>gameState: {gameState ? "✓" : "null"}</p>
          <p>myPlayerState: {myPlayerState ? "✓" : "null"}</p>
          <p>isHost: {isHost ? "✓" : "✗"}</p>
          <p>userId: {userId}</p>
          <p>hostId: {room.hostId}</p>
          <p>players in room: {Object.keys(room.players || {}).join(", ")}</p>
          <p>players in state: {gameState ? Object.keys(gameState.playerStates || {}).join(", ") : "N/A"}</p>
        </div>
      </div>
    );
  }

  const myAllocations = room.playerAllocations?.[userId] || localAllocations;

  const layoutClasses = [
    "top-4 left-4 flex-row", // top-left
    "top-4 right-4 flex-row-reverse", // top-right
    "bottom-4 left-4 flex-row", // bottom-left
    "bottom-4 right-4 flex-row-reverse", // bottom-right
  ];

  const renderPlayer = (player: (Player & { id: string }) | undefined, layout: 'flex-row' | 'flex-row-reverse') => {
    if (!player) return null;
    const isMe = player.id === userId;
    const stream = isMe ? localStream : remoteStreams.get(player.id);
    const pState = gameState.playerStates[player.id];
    
    return (
      <motion.div
        key={player.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex ${layout} gap-2 z-10 shrink-0`}
      >
        <div className="flex flex-col gap-2 shrink-0">
          {/* Camera Block */}
          <div className="w-48 h-36 bg-surface-container-highest rounded-2xl overflow-hidden shadow-lg border border-surface-variant flex flex-col group relative shrink-0">
            <div className="flex-1 bg-black relative flex items-center justify-center">
              {isMe ? (
                <div className="absolute inset-0 bg-surface-variant overflow-hidden rounded-xl">
                  <video 
                    ref={(el) => { if (el && stream) el.srcObject = stream; }} 
                    autoPlay playsInline muted 
                    className={`w-full h-full object-cover ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} 
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-tertiary-container text-on-tertiary-container text-[40px] font-bold">
                      {player.avatarLetter}
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 bg-surface-variant overflow-hidden rounded-xl">
                  <RemoteVideo stream={stream || undefined} avatarLetter={player.avatarLetter} isCameraOn={player.isCameraOn ?? false} />
                </div>
              )}  
            </div>
            
            {/* Name badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm max-w-[90%] truncate z-10">
              {player.name} {isMe && "(Bạn)"}
            </div>

            {/* Status Icons */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              {isMe && !isMicOn && (
                <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center text-on-error shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">mic_off</span>
                </div>
              )}
            </div>
          
            {pState?.isEliminated && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 p-1">
                <span className="text-error font-bold text-sm sm:text-lg bg-black/50 px-2 py-1 rounded text-center whitespace-normal leading-tight">BỊ LOẠI</span>
              </div>
            )}
          
            {/* Local Controls (only for the current user) */}
            {isMe && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                <button 
                  onClick={toggleMic}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isMicOn ? 'bg-surface text-on-surface' : 'bg-error text-on-error'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{isMicOn ? 'mic' : 'mic_off'}</span>
                </button>
                <button 
                  onClick={toggleCamera}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isCameraOn ? 'bg-surface text-on-surface' : 'bg-error text-on-error'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{isCameraOn ? 'videocam' : 'videocam_off'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Exit Button - only for current user */}
          {isMe && (
            <button 
              onClick={onExit}
              className="w-full px-4 py-2 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Thoát phòng
            </button>
          )}
        </div>

        {/* Money IQ Board and Budget for this player */}
        {pState && (
          <div className="flex flex-col gap-2">
            <MoneyIQBoard stats={pState.moneyIQ} layout="horizontal" />
            {isMe && (
              <div className="w-72 mt-2">
                <BudgetTracker
                  allCategories={categories}
                  plannedAllocations={myAllocations}
                  actualSpending={myPlayerState.actualSpending}
                  totalAssets={myPlayerState.balance}
                  compact
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface overflow-hidden pt-4">
      {/* Row: 3 columns — fills remaining height */}
      <div className="flex-1 flex flex-row gap-4 px-4 pb-4 min-h-0">
        {/* LEFT COLUMN: Player 1 and Player 3 */}
        <div className="flex flex-col justify-between shrink-0 gap-4 overflow-y-auto pr-2 pb-4">
          {renderPlayer(players[0], "flex-row")}
          {renderPlayer(players[2], "flex-row")}
        </div>

        {/* CENTER COLUMN: Game play area */}
        <div className="flex-1 flex flex-col items-center justify-start min-w-0 max-w-[600px] mx-auto overflow-y-auto custom-scrollbar pb-4 px-2 sm:px-4">
          <div className="w-full mb-4 shrink-0 px-2 pt-2">
            <DayHeader
              currentMonth={gameState.currentMonth}
              currentDay={gameState.currentDay}
              totalMonths={gameState.totalMonths}
              currentEventIndex={myPlayerState.currentEventIndex}
              totalEventsToday={myPlayerState.eventsForToday.length}
            />
          </div>

          <AnimatePresence mode="wait">
            {(pendingEvent || ((phase === "event_display" || phase === "waiting_friend_response" || phase === "applying_effect") && currentEvent)) && displayEvent && (
              <EventCard
                key={`${displayEvent.id}-${config.decisionTimeSeconds}${pendingEvent ? "-pending" : ""}`}
                event={displayEvent}
                decisionTimeSeconds={config.decisionTimeSeconds}
                onDecide={handleDecision}
                onConfirmForced={handleConfirmForced}
                onAutoSelect={handleAutoSelect}
                isMultiplayer={true}
                players={players}
                myPlayerId={userId}
                onSelectFriendTarget={handleSelectFriendTarget}
              />
            )}

            {!pendingEvent && phase === "waiting_friend_response" && currentEvent?.type === "friend_interaction" && (
               <motion.div
                 key="waiting_friend"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="mt-4 p-3 bg-surface-variant rounded-xl text-center text-on-surface text-sm w-full font-medium"
               >
                 Đang chờ phản hồi...
               </motion.div>
            )}

            {!pendingEvent && phase === "day_summary" && (
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
                    Chờ những người chơi khác hoàn tất...
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
                  playerNames={Object.fromEntries(players.map(p => [p.id, p.id === userId ? `${p.name} (Bạn)` : p.name]))}
                  onPlayAgain={onExit}
                  onExit={onExit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show waiting indicator if we decided but others haven't */}
          {decided && (phase === "event_display" || phase === "applying_effect") && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="mt-6 text-on-surface-variant text-sm font-medium flex items-center gap-2 bg-surface-variant/50 px-4 py-2 rounded-full"
             >
               <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
               Đợi người khác...
             </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: Player 2 and Player 4 */}
        <div className="flex flex-col justify-between shrink-0 gap-4 items-end overflow-y-auto pl-2 pb-4">
          {renderPlayer(players[1], "flex-row-reverse")}
          {renderPlayer(players[3], "flex-row-reverse")}
        </div>
      </div>
    </div>
  );
}

// Separate component for remote video to handle its own ref
function RemoteVideo({ stream, avatarLetter, isCameraOn }: { stream?: MediaStream; avatarLetter: string; isCameraOn: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      // Force refresh
      videoRef.current.srcObject = null;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Auto-play prevented:", e));
    }
  }, [stream]);

  return (
    <>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} 
      />
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-tertiary-container text-on-tertiary-container text-[40px] font-bold">
          {avatarLetter}
        </div>
      )}
    </>
  );
}
