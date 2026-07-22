export interface LearningMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface LessonNote {
  id: string;
  text: string;
  timestamp: string;
  [key: string]: unknown;
}
