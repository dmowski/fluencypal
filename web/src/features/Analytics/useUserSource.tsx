'use client';

import { UserSource } from '@/common/analytics';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

const SOURCE_STORAGE_KEY = 'user_source_info';

interface UserSourceContextType {
  userSource: UserSource | null;
  getParamsFromStorage: () => UserSource | null;
}

export const getParamsFromStorage = (): UserSource | null => {
  const stored = localStorage.getItem(SOURCE_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserSource;
  } catch {
    return null;
  }
};

const UserSourceContext = createContext<UserSourceContextType | null>(null);

function useProvideUserSource(): UserSourceContextType {
  const [userSource, setUserSource] = useState<UserSource | null>(null);
  const isWindow = typeof window !== 'undefined';

  const getUrlParam = (param: string): string | null => {
    if (!isWindow) return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) ?? null;
  };

  const getSourceFromUrl = (): UserSource | null => {
    if (!isWindow) return null;

    const url = new URL(window.location.href);
    const referrer = document.referrer || '';

    return {
      urlPath: url.pathname + url.search,
      referrer,

      utmSource: getUrlParam('utm_source'),
      utmMedium: getUrlParam('utm_medium'),
      utmCampaign: getUrlParam('utm_campaign'),
      utmTerm: getUrlParam('utm_term'),
      utmContent: getUrlParam('utm_content'),

      // New Google Ads params
      gclid: getUrlParam('gclid'),
      gbraid: getUrlParam('gbraid'),
      wbraid: getUrlParam('wbraid'),
    };
  };

  const initUserSource = () => {
    const existing = getParamsFromStorage();
    if (existing) {
      setUserSource(existing);
      return;
    }

    const fromUrl = getSourceFromUrl();
    if (fromUrl) {
      localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(fromUrl));
      setUserSource(fromUrl);
    }
  };

  useEffect(() => {
    initUserSource();
  }, []);

  return {
    userSource,
    getParamsFromStorage,
  };
}

export function UserSourceProvider({ children }: { children: ReactNode }) {
  const hook = useProvideUserSource();
  return <UserSourceContext.Provider value={hook}>{children}</UserSourceContext.Provider>;
}

export const useUserSource = (): UserSourceContextType => {
  const context = useContext(UserSourceContext);
  if (!context) {
    throw new Error('useUserSource must be used within a UserSourceProvider');
  }
  return context;
};
