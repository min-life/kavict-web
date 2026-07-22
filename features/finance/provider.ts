import { runtimeMode } from "@/features/runtime/config";
import { createFirebaseFinanceRepository } from "./firebaseRepository";
import { createLocalFinanceRepository } from "./localRepository";
import type { FinanceRepository } from "./repository";

let repository: FinanceRepository | null = null;

export function getFinanceRepository(): FinanceRepository {
  if (typeof window === "undefined") throw new Error("Finance repository is only available in the browser");
  if (!repository) {
    repository = runtimeMode === "local"
      ? createLocalFinanceRepository(window.localStorage)
      : createFirebaseFinanceRepository();
  }
  return repository;
}
