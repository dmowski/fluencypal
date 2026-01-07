export type ChatLikeType = "like" | "dislike";

export interface ChatLike {
  messageId: string;
  userId: string;

  type: ChatLikeType;
  createdAtIso: string;
}

export interface UserChatMessage {
  id: string;
  senderId: string;
  content: string;

  parentMessageId: string;

  createdAtIso: string;
  createdAtUtc: number;
  updatedAtIso: string;

  viewsUserIds?: string[];
}
