import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useSettings } from '../Settings/useSettings';
import { getPageLangCode } from '../Lang/lang';
import { getUrlStart } from '../Lang/getUrlStart';

/**
 * When saved page language differs from the URL locale segment, navigate to
 * the matching /{lang}/practice URL. Dedupes repeated pushes when Firestore
 * re-emits the same settings object.
 */
export const usePageLangRedirect = () => {
  const pageLanguageCode = useSettings().userSettings?.pageLanguageCode;
  const router = useRouter();
  const lastRedirectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pageLanguageCode) return;

    const actualPageLang = getPageLangCode();
    if (actualPageLang === pageLanguageCode) {
      lastRedirectUrlRef.current = null;
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const url = `${getUrlStart(pageLanguageCode)}practice${
      searchParams.toString() ? `?${searchParams.toString()}` : ''
    }`;

    if (lastRedirectUrlRef.current === url) return;
    lastRedirectUrlRef.current = url;

    Sentry.addBreadcrumb({
      category: 'navigation',
      level: 'info',
      message: 'page language redirect',
      data: {
        fromLang: actualPageLang,
        toLang: pageLanguageCode,
        url,
        href: window.location.href,
      },
    });

    router.push(url, {
      scroll: false,
    });
  }, [pageLanguageCode, router]);
};
