import { describe, expect, it } from "vitest";
import { AVATAR_OPTIONS, findAvatar, formatProfileJoinDate, validateBasicProfile } from "./profileModel";

describe("profile avatar options", () => {
  it("provides six local character choices and resolves the selected key", () => {
    expect(AVATAR_OPTIONS).toHaveLength(6);
    expect(AVATAR_OPTIONS.map((avatar) => avatar.key)).toEqual(["bloom", "mint", "berry", "sky", "violet", "sunny"]);
    expect(findAvatar("mint")?.label).toBe("Mèo Mint");
    expect(findAvatar("missing")).toBeUndefined();
  });
});

describe("profile model", () => {
  it("formats serializable local join timestamps and preserves missing values", () => {
    expect(formatProfileJoinDate("2026-07-24T00:00:00.000Z")).toContain("2026");
    expect(formatProfileJoinDate({ toDate: () => new Date("2026-07-24T00:00:00.000Z") })).toContain("2026");
    expect(formatProfileJoinDate(undefined)).toBe("Chưa cập nhật");
  });

  it("requires a nonblank name and an age from 1 through 120", () => {
    expect(validateBasicProfile({ preferredName: " ", age: "21" })).toEqual({ preferredName: "Tên không được để trống." });
    expect(validateBasicProfile({ preferredName: "Linh", age: "121" })).toEqual({ age: "Tuổi cần nằm trong khoảng 1 đến 120." });
    expect(validateBasicProfile({ preferredName: " Linh ", age: "21" })).toEqual({});
  });
});
