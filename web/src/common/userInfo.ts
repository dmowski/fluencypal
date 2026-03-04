export interface FirstBotConversationMessage {
  createdAt: number;
  text: string;
}

export interface AdvancedUserRecord {
  value: string;
  createdAtDayIso: string;
}

export interface AiUserInfo {
  records: string[];
  advancedRecords: AdvancedUserRecord[];
  createdAt: number;
  updatedAt: number;
  firstBotMessages?: FirstBotConversationMessage[];
}
