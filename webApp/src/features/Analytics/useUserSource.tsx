'use client';

import { UserSource } from '@/features/Analytics/analytics';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {
  buildUserSource,
  captureUserSourceFromTrackerSearch,
  getParamsFromStorage,
  persistUserSourceIfAbsent,
} from './userSourceCapture';

export { getParamsFromStorage } from './userSourceCapture';

interface UserSourceContextType {
  userSource: UserSource | null;
  getParamsFromStorage: () => UserSource | null;
}

const UserSourceContext = createContext<UserSourceContextType | null>(null);

function useProvideUserSource(): UserSourceContextType {
  const [userSource, setUserSource] = useState<UserSource | null>(() => getParamsFromStorage());

  const captureFromCurrentPage = (): UserSource | null => {
    if (typeof window === 'undefined') return null;
    const fromUrl = buildUserSource(window.location.href, document.referrer || '');
    if (fromUrl) return fromUrl;
    return captureUserSourceFromTrackerSearch(window.location.search);
  };

  useEffect(() => {
    const captured = persistUserSourceIfAbsent(captureFromCurrentPage());
    if (captured) setUserSource(captured);
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
