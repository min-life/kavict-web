import { describe, expect, it } from "vitest";
import { createLocalLearningRepository } from "./localRepository";
import { createMemoryStorage } from "@/features/auth/localGateway";

describe("local learning repository", () => {
  it("keeps notes and chat isolated by user and lesson", async () => {
    const repo = createLocalLearningRepository(createMemoryStorage());
    await repo.saveNotes("user-a", 4, [{ id: "note-1", text: "Lãi kép", timestamp: "09:00" }]);
    await repo.saveChat("user-a", 4, [{ id: "chat-1", sender: "user", text: "Ví dụ", timestamp: "09:01" }]);

    expect(await repo.getNotes("user-a", 4)).toHaveLength(1);
    expect(await repo.getChat("user-b", 4)).toEqual([]);
  });
});
