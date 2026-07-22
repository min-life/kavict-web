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
  playerAllocations?: Record<string, Record<string, number>>;
}
