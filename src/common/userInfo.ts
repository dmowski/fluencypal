export type AiUserInfoRecord = string;

export interface FirstBotConversationMessage {
  createdAt: number;
  text: string;
}

export interface AiUserInfo {
  records: AiUserInfoRecord[];
  createdAt: number;
  updatedAt: number;
  firstBotMessages?: FirstBotConversationMessage[];
}
