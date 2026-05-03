import { NativeLangCode } from '@/libs/language/type';

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
