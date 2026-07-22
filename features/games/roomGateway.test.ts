import { describe, expect, it } from "vitest";
import { getLocalMultiplayerMessage } from "./localGameCapabilities";

describe("local multiplayer capability", () => {
  it("explains why browser-local mode cannot create a room", () => {
    expect(getLocalMultiplayerMessage()).toContain("Firebase");
  });
});
