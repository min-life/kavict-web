import type { Objective } from "./domain";

type PersistObjectives = (objectives: Objective[]) => Promise<void>;
type RefreshObjectives = () => Promise<void>;

export function createObjectivePersistenceQueue(initialObjectives: Objective[]) {
  let currentObjectives = [...initialObjectives];
  let pendingIntents = 0;
  let refreshAfterDrain: RefreshObjectives = async () => {};
  let queueTail: Promise<void> = Promise.resolve();

  const finishIntent = async () => {
    pendingIntents -= 1;
    if (pendingIntents === 0) await refreshAfterDrain();
  };

  return {
    acceptRemote(objectives: Objective[]) {
      if (pendingIntents === 0) currentObjectives = [...objectives];
    },
    enqueueToggle(id: string, isCompleted: boolean, persist: PersistObjectives, refresh: RefreshObjectives): Promise<void> {
      pendingIntents += 1;
      refreshAfterDrain = refresh;

      const operation = queueTail.then(async () => {
        const nextObjectives = currentObjectives.map((objective) => objective.id === id ? { ...objective, isCompleted } : objective);
        await persist(nextObjectives);
        currentObjectives = nextObjectives;
      });

      queueTail = operation.then(finishIntent, finishIntent).catch(() => {});
      return operation;
    },
    getCurrent(): Objective[] { return [...currentObjectives]; },
    whenIdle(): Promise<void> { return queueTail; },
  };
}
