import { SupportedLanguage } from "../features/Lang/lang";

export type ConversationType =
  | "talk"
  | "words"
  | "rule"
  | "role-play"
  | "goal-role-play"
  | "goal-talk";

export interface ChatMessage {
  id: string;
  isBot: boolean;
  text: string;
  previousId?: string | null;
  isInProgress?: boolean;
}

export interface UserConversationsMeta {
  conversationCount: number;
  lastConversationDate: string | null;
  totalMessages: number;
  todayMessages: number;
  lastHourMessages: number;
  conversations: Conversation[];
}

// parentId -> childId
export type MessagesOrderMap = Record<string, string>;

export interface Conversation {
  id: string;
  messagesCount: number;
  messages: ChatMessage[];

  // parent-child relationships
  messageOrder: MessagesOrderMap;

  createdAt: number;
  createdAtIso: string;
  updatedAt: number;
  updatedAtIso: string;
  languageCode: SupportedLanguage;
  mode: ConversationType;
}
