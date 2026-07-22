"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateRoomView from "./CreateRoomView";
import JoinRoomView from "./JoinRoomView";
import WaitingRoom from "./WaitingRoom";
import GamePlayView from "./GamePlayView";
import { useAuth } from "@/features/auth/AuthProvider";
import { joinRoom } from "../services/roomService";

type ViewState = "selection" | "create" | "join" | "waiting" | "playing";

interface MultiplayerModalProps {
  onClose: () => void;
}

export default function MultiplayerModal({ onClose }: MultiplayerModalProps) {
  const [currentView, setCurrentView] = useState<ViewState>("selection");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const savedRoomCode = sessionStorage.getItem("kavict_game_room");
    if (savedRoomCode && user) {
      setRoomCode(savedRoomCode);
      setCurrentView("waiting");
      // Re-join the room in Firebase to ensure the player object exists
      // after a disconnect/refresh.
      joinRoom(savedRoomCode, user.uid, user.displayName || "Người dùng").catch(err => {
        console.error("Failed to rejoin room:", err);
        sessionStorage.removeItem("kavict_game_room");
        setRoomCode(null);
        setCurrentView("selection");
      });
    }
  }, [user]);

  const handleRoomCreated = (code: string) => {
    sessionStorage.setItem("kavict_game_room", code);
    setRoomCode(code);
    setCurrentView("waiting");
  };

  const handleRoomJoined = (code: string) => {
    sessionStorage.setItem("kavict_game_room", code);
    setRoomCode(code);
    setCurrentView("waiting");
  };

  const handleStartGame = () => {
    setCurrentView("playing");
  };

  const handleLeaveRoom = () => {
    sessionStorage.removeItem("kavict_game_room");
    setRoomCode(null);
    setCurrentView("selection");
  };

  // If we are playing, the modal should expand to take up more space or act differently.
  // Actually, playing view shouldn't look like a modal but rather a full-screen view.
  if (currentView === "playing") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <GamePlayView 
          roomCode={roomCode!} 
          onLeave={() => {
            handleLeaveRoom(); // Clear session and return to selection
          }} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden w-full max-w-[450px] relative"
      >
        {/* Top decoration */}
        <div className="h-2 bg-gradient-to-r from-tertiary to-primary w-full"></div>
        
        {/* Close Button - Only show if not in waiting room (they should use the leave button there) */}
        {currentView !== "waiting" && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors z-10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}

        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentView === "selection" && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col text-center"
              >
                <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary mx-auto mb-6">
                  <span className="material-symbols-outlined text-[32px]">group</span>
                </div>
                
                <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Chơi cùng bạn bè</h2>
                <p className="text-on-surface-variant mb-8">
                  Tạo phòng mới hoặc nhập mã để vào phòng đã có.
                </p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => setCurrentView("create")}
                    className="w-full py-4 bg-tertiary text-on-tertiary rounded-xl font-bold hover:bg-tertiary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                    Tạo phòng mới
                  </button>
                  
                  <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                    <div className="flex-1 h-px bg-surface-variant"></div>
                    <span>hoặc</span>
                    <div className="flex-1 h-px bg-surface-variant"></div>
                  </div>

                  <button 
                    onClick={() => setCurrentView("join")}
                    className="w-full py-4 bg-surface text-on-surface border border-outline-variant rounded-xl font-bold hover:bg-surface-container transition-colors flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">login</span>
                    Vào phòng đã có
                  </button>
                </div>
              </motion.div>
            )}

            {currentView === "create" && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CreateRoomView 
                  onBack={() => setCurrentView("selection")} 
                  onCreated={handleRoomCreated} 
                />
              </motion.div>
            )}

            {currentView === "join" && (
              <motion.div 
                key="join"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <JoinRoomView 
                  onBack={() => setCurrentView("selection")} 
                  onJoined={handleRoomJoined} 
                />
              </motion.div>
            )}

            {currentView === "waiting" && (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <WaitingRoom 
                  roomCode={roomCode!} 
                  onLeave={handleLeaveRoom}
                  onStartGame={handleStartGame}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
