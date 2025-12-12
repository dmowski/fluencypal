"use client";

import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { isDev } from "./isDev";
import { useAuth } from "../Auth/useAuth";
import { initHotjar } from "./initHotjar";
import { initSentry } from "./initSentry";
import { initGTag } from "./initGTag";
import { confirmGtag } from "./confirmGtag";

const RUN_ON_DEV_ENV = false;

interface AnalyticsContextType {
  isInitialized: boolean;
  confirmGtag: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const isInitialized = useRef(false);

  const isDeveloper = auth.userInfo?.email?.includes("dmowski") || false;
  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if ((isDev() && !RUN_ON_DEV_ENV) || !auth.uid || isInitialized.current || !isWindow) {
      return;
    }
    if (isDeveloper) {
      return;
    }

    isInitialized.current = true;
    initSentry();
    initHotjar();
    initGTag();
  }, [auth.uid]);

  const data: AnalyticsContextType = {
    isInitialized: isInitialized.current,
    confirmGtag,
  };

  return <AnalyticsContext.Provider value={data}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};
