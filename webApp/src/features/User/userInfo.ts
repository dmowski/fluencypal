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
  advancedRecords: AdvancedUserRecord[] | null;
  grammarRecordsMap: Record<SupportedLanguage, AdvancedUserRecord[] | undefined> | null;
  createdAt: number;
  updatedAt: number;
  firstBotMessages?: FirstBotConversationMessage[];
}
