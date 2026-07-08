import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRoom } from "../hooks/useGameRoom";
import { kickPlayer, startGame, leaveRoom, configureGame } from "../services/roomService";
import { motion, AnimatePresence } from "framer-motion";

interface WaitingRoomProps {
  roomCode: string;
  onLeave: () => void;
  onStartGame: () => void;
}

export default function WaitingRoom({ roomCode, onLeave, onStartGame }: WaitingRoomProps) {
  const { user } = useAuth();
  const { room, isHost, error, isKicked } = useGameRoom(roomCode);
  const [copied, setCopied] = useState(false);

  // Auto trigger onStartGame when status is no longer waiting
  useEffect(() => {
    if (room && room.status !== "waiting") {
      onStartGame();
    }
  }, [room?.status, onStartGame]);

  // Handle kicked state
  if (isKicked || error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center text-error mb-4">
          <span className="material-symbols-outlined text-[32px]">block</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Đã rời phòng</h2>
        <p className="text-on-surface-variant mb-6">{error || "Bạn không còn ở trong phòng này."}</p>
        <button 
          onClick={onLeave}
          className="px-6 py-2 bg-surface-container text-on-surface rounded-full font-bold hover:bg-surface-container-high transition-colors"
        >
          Đóng
        </button>
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const players = Object.entries(room.players || {}).map(([id, player]) => ({
    id,
    ...player
  })).sort((a, b) => a.joinedAt - b.joinedAt);

  const playerCount = players.length;
  const maxPlayers = room.maxPlayers || 4;
  const canStart = isHost && playerCount >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKick = async (targetId: string) => {
    if (isHost && targetId !== user.uid) {
      try {
        await kickPlayer(roomCode, user.uid, targetId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStart = async () => {
    if (canStart) {
      try {
        await configureGame(roomCode, user.uid);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleManualLeave = async () => {
    try {
      await leaveRoom(roomCode, user.uid);
      onLeave();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center mb-8 bg-surface-container-low p-6 rounded-2xl border border-surface-variant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
        
        <p className="text-sm font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Mã phòng của bạn</p>
        
        <div className="flex items-center gap-3">
          <div className="text-[40px] font-display font-bold text-primary tracking-[0.2em] ml-2">
            {roomCode}
          </div>
          <button 
            onClick={handleCopyCode}
            className="w-10 h-10 rounded-full bg-surface hover:bg-surface-container flex items-center justify-center text-primary transition-colors border border-outline-variant shadow-sm relative group"
          >
            <span className="material-symbols-outlined text-[20px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <div className="absolute -top-10 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {copied ? 'Đã chép' : 'Sao chép mã'}
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <h3 className="font-bold text-on-surface">Người chơi</h3>
        <span className="text-sm font-medium bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant">
          {playerCount} / {maxPlayers}
        </span>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-variant overflow-hidden mb-6 flex-grow min-h-[200px]">
        <ul className="divide-y divide-surface-variant">
          <AnimatePresence>
            {players.map((player) => {
              const isMe = player.id === user.uid;
              const isPlayerHost = player.id === room.hostId;
              
              return (
                <motion.li 
                  key={player.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center justify-between p-4 ${isMe ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isPlayerHost ? 'bg-tertiary text-on-tertiary' : 'bg-secondary-container text-on-secondary-container'}`}>
                      {player.avatarLetter}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-medium ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                        {player.name} {isMe && "(Bạn)"}
                      </span>
                      <div className="flex gap-2 items-center">
                        {isPlayerHost && (
                          <span className="text-xs text-tertiary font-medium">Chủ phòng</span>
                        )}
                        {player.isOnline === false && (
                          <span className="text-xs text-error font-medium bg-error-container px-1.5 py-0.5 rounded">Mất kết nối</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isHost && !isMe && (
                    <button 
                      onClick={() => handleKick(player.id)}
                      className="text-error hover:bg-error-container p-2 rounded-full transition-colors flex items-center justify-center w-8 h-8"
                      title="Đuổi khỏi phòng"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_remove</span>
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
          
          {/* Empty slots placeholders */}
          {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
            <li key={`empty-${i}`} className="flex items-center p-4 opacity-50">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-outline-variant">person</span>
              </div>
              <span className="ml-3 text-on-surface-variant italic">Đang đợi...</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleManualLeave}
          className="flex-1 py-3 bg-surface-container text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-colors border border-outline-variant"
        >
          Thoát
        </button>
        
        {isHost ? (
          <button 
            onClick={handleStart}
            disabled={!canStart}
            className="flex-[2] py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bắt đầu <span className="material-symbols-outlined">play_arrow</span>
          </button>
        ) : (
          <div className="flex-[2] py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-medium flex items-center justify-center gap-2 italic">
            Đợi chủ phòng bắt đầu...
          </div>
        )}
      </div>
    </div>
  );
}
