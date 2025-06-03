import { SupportedLanguage } from "@/features/Lang/lang";

export interface TranslateRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

export interface TranslateResponse {
  translatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}
