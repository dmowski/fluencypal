import { NativeLangCode } from "@/libs/language/type";

export interface TranslateRequest {
  text: string;
  sourceLanguage: NativeLangCode;
  targetLanguage: NativeLangCode;
}

export interface TranslateResponse {
  translatedText: string;
  sourceLanguage: NativeLangCode;
  targetLanguage: NativeLangCode;
}
