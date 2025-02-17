import { ConversationMode } from "./ai";

export interface Homework {
  id: string;
  mode: ConversationMode;
  conversationId: string;
  createdAt: number;
  homework: string;
  isDone: boolean;
}
