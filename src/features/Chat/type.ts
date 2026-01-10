export type ChatLikeType = "like" | "dislike";

export interface ChatLike {
  messageId: string;
  userId: string;

  type: ChatLikeType;
  createdAtIso: string;
}

export interface UserChatMetadataStatic {
  spaceId: string;
  allowedUserIds: string[] | null;
  isPrivate: boolean;
  type: "global" | "debate" | "privateChat" | "dailyQuestion";

  debateId?: string;
}

// Metadata about a chat space
export interface UserChatMetadata extends UserChatMetadataStatic {
  totalMessages: number;
}

// Metadata about a user in a chat space
export interface ChatSpaceUserReadMetadata {
  // messageId, time when the user first read the message
  [spaceId: string]: {
    [messageId: string]: boolean;
  };
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

  isDeleted?: boolean;
}
