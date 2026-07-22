import { describe, expect, it } from "vitest";
import { getRuntimeCapabilities } from "@/features/runtime/capabilities";
import { resolveRuntimeMode } from "@/features/runtime/config";

describe("local development mode", () => {
  it("enables editable local data and disables only external capabilities", () => {
    const mode = resolveRuntimeMode({});

    expect(getRuntimeCapabilities(mode)).toEqual({
      usesLocalData: true,
      aiAvailable: false,
      multiplayerAvailable: false,
    });
  });
});
