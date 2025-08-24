"use client";
import { backButton, isTMA } from "@telegram-apps/sdk-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, ReactNode, JSX, useEffect } from "react";

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

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      return;
    }

    backButton.mount();

    const off = backButton.onClick(navigationBack); // handle click
    return () => {
      off(); // remove handler
      backButton.hide(); // hide when component unmounts
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
