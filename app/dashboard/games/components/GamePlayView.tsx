import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRoom } from "../hooks/useGameRoom";
import { useMediaStream } from "../hooks/useMediaStream";
import { useWebRTC } from "../hooks/useWebRTC";
import { leaveRoom, submitGameConfig, startGame, savePlayerAllocations, GameConfig } from "../services/roomService";
import { motion } from "framer-motion";
import GameConfigForm from "./GameConfigForm";
import PlanningPhase from "./PlanningPhase";
import MoneyIQBoard from "./MoneyIQBoard";
import BudgetTracker from "./BudgetTracker";
import { CHARACTERS } from "./GameConfigForm";
import { CATEGORIES } from "./PlanningPhase";
import MultiplayerActiveGame from "./MultiplayerActiveGame";

interface GamePlayViewProps {
  roomCode: string;
  onLeave: () => void;
}

export default function GamePlayView({ roomCode, onLeave }: GamePlayViewProps) {
  const { user } = useAuth();
  const { room, error, isKicked } = useGameRoom(roomCode);
  const { localStream, isCameraOn, isMicOn, toggleCamera, toggleMic } = useMediaStream(roomCode, user?.uid);
  const { remoteStreams, cleanupWebRTC } = useWebRTC(room, localStream);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localAllocations, setLocalAllocations] = useState<Record<string, number>>({});

  // Bind local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      // Force the video element to refresh when the camera toggles
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraOn]);

  // Handle kicked/deleted room
  useEffect(() => {
    if (isKicked || error || !room) {
      cleanupWebRTC();
    }
  }, [isKicked, error, room, cleanupWebRTC]);

  if (isKicked || error || !room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-center p-8">
        <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center text-error mb-4">
          <span className="material-symbols-outlined text-[32px]">block</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Đã rời phòng</h2>
        <p className="text-on-surface-variant mb-6">{error || "Phòng chơi đã kết thúc."}</p>
        <button 
          onClick={onLeave}
          className="px-6 py-2 bg-surface-container text-on-surface rounded-full font-bold hover:bg-surface-container-high transition-colors"
        >
          Đóng
        </button>
      </div>
    );
  }

  const handleManualLeave = async () => {
    if (user) {
      try {
        cleanupWebRTC();
        await leaveRoom(roomCode, user.uid);
        onLeave();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfigSubmit = async (config: GameConfig) => {
    if (user && room.hostId === user.uid) {
      try {
        await submitGameConfig(roomCode, user.uid, config);
      } catch (err) {
        console.error("Failed to submit config:", err);
      }
    }
  };

  const handlePlanningTimeUp = async (allocations?: Record<string, number>) => {
    // Always save this player's allocations to Firebase
    if (user && allocations) {
      try {
        setLocalAllocations(allocations);
        await savePlayerAllocations(roomCode, user.uid, allocations);
      } catch (err) {
        console.error("Failed to save allocations:", err);
      }
    }
    // Host also advances the game state
    if (user && room.hostId === user.uid) {
      try {
        await startGame(roomCode, user.uid);
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    }
  };

  // Get up to 4 players including local user
  const players = Object.entries(room.players || {}).map(([id, player]) => ({
    id,
    ...player
  })).sort((a, b) => a.joinedAt - b.joinedAt);

  // Ensure local player is always in one of the specific slots (e.g. bottom right)
  // For simplicity, we just lay them out in order: 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
  const layoutClasses = [
    "top-4 left-4 flex-row", // top-left
    "top-4 right-4 flex-row-reverse", // top-right
    "bottom-4 left-4 flex-row", // bottom-left
    "bottom-4 right-4 flex-row-reverse", // bottom-right
  ];

  return (
    <div className="flex-1 w-full h-full bg-background relative overflow-hidden flex flex-col pt-4 pb-4" style={{ width: '100%', minWidth: 0 }}>
      {/* Central Content Area */}
      {room.status === "configuring" && (
        <GameConfigForm 
          isHost={room.hostId === user?.uid} 
          onSubmit={handleConfigSubmit} 
        />
      )}
      
      {room.status === "planning" && room.config && (
        <div className="flex-1 w-full h-full p-4 md:p-8 z-0 relative">
          <PlanningPhase 
            config={room.config} 
            planningEndTime={room.planningEndTime}
            onTimeUp={handlePlanningTimeUp}
            isHost={room.hostId === user?.uid}
            onSkip={handlePlanningTimeUp}
          />
        </div>
      )}

      {room.status === "playing" && room.config && (
        <MultiplayerActiveGame
          roomCode={roomCode}
          userId={user?.uid ?? ""}
          isHost={room.hostId === user?.uid}
          config={room.config}
          room={room}
          localAllocations={localAllocations}
          onExit={handleManualLeave}
          localStream={localStream}
          remoteStreams={remoteStreams}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
        />
      )}
    </div>
  );
}
