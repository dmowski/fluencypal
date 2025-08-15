import { SupportedLanguage } from "@/features/Lang/lang";

export interface PhraseCorrection {
  botMessage: string;
  userMessage: string;

  correctedMessage: string;

  description: string;

  languageCode: SupportedLanguage;

  conversationId: string;

  createdAtIso: string;
}
