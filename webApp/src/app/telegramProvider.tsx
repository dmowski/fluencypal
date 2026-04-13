'use client';

import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { isTMA } from '@telegram-apps/sdk-react';
import { initTg } from '@/features/Telegram/init';

export function useDidMount(): boolean {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return didMount;
}

function TelegramProviderInner({ children }: PropsWithChildren) {
  return (
    <TonConnectUIProvider manifestUrl="https://www.fluencypal.com/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

export function TelegramProvider(props: PropsWithChildren) {
  const didMount = useDidMount();
  const isTelegramApp = isTMA();
  const [isInit, setIsInit] = useState(false);
  const isInitializing = useRef(false);

  const initTgOnce = async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    await initTg();
    setIsInit(true);

    // @ts-expect-error
    window.isTgSdkInitialized = true;
  };

  useEffect(() => {
    isTelegramApp && initTgOnce();
  }, [isTelegramApp]);

  return didMount && isTelegramApp ? <TelegramProviderInner {...props} /> : <>{props.children}</>;
}

export const isTgInitialized = () => {
  if (typeof window === 'undefined') return false;
  // @ts-expect-error
  return !!window.isTgSdkInitialized;
};

export const waitForTgInitialization = () => {
  return new Promise<void>((resolve) => {
    if (isTgInitialized()) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (isTgInitialized()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
};

export const useIsTgInitialized = () => {
  const [isInitialized, setIsInitialized] = useState(isTgInitialized());

  useEffect(() => {
    if (isInitialized) return;

    const checkInterval = setInterval(() => {
      if (isTgInitialized()) {
        clearInterval(checkInterval);
        setIsInitialized(true);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [isInitialized]);

  return isInitialized;
};
