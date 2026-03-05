import { SupportedLanguage } from '@/features/Lang/lang';

export interface FirstBotConversationMessage {
  createdAt: number;
  text: string;
}

export interface AdvancedUserRecord {
  value: string;
  createdAtDayIso: string;
}

export interface AiUserInfo {
  advancedRecords: AdvancedUserRecord[];
  grammarRecordsMap?: Record<SupportedLanguage, AdvancedUserRecord[] | undefined>;
  createdAt: number;
  updatedAt: number;
  firstBotMessages?: FirstBotConversationMessage[];
}
