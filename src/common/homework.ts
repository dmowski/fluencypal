import { ConversationMode } from "./conversation";
import { SupportedLanguage } from "./lang";

export interface Homework {
  id: string;
  mode: ConversationMode;
  conversationId: string;
  createdAt: number;
  homework: string;
  languageCode: SupportedLanguage;
  isDone: boolean;
  isSkip?: boolean;
  isSkipAt?: number;
}
