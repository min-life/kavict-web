import type { LearningMessage, LessonNote } from "./domain";
import type { LearningRepository } from "./repository";

const key = (type: "chat" | "notes", uid: string, lessonId: number) =>
  `kavict:local:learning:v1:${type}:${uid}:${lessonId}`;

function read<T>(storage: Storage, storageKey: string): T[] {
  try {
    const value = storage.getItem(storageKey);
    return value ? JSON.parse(value) as T[] : [];
  } catch {
    return [];
  }
}

export function createLocalLearningRepository(storage: Storage): LearningRepository {
  return {
    async getChat(uid, lessonId) { return read<LearningMessage>(storage, key("chat", uid, lessonId)); },
    async saveChat(uid, lessonId, messages) { storage.setItem(key("chat", uid, lessonId), JSON.stringify(messages)); },
    async getNotes(uid, lessonId) { return read<LessonNote>(storage, key("notes", uid, lessonId)); },
    async saveNotes(uid, lessonId, notes) { storage.setItem(key("notes", uid, lessonId), JSON.stringify(notes)); },
  };
}
