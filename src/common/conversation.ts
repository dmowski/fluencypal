import { SupportedLanguage } from "./lang";

export type ConversationMode = "talk" | "talk-and-correct" | "beginner" | "words";
export interface ChatMessage {
  id: string;
  isBot: boolean;
  text: string;
}

export interface Conversation {
  id: string;
  messagesCount: number;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  language: SupportedLanguage;
  mode: ConversationMode;
}
