'use client';

import { useEffect } from 'react';
import { isDev } from './isDev';
import { initGTag } from './initGTag';

export const BasicAnalytics = () => {
  useEffect(() => {
    // The first-party tracker iframe must not create a second Google tag/page view.
    if (isDev() || window.self !== window.top) return;
    initGTag();
  }, []);
  return null;
};
