import { describe, expect, it } from "vitest";
import type { Objective } from "./domain";
import { createObjectivePersistenceQueue } from "./objectivePersistence";

const objectives: Objective[] = [
  { id: "emergency-fund", name: "Quỹ dự phòng", isCompleted: false },
  { id: "new-income", name: "Nguồn thu mới", isCompleted: false },
];

describe("objective persistence queue", () => {
  it("continues after a failed toggle and rejects only that failed operation", async () => {
    const writes: Objective[][] = [];
    let refreshes = 0;
    const queue = createObjectivePersistenceQueue(objectives);
    const persist = async (nextObjectives: Objective[]) => {
      writes.push(nextObjectives);
      if (writes.length === 1) throw new Error("first write failed");
    };
    const refresh = async () => { refreshes += 1; };

    const failedToggle = queue.enqueueToggle("emergency-fund", true, persist, refresh);
    const laterToggle = queue.enqueueToggle("new-income", true, persist, refresh);

    await expect(failedToggle).rejects.toThrow("first write failed");
    await expect(laterToggle).resolves.toBeUndefined();
    await queue.whenIdle();

    expect(writes).toEqual([
      [
        { id: "emergency-fund", name: "Quỹ dự phòng", isCompleted: true },
        { id: "new-income", name: "Nguồn thu mới", isCompleted: false },
      ],
      [
        { id: "emergency-fund", name: "Quỹ dự phòng", isCompleted: false },
        { id: "new-income", name: "Nguồn thu mới", isCompleted: true },
      ],
    ]);
    expect(queue.getCurrent()).toEqual(writes[1]);
    expect(refreshes).toBe(1);
  });

  it("keeps a queued toggle when refreshed props arrive after the preceding save", async () => {
    const writes: Objective[][] = [];
    let refreshes = 0;
    const queue = createObjectivePersistenceQueue(objectives);
    const persist = async (nextObjectives: Objective[]) => {
      writes.push(nextObjectives);
      if (writes.length === 1) {
        queue.acceptRemote([
          { ...objectives[0], isCompleted: true },
          objectives[1],
        ]);
      }
    };
    const refresh = async () => { refreshes += 1; };

    const firstToggle = queue.enqueueToggle("emergency-fund", true, persist, refresh);
    const queuedToggle = queue.enqueueToggle("new-income", true, persist, refresh);

    await expect(firstToggle).resolves.toBeUndefined();
    await expect(queuedToggle).resolves.toBeUndefined();
    await queue.whenIdle();

    expect(writes).toEqual([
      [
        { id: "emergency-fund", name: "Quỹ dự phòng", isCompleted: true },
        { id: "new-income", name: "Nguồn thu mới", isCompleted: false },
      ],
      [
        { id: "emergency-fund", name: "Quỹ dự phòng", isCompleted: true },
        { id: "new-income", name: "Nguồn thu mới", isCompleted: true },
      ],
    ]);
    expect(queue.getCurrent()).toEqual(writes[1]);
    expect(refreshes).toBe(1);
  });
});
