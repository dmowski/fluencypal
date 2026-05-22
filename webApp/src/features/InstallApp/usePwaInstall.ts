'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getMobilePlatform,
  isLocalhostHostname,
  isMobileInstallTarget,
  isPwaInstalled,
  shouldShowInstallAppCard,
} from './installAppEnvironment';
import type { BeforeInstallPromptEvent, MobilePlatform } from './types';

export const usePwaInstall = () => {
  const [shouldShowCard, setShouldShowCard] = useState(false);
  const [platform, setPlatform] = useState<MobilePlatform>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const syncInstallState = () => {
      setShouldShowCard(shouldShowInstallAppCard());
      setPlatform(getMobilePlatform());
    };

    syncInstallState();

    const onBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
      syncInstallState();
    };

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', syncInstallState);
    standaloneMediaQuery.addEventListener('change', syncInstallState);
    window.addEventListener('resize', syncInstallState);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', syncInstallState);
      standaloneMediaQuery.removeEventListener('change', syncInstallState);
      window.removeEventListener('resize', syncInstallState);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        setShouldShowCard(false);
        return true;
      }

      return false;
    }

    return false;
  }, [deferredPrompt]);

  return {
    shouldShowCard,
    platform,
    canNativePrompt: deferredPrompt !== null,
    isLocalhost: isLocalhostHostname(),
    isMobileInstallTarget: isMobileInstallTarget(),
    isPwaInstalled: isPwaInstalled(),
    promptInstall,
  };
};
