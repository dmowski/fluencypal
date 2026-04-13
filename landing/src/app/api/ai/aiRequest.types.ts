import { TextAiModel, TextUsageEvent } from '../../../features/Ai/ai';
import { SupportedLanguage } from '../../../features/Lang/lang';

export interface AiRequest {
  userMessage: string;
  systemMessage: string;
  languageCode: SupportedLanguage;
  model: TextAiModel;
  conversationId?: string;
}

export interface AiChatMessage {
  isBot: boolean;
  text: string;
}

export interface AiChatRequest {
  systemMessage: string;
  chatMessages: AiChatMessage[];
  model: TextAiModel;
  conversationId?: string;
}

export interface AiResponse {
  aiResponse: string;
  usageEvent: TextUsageEvent;
}

export interface AiImageRequest {
  imageBase64: string;
  languageCode: SupportedLanguage;
}

export interface AiImageResponse {
  aiImageResponse: string;
}
