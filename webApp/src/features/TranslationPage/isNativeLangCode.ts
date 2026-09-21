import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';

export const isNativeLangCode = (language: string): language is NativeLangCode => {
  return Object.prototype.hasOwnProperty.call(fullLanguagesMap, language);
};
