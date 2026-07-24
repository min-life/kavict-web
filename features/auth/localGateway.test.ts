import { describe, expect, it } from "vitest";
import { createLocalAuthGateway, createMemoryStorage } from "./localGateway";

describe("local auth gateway", () => {
  it("creates a deterministic demo session and persists onboarding", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);

    await gateway.signInWithEmail("demo@kavict.local", "ignored");
    await gateway.completeOnboarding({
      preferredName: "Kavi Demo",
      occupationGroup: "Sinh viên",
      monthlyIncome: "3 - 5 triệu",
      highestExpenses: ["Ăn uống"],
      financialGoal: "Tiết kiệm một khoản tiền",
    });

    expect(await gateway.getCurrentUser()).toMatchObject({ uid: "local-demo-user" });
    expect(await gateway.getProfile()).toMatchObject({ preferredName: "Kavi Demo", onboarded: true });
  });

  it("restores the onboarding preferred name after signing out and signing back in", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);

    await gateway.signInWithEmail("demo@kavict.local", "ignored");
    await gateway.completeOnboarding({
      preferredName: "Linh Nguyen",
      occupationGroup: "Sinh viên",
      monthlyIncome: "3 - 5 triệu",
      highestExpenses: ["Ăn uống"],
      financialGoal: "Tiết kiệm một khoản tiền",
    });
    await gateway.signOut();
    await gateway.signInWithEmail("demo@kavict.local", "ignored");

    expect(await gateway.getCurrentUser()).toMatchObject({ displayName: "Linh Nguyen" });
  });

  it("persists avatar and personalization preferences and notifies subscribers", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);
    const received: string[] = [];
    const unsubscribe = gateway.subscribe((_user, profile) => received.push(profile?.avatarKey ?? "empty"));

    await gateway.updateProfilePreferences({
      avatarKey: "bloom",
      informationForKavi: "Mình đang học cách lập ngân sách.",
      kaviTone: "ấm áp",
      responseStyle: "detailed",
    });

    expect(await gateway.getProfile()).toMatchObject({
      avatarKey: "bloom",
      informationForKavi: "Mình đang học cách lập ngân sách.",
      kaviTone: "ấm áp",
      responseStyle: "detailed",
    });
    expect(received.at(-1)).toBe("bloom");
    unsubscribe();
  });

  it("persists editable name and age while retaining the local join timestamp", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);

    await gateway.signInWithEmail("demo@kavict.local", "ignored");
    await gateway.completeOnboarding({
      preferredName: "Kavi Demo",
      occupationGroup: "Sinh viên",
      monthlyIncome: "3 - 5 triệu",
      highestExpenses: ["Ăn uống"],
      financialGoal: "Tiết kiệm một khoản tiền",
    });
    const joinedAt = (await gateway.getProfile())?.createdAt;

    await gateway.updateProfilePreferences({
      avatarKey: "mint",
      informationForKavi: "Mình đang học cách lập ngân sách.",
      kaviTone: "ấm áp",
      responseStyle: "detailed",
      preferredName: "Linh Nguyễn",
      age: 21,
    });

    expect(await gateway.getProfile()).toMatchObject({
      preferredName: "Linh Nguyễn",
      age: 21,
      createdAt: joinedAt,
    });
    expect(joinedAt).toEqual(expect.any(String));
  });

  it("updates the current local user and subscribers when the preferred name changes", async () => {
    const storage = createMemoryStorage();
    const gateway = createLocalAuthGateway(storage);
    const received: Array<{ displayName: string | null | undefined; preferredName: string | undefined }> = [];

    await gateway.signInWithEmail("demo@kavict.local", "ignored");
    const unsubscribe = gateway.subscribe((user, profile) => {
      received.push({ displayName: user?.displayName, preferredName: profile?.preferredName });
    });

    await gateway.updateProfilePreferences({
      avatarKey: null,
      informationForKavi: "",
      kaviTone: "vui vẻ",
      responseStyle: "concise",
      preferredName: "Linh Nguyễn",
    });

    expect(await gateway.getCurrentUser()).toMatchObject({ displayName: "Linh Nguyễn" });
    expect(received.at(-1)).toEqual({ displayName: "Linh Nguyễn", preferredName: "Linh Nguyễn" });
    unsubscribe();
  });
});
