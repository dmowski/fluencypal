'use client';
import {
  backButton,
  isTMA,
  swipeBehavior,
  closingBehavior,
  requestFullscreen,
  isFullscreen,
} from '@telegram-apps/sdk-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';

interface TgNavigationContextType {
  addBackHandler: (handler: () => void) => () => void;
}

const TgNavigationContext = createContext<TgNavigationContextType | null>(null);

function useProvideTgNavigation(): TgNavigationContextType {
  const route = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      return;
    }

    const isQuiz = path.endsWith('/quiz');
    if (isQuiz) {
      const quizStep = searchParams.get('currentStep');
      if (quizStep) {
        backButton.show();
      } else {
        backButton.hide();
      }
    } else {
      if (searchParamsString) {
        backButton.show();
      } else {
        backButton.hide();
      }
    }
  }, [searchParamsString, path]);

  const [backStack, setBackStack] = useState<(() => void)[]>([]);
  const backHandler = () => {
    const lastHandler = backStack.length ? backStack[backStack.length - 1] : null;
    if (lastHandler) {
      lastHandler();
    } else {
      route.back();
    }
  };

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) return;
    const removeBackEventListener = backButton.onClick(backHandler);
    return () => {
      removeBackEventListener();
    };
  }, [backStack, route]);

  const isRequestedFullScreen = useRef(false);
  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) return;

    swipeBehavior.mount.ifAvailable?.();
    closingBehavior.mount.ifAvailable?.();

    // 3) Disable the swipe-down minimize/close gesture (TG v7.7+)
    swipeBehavior.disableVertical.ifAvailable?.();

    // 4) Also ask for confirmation on close (works on older clients, too)
    closingBehavior.enableConfirmation.ifAvailable?.();

    backButton.mount();

    try {
      if (!isRequestedFullScreen.current && !isFullscreen()) {
        isRequestedFullScreen.current = true;
        requestFullscreen();
      }
    } catch (e) {
      console.log('Failed to switch to fullscreen', e);
    }

    return () => {
      backButton.hide(); // hide when component unmounts
      swipeBehavior.enableVertical.ifAvailable?.();
      closingBehavior.disableConfirmation.ifAvailable?.();
    };
  }, []);

  const addBackHandler = (newHandler: () => void): (() => void) => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) return () => {};

    setBackStack((prev) => [...prev, newHandler]);
    return () => {
      setBackStack((prev) => {
        return prev.filter((backHandler) => backHandler !== newHandler);
      });
    };
  };

  return { addBackHandler };
}

export function TgNavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideTgNavigation();
  return <TgNavigationContext.Provider value={hook}>{children}</TgNavigationContext.Provider>;
}

export const useTgNavigation = (): TgNavigationContextType => {
  const context = useContext(TgNavigationContext);
  if (!context) {
    throw new Error('useTgNavigation must be used within a TgNavigationProvider');
  }
  return context;
};
