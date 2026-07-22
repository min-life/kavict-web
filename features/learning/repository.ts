import type { LearningMessage, LessonNote } from "./domain";

export interface LearningRepository {
  getChat(uid: string, lessonId: number): Promise<LearningMessage[]>;
  saveChat(uid: string, lessonId: number, messages: LearningMessage[]): Promise<void>;
  getNotes(uid: string, lessonId: number): Promise<LessonNote[]>;
  saveNotes(uid: string, lessonId: number, notes: LessonNote[]): Promise<void>;
}
