'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getMobilePlatform,
  isLocalhostHostname,
  isMobileInstallTarget,
  isPwaInstalled,
  shouldShowInstallAppCard,
} from './installAppEnvironment';
import { hideInstallAppInstructionForever } from './installAppStorage';
import type { MobilePlatform } from './types';

export const usePwaInstall = () => {
  const [shouldShowCard, setShouldShowCard] = useState(false);
  const [platform, setPlatform] = useState<MobilePlatform>('other');

  useEffect(() => {
    const syncInstallState = () => {
      setShouldShowCard(shouldShowInstallAppCard());
      setPlatform(getMobilePlatform());
    };

    syncInstallState();

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');

    window.addEventListener('appinstalled', syncInstallState);
    standaloneMediaQuery.addEventListener('change', syncInstallState);
    window.addEventListener('resize', syncInstallState);

    return () => {
      window.removeEventListener('appinstalled', syncInstallState);
      standaloneMediaQuery.removeEventListener('change', syncInstallState);
      window.removeEventListener('resize', syncInstallState);
    };
  }, []);

  const dismissForever = useCallback(() => {
    hideInstallAppInstructionForever();
    setShouldShowCard(false);
  }, []);

  return {
    shouldShowCard,
    platform,
    isLocalhost: isLocalhostHostname(),
    isMobileInstallTarget: isMobileInstallTarget(),
    isPwaInstalled: isPwaInstalled(),
    dismissForever,
  };
};
