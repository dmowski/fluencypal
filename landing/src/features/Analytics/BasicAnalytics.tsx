'use client';

import { useEffect, useRef } from 'react';
import { isDev } from './isDev';
import { initGTag } from './initGTag';

export const BasicAnalytics = () => {
  const isInitialized = useRef(false);
  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if (isDev() || isInitialized.current || !isWindow) {
      return;
    }
    initGTag();
  }, []);
  return <></>;
};
