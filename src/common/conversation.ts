import { SupportedLanguage } from "./lang";

export type ConversationMode = "talk" | "talkAndCorrect" | "beginner" | "words" | "rule" | "custom";

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
  languageCode: SupportedLanguage;
  mode: ConversationMode;
}
