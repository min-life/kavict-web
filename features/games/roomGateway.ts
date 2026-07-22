import { runtimeMode } from "@/features/runtime/config";
import type { GameConfig, GameRoom } from "./domain";
import { createFirebaseRoomGateway } from "./firebaseRoomGateway";

export interface GameRoomGateway {
  createRoom(hostId: string, hostName: string): Promise<string>;
  joinRoom(code: string, userId: string, userName: string): Promise<void>;
  leaveRoom(code: string, userId: string): Promise<void>;
  kickPlayer(code: string, hostId: string, targetUserId: string): Promise<void>;
  configureGame(code: string, hostId: string): Promise<void>;
  submitGameConfig(code: string, hostId: string, config: GameConfig): Promise<void>;
  startGame(code: string, hostId: string): Promise<void>;
  deleteRoom(code: string): Promise<void>;
  subscribeToRoom(code: string, callback: (room: GameRoom | null) => void): () => void;
  setupOnDisconnect(code: string, userId: string, isHost: boolean): void;
  cancelOnDisconnect(code: string, userId: string, isHost: boolean): void;
  updatePlayerMediaState(
    roomCode: string,
    userId: string,
    isCameraOn: boolean,
    isMicOn: boolean,
  ): Promise<void>;
  savePlayerAllocations(
    roomCode: string,
    userId: string,
    allocations: Record<string, number>,
  ): Promise<void>;
  subscribeToGameState<T>(
    roomCode: string,
    callback: (state: T | null) => void,
    onlyOnce?: boolean,
  ): () => void;
  setGameState<T>(roomCode: string, state: T): Promise<void>;
  updateGameStatePaths(updates: Record<string, unknown>): Promise<void>;
}

let firebaseGateway: GameRoomGateway | null = null;

export function getGameRoomGateway(): GameRoomGateway | null {
  if (runtimeMode !== "firebase") return null;
  firebaseGateway ??= createFirebaseRoomGateway();
  return firebaseGateway;
}

export function requireGameRoomGateway(): GameRoomGateway {
  const gateway = getGameRoomGateway();
  if (!gateway) {
    throw new Error("Firebase multiplayer is unavailable in local mode.");
  }
  return gateway;
}
