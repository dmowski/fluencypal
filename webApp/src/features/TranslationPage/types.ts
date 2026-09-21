import { NativeLangCode } from '@/libs/language/type';

export type TranslationPageSettings = {
  languages: NativeLangCode[];
  voiceOverEnabled: boolean;
  autoPronounceSource: boolean;
  autoPronounceResult: boolean;
};

export type TranslationSpeechItem = {
  language: NativeLangCode;
  text: string;
};

export type UsageExamplesState = {
  loading: boolean;
  error: string | null;
  examples: string[];
};

export type TranslationTexts = Partial<Record<NativeLangCode, string>>;
