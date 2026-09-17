import { replaceUrlToLang } from '@/features/Lang/replaceLangInUrl';
import { supportedLanguages } from '@/features/Lang/lang';
import { convertMapToNewUrl } from '@/features/Url/convertMapToNewUrl';

export function getNativeLanguageQuizNextUrl({
  currentStep,
  nativeLanguage,
  currentPageLang,
  nextState,
  defaultState,
  pathname,
  search,
}: {
  currentStep: string;
  nativeLanguage: string;
  currentPageLang: string;
  nextState: object;
  defaultState: object;
  pathname: string;
  search: string;
}): string | null {
  if (currentStep !== 'nativeLanguage') {
    return null;
  }

  const targetLang = supportedLanguages.find((lang) => lang === nativeLanguage);
  if (!targetLang || targetLang === currentPageLang) {
    return null;
  }

  const url = convertMapToNewUrl(
    nextState as Record<string, string>,
    defaultState as Record<string, string>,
    { pathname, search },
  );
  return replaceUrlToLang(targetLang, url);
}
