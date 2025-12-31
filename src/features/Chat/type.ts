export interface UserChatMessage {
  id: string;
  senderId: string;

  content: string;

  createdAtIso: string;
  createdAtUtc: number;

  updatedAtIso: string;
}
