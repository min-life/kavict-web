import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { rtdb } from "@/lib/firebase";
import type { GameRoom } from "./domain";
import type { GameRoomGateway } from "./roomGateway";

async function generateRoomCode(): Promise<string> {
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const snapshot = await get(ref(rtdb, `gameRooms/${code}`));
    isUnique = !snapshot.exists();
  }

  return code;
}

export function createFirebaseRoomGateway(): GameRoomGateway {
  return {
    async createRoom(hostId, hostName) {
      const code = await generateRoomCode();
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
            isOnline: true,
          },
        },
      };

      await set(ref(rtdb, `gameRooms/${code}`), roomData);
      return code;
    },

    async joinRoom(code, userId, userName) {
      const roomRef = ref(rtdb, `gameRooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) throw new Error("Phòng không tồn tại.");

      const room = snapshot.val() as GameRoom;
      if (room.kickedPlayers?.[userId]) {
        throw new Error("Bạn đã bị kick khỏi phòng này.");
      }
      if (room.status !== "waiting" && !room.players?.[userId]) {
        throw new Error("Trò chơi đã bắt đầu.");
      }

      const currentPlayersCount = room.players ? Object.keys(room.players).length : 0;
      if (currentPlayersCount >= room.maxPlayers && !room.players?.[userId]) {
        throw new Error("Phòng đã đầy.");
      }

      await update(ref(rtdb, `gameRooms/${code}/players/${userId}`), {
        name: userName,
        avatarLetter: userName.charAt(0).toUpperCase(),
        joinedAt: Date.now(),
        isOnline: true,
      });
    },

    async leaveRoom(code, userId) {
      await update(ref(rtdb, `gameRooms/${code}/players/${userId}`), { isOnline: false });
      const gameRef = ref(rtdb, `gameRooms/${code}/gameState/playerStates/${userId}`);
      const snapshot = await get(gameRef);
      if (snapshot.exists()) {
        await update(gameRef, { isEliminated: true, eliminationReason: "Đã thoát phòng" });
      }
    },

    async kickPlayer(code, hostId, targetUserId) {
      const roomRef = ref(rtdb, `gameRooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;

      const room = snapshot.val() as GameRoom;
      if (room.hostId !== hostId || hostId === targetUserId) {
        throw new Error("Bạn không có quyền kick người này.");
      }

      await remove(ref(rtdb, `gameRooms/${code}/players/${targetUserId}`));
      await set(ref(rtdb, `gameRooms/${code}/kickedPlayers/${targetUserId}`), true);
    },

    async configureGame(code, hostId) {
      const roomRef = ref(rtdb, `gameRooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;

      const room = snapshot.val() as GameRoom;
      if (room.hostId !== hostId) throw new Error("Chỉ chủ phòng mới có thể bắt đầu.");
      if (Object.keys(room.players ?? {}).length < 2) {
        throw new Error("Cần ít nhất 2 người để cấu hình.");
      }
      await update(roomRef, { status: "configuring" });
    },

    async submitGameConfig(code, hostId, config) {
      const roomRef = ref(rtdb, `gameRooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;

      const room = snapshot.val() as GameRoom;
      if (room.hostId !== hostId) throw new Error("Chỉ chủ phòng mới có thể lưu cấu hình.");
      await update(roomRef, {
        status: "planning",
        config,
        planningEndTime: Date.now() + config.planningTimeSeconds * 1000,
      });
    },

    async startGame(code, hostId) {
      const roomRef = ref(rtdb, `gameRooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;
      const room = snapshot.val() as GameRoom;
      if (room.hostId === hostId) await update(roomRef, { status: "playing" });
    },

    async deleteRoom(code) {
      await remove(ref(rtdb, `gameRooms/${code}`));
      await remove(ref(rtdb, `gameSignaling/${code}`));
    },

    subscribeToRoom(code, callback) {
      return onValue(ref(rtdb, `gameRooms/${code}`), (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() as GameRoom : null);
      });
    },

    setupOnDisconnect(code, userId) {
      void onDisconnect(ref(rtdb, `gameRooms/${code}/players/${userId}`))
        .update({ isOnline: false });
    },

    cancelOnDisconnect(code, userId, isHost) {
      if (isHost) {
        void onDisconnect(ref(rtdb, `gameRooms/${code}`)).cancel();
        void onDisconnect(ref(rtdb, `gameSignaling/${code}`)).cancel();
      } else {
        void onDisconnect(ref(rtdb, `gameRooms/${code}/players/${userId}`)).cancel();
      }
    },

    async updatePlayerMediaState(roomCode, userId, isCameraOn, isMicOn) {
      await update(ref(rtdb, `gameRooms/${roomCode}/players/${userId}`), {
        isCameraOn,
        isMicOn,
      });
    },

    async savePlayerAllocations(roomCode, userId, allocations) {
      await set(ref(rtdb, `gameRooms/${roomCode}/playerAllocations/${userId}`), allocations);
    },

    subscribeToGameState<T>(roomCode: string, callback: (state: T | null) => void, onlyOnce = false) {
      return onValue(
        ref(rtdb, `gameRooms/${roomCode}/gameState`),
        (snapshot) => callback(snapshot.exists() ? snapshot.val() as T : null),
        { onlyOnce },
      );
    },

    async setGameState<T>(roomCode: string, state: T) {
      await set(ref(rtdb, `gameRooms/${roomCode}/gameState`), state);
    },

    async updateGameStatePaths(updates) {
      await update(ref(rtdb), updates);
    },
  };
}
