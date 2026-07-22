import type { RuntimeMode } from "./config";

export interface RuntimeCapabilities {
  usesLocalData: boolean;
  aiAvailable: boolean;
  multiplayerAvailable: boolean;
}

export function getRuntimeCapabilities(mode: RuntimeMode): RuntimeCapabilities {
  return mode === "local"
    ? { usesLocalData: true, aiAvailable: false, multiplayerAvailable: false }
    : { usesLocalData: false, aiAvailable: true, multiplayerAvailable: true };
}
