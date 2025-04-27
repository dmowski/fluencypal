export interface FirstBotConversationMessage {
  createdAt: number;
  text: string;
}

export interface AiUserInfo {
  records: string[];
  createdAt: number;
  updatedAt: number;
  firstBotMessages?: FirstBotConversationMessage[];
}
