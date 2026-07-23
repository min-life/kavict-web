import { describe, expect, it } from "vitest";
import { AVATAR_OPTIONS, findAvatar } from "./profileModel";

describe("profile avatar options", () => {
  it("provides six local character choices and resolves the selected key", () => {
    expect(AVATAR_OPTIONS).toHaveLength(6);
    expect(AVATAR_OPTIONS.map((avatar) => avatar.key)).toEqual(["bloom", "mint", "berry", "sky", "violet", "sunny"]);
    expect(findAvatar("mint")?.label).toBe("Mèo Mint");
    expect(findAvatar("missing")).toBeUndefined();
  });
});
