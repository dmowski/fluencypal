import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSettings } from '../Settings/useSettings';
import { getPageLangCode } from '../Lang/lang';
import { getUrlStart } from '../Lang/getUrlStart';

export const usePageLangRedirect = () => {
  const settings = useSettings();
  const router = useRouter();

  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if (!isWindow) return;
    if (!settings.userSettings?.pageLanguageCode) return;

    const settingsPageLang = settings.userSettings.pageLanguageCode;
    const actualPageLang = getPageLangCode();
    const isDifferent = actualPageLang !== settingsPageLang;
    if (!isDifferent) return;
    const searchParams = new URLSearchParams(window.location.search);
    const url = `${getUrlStart(settingsPageLang)}practice${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`;
    router.push(url, {
      scroll: false,
    });
  }, [settings.userSettings]);
};
