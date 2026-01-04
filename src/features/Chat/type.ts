export type ChatLikeType = "like" | "dislike";

export interface ChatLike {
  messageId: string;
  userId: string;

  type: ChatLikeType;
  createdAtIso: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;

  content: string;

  createdAtIso: string;
  createdAtUtc: number;

  updatedAtIso: string;
}

export interface UserChatMessage extends ChatMessage {
  replies: ChatMessage[];
}
