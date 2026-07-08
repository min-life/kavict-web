import { ref, set, get, update, remove, onValue, onDisconnect, child, push, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export type RoomStatus = "waiting" | "configuring" | "planning" | "playing" | "finished";

export interface GameConfig {
  characterId: string;
  savingsGoal: number;
  durationMonths: number;
  decisionTimeSeconds: number;
  planningTimeSeconds: number;
}

export interface Player {
  name: string;
  avatarLetter: string;
  joinedAt: number;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  isOnline?: boolean;
}

export interface GameRoom {
  code: string;
  hostId: string;
  status: RoomStatus;
  createdAt: number;
  maxPlayers: number;
  players: Record<string, Player>;
  kickedPlayers?: Record<string, boolean>;
  config?: GameConfig;
  planningEndTime?: number;
  playerAllocations?: Record<string, Record<string, number>>; // userId -> { category: amount }
}

// Generate an 8-digit unique code
export const generateRoomCode = async (): Promise<string> => {
  let code = "";
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const roomRef = ref(rtdb, `gameRooms/${code}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      isUnique = true;
    }
  }
  
  return code;
};

export const createRoom = async (hostId: string, hostName: string): Promise<string> => {
  const code = await generateRoomCode();
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  
  const roomData: GameRoom = {
    code,
    hostId,
    status: "waiting",
    createdAt: Date.now(),
    maxPlayers: 4,
    players: {
      [hostId]: {
        name: hostName,
        avatarLetter: hostName.charAt(0).toUpperCase(),
        joinedAt: Date.now(),
        isOnline: true
      }
    }
  };

  await set(roomRef, roomData);
  return code;
};

export const joinRoom = async (code: string, userId: string, userName: string): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error("Phòng không tồn tại.");
  }
  
  const room: GameRoom = snapshot.val();
  
  if (room.kickedPlayers && room.kickedPlayers[userId]) {
    throw new Error("Bạn đã bị kick khỏi phòng này.");
  }
  
  if (room.status !== "waiting") {
    if (!room.players || !room.players[userId]) {
      throw new Error("Trò chơi đã bắt đầu.");
    }
  }
  
  const currentPlayersCount = room.players ? Object.keys(room.players).length : 0;
  if (currentPlayersCount >= room.maxPlayers && !room.players?.[userId]) {
    throw new Error("Phòng đã đầy.");
  }

  const playerRef = ref(rtdb, `gameRooms/${code}/players/${userId}`);
  
  const avatarLetter = userName.charAt(0).toUpperCase();
  
  await update(playerRef, {
    name: userName,
    avatarLetter,
    joinedAt: Date.now(),
    isOnline: true
  });
};

export const leaveRoom = async (code: string, userId: string): Promise<void> => {
  const playerRef = ref(rtdb, `gameRooms/${code}/players/${userId}`);
  await update(playerRef, { isOnline: false });

  // If game state exists, mark as eliminated
  const gameRef = ref(rtdb, `gameRooms/${code}/gameState/playerStates/${userId}`);
  const snap = await get(gameRef);
  if (snap.exists()) {
    await update(gameRef, { isEliminated: true, eliminationReason: "Đã thoát phòng" });
  }
};

export const kickPlayer = async (code: string, hostId: string, targetUserId: string): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) return;
  const room: GameRoom = snapshot.val();
  
  if (room.hostId === hostId && hostId !== targetUserId) {
    const playerRef = ref(rtdb, `gameRooms/${code}/players/${targetUserId}`);
    await remove(playerRef);
    const kickedRef = ref(rtdb, `gameRooms/${code}/kickedPlayers/${targetUserId}`);
    await set(kickedRef, true);
  } else {
    throw new Error("Bạn không có quyền kick người này.");
  }
};

export const configureGame = async (code: string, hostId: string): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) return;
  const room: GameRoom = snapshot.val();
  
  if (room.hostId === hostId) {
    const playersCount = room.players ? Object.keys(room.players).length : 0;
    if (playersCount >= 2) {
      await update(roomRef, { status: "configuring" });
    } else {
      throw new Error("Cần ít nhất 2 người để cấu hình.");
    }
  } else {
    throw new Error("Chỉ chủ phòng mới có thể bắt đầu.");
  }
};

export const submitGameConfig = async (code: string, hostId: string, config: GameConfig): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) return;
  const room: GameRoom = snapshot.val();
  
  if (room.hostId === hostId) {
    await update(roomRef, { 
      status: "planning", 
      config,
      planningEndTime: Date.now() + config.planningTimeSeconds * 1000
    });
  } else {
    throw new Error("Chỉ chủ phòng mới có thể lưu cấu hình.");
  }
};

export const startGame = async (code: string, hostId: string): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) return;
  const room: GameRoom = snapshot.val();
  
  if (room.hostId === hostId) {
    await update(roomRef, { status: "playing" });
  }
};

export const deleteRoom = async (code: string): Promise<void> => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  await remove(roomRef);
  const signalingRef = ref(rtdb, `gameSignaling/${code}`);
  await remove(signalingRef);
};

export const subscribeToRoom = (code: string, callback: (room: GameRoom | null) => void): (() => void) => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

export const setupOnDisconnect = (code: string, userId: string, isHost: boolean) => {
  const playerRef = ref(rtdb, `gameRooms/${code}/players/${userId}`);
  // Instead of removing the player, mark them as offline.
  // This allows them to rejoin an active game if they reload.
  onDisconnect(playerRef).update({ isOnline: false });
};

export const cancelOnDisconnect = (code: string, userId: string, isHost: boolean) => {
  const roomRef = ref(rtdb, `gameRooms/${code}`);
  const playerRef = ref(rtdb, `gameRooms/${code}/players/${userId}`);
  const signalingRef = ref(rtdb, `gameSignaling/${code}`);

  if (isHost) {
    onDisconnect(roomRef).cancel();
    onDisconnect(signalingRef).cancel();
  } else {
    onDisconnect(playerRef).cancel();
  }
};

export const updatePlayerMediaState = async (roomCode: string, userId: string, isCameraOn: boolean, isMicOn: boolean) => {
  const playerRef = ref(rtdb, `gameRooms/${roomCode}/players/${userId}`);
  await update(playerRef, {
    isCameraOn,
    isMicOn
  });
};

export const savePlayerAllocations = async (roomCode: string, userId: string, allocations: Record<string, number>) => {
  const allocationRef = ref(rtdb, `gameRooms/${roomCode}/playerAllocations/${userId}`);
  await set(allocationRef, allocations);
};
