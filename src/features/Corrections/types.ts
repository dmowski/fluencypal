import { SupportedLanguage } from "@/common/lang";

export interface PhraseCorrection {
  botMessage: string;
  userMessage: string;

  correctedMessage: string;

  description: string;

  languageCode: SupportedLanguage;

  conversationId: string;

  createdAt: number;
}
