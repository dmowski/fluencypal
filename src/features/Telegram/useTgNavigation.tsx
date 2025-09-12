"use client";
import {
  backButton,
  isTMA,
  swipeBehavior,
  closingBehavior,
  requestFullscreen,
  isFullscreen,
} from "@telegram-apps/sdk-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, ReactNode, JSX, useEffect, useRef } from "react";

interface TgNavigationContextType {}

const TgNavigationContext = createContext<TgNavigationContextType | null>(null);

function useProvideTgNavigation(): TgNavigationContextType {
  const route = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      return;
    }

    if (searchParamsString) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [searchParamsString]);

  const navigationBack = () => {
    route.back();
  };

  const isRequestedFullScreen = useRef(false);

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      return;
    }

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
      console.log("Failed to switch to fullscreen", e);
    }

    const off = backButton.onClick(navigationBack); // handle click
    return () => {
      off(); // remove handler
      backButton.hide(); // hide when component unmounts
      swipeBehavior.enableVertical.ifAvailable?.();
      closingBehavior.disableConfirmation.ifAvailable?.();
    };
  }, []);

  return {};
}

export function TgNavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideTgNavigation();
  return <TgNavigationContext.Provider value={hook}>{children}</TgNavigationContext.Provider>;
}

export const useTgNavigation = (): TgNavigationContextType => {
  const context = useContext(TgNavigationContext);
  if (!context) {
    throw new Error("useTgNavigation must be used within a TgNavigationProvider");
  }
  return context;
};
