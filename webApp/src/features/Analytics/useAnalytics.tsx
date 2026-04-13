'use client';

import { createContext, useContext, useEffect, ReactNode, useRef, useState } from 'react';
import { isDev } from './isDev';
import { useAuth } from '../Auth/useAuth';
import { initHotjar } from './initHotjar';
import { initSentry } from './initSentry';
import { initGTag } from './initGTag';
import { confirmGtag } from './confirmGtag';

const RUN_ON_DEV_ENV = false;

interface AnalyticsContextType {
  isInitialized: boolean;
  confirmGtag: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if ((isDev() && !RUN_ON_DEV_ENV) || !auth.uid || isInitialized || !isWindow) {
      return;
    }

    const isDeveloper = auth.isDev;
    if (isDeveloper) {
      return;
    }

    initGTag();
    initSentry();
    initHotjar();
    setIsInitialized(true);
  }, [auth.uid]);

  const data: AnalyticsContextType = {
    isInitialized: isInitialized,
    confirmGtag,
  };

  return <AnalyticsContext.Provider value={data}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within a AnalyticsProvider');
  }
  return context;
};
