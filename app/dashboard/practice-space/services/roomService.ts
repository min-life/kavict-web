import { requireGameRoomGateway } from "@/features/games/roomGateway";

export type {
  GameConfig,
  GameRoom,
  Player,
  RoomStatus,
} from "@/features/games/domain";

export const createRoom = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["createRoom"]>) =>
  requireGameRoomGateway().createRoom(...args);
export const joinRoom = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["joinRoom"]>) =>
  requireGameRoomGateway().joinRoom(...args);
export const leaveRoom = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["leaveRoom"]>) =>
  requireGameRoomGateway().leaveRoom(...args);
export const kickPlayer = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["kickPlayer"]>) =>
  requireGameRoomGateway().kickPlayer(...args);
export const configureGame = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["configureGame"]>) =>
  requireGameRoomGateway().configureGame(...args);
export const submitGameConfig = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["submitGameConfig"]>) =>
  requireGameRoomGateway().submitGameConfig(...args);
export const startGame = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["startGame"]>) =>
  requireGameRoomGateway().startGame(...args);
export const deleteRoom = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["deleteRoom"]>) =>
  requireGameRoomGateway().deleteRoom(...args);
export const subscribeToRoom = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["subscribeToRoom"]>) =>
  requireGameRoomGateway().subscribeToRoom(...args);
export const setupOnDisconnect = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["setupOnDisconnect"]>) =>
  requireGameRoomGateway().setupOnDisconnect(...args);
export const cancelOnDisconnect = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["cancelOnDisconnect"]>) =>
  requireGameRoomGateway().cancelOnDisconnect(...args);
export const updatePlayerMediaState = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["updatePlayerMediaState"]>) =>
  requireGameRoomGateway().updatePlayerMediaState(...args);
export const savePlayerAllocations = (...args: Parameters<ReturnType<typeof requireGameRoomGateway>["savePlayerAllocations"]>) =>
  requireGameRoomGateway().savePlayerAllocations(...args);
