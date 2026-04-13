import { NativeLangCode } from '@/libs/language/type';

export interface TranslateRequest {
  text: string;
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}

export interface TranslateBatchRequest {
  texts: string[];
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}

export interface TranslateBatchResponse {
  originalTexts: string[];
  translatedTexts: string[];
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode;
}

export interface TranslateCacheEntry {
  request: TranslateRequest;
  response: TranslateResponse;
  createdAtIso: string;
}
