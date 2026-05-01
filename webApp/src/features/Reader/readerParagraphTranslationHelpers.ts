import { NativeLangCode } from '@/libs/language/type';

export const normalizeSelectedText = (text: string | null | undefined): string =>
  text?.trim() ?? '';

export const canTranslateReaderText = ({
  text,
  sourceLanguage,
  targetLanguage,
}: {
  text: string;
  sourceLanguage: NativeLangCode | null;
  targetLanguage: NativeLangCode | null;
}): boolean => {
  return Boolean(text && targetLanguage && sourceLanguage !== targetLanguage);
};
