import { ConversationMode } from "./conversation";

export interface Homework {
  id: string;
  mode: ConversationMode;
  conversationId: string;
  createdAt: number;
  homework: string;
  isDone: boolean;
}
