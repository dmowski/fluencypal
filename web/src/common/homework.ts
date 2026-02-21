import { ConversationType } from './conversation';
import { SupportedLanguage } from '../features/Lang/lang';

export interface Homework {
  id: string;
  mode: ConversationType;
  conversationId: string;
  createdAt: number;
  homework: string;
  languageCode: SupportedLanguage;
  isDone: boolean;
  isSkip?: boolean;
  isSkipAt?: number;
}
