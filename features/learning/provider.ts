import { runtimeMode } from "@/features/runtime/config";
import { createFirebaseLearningRepository } from "./firebaseRepository";
import { createLocalLearningRepository } from "./localRepository";
import type { LearningRepository } from "./repository";

let repository: LearningRepository | null = null;

export function getLearningRepository(): LearningRepository {
  if (typeof window === "undefined") throw new Error("Learning repository is only available in the browser");
  if (!repository) {
    repository = runtimeMode === "local"
      ? createLocalLearningRepository(window.localStorage)
      : createFirebaseLearningRepository();
  }
  return repository;
}
