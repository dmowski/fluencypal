"use client";

import { UserSource } from "@/common/analytics";
import { createContext, useContext, ReactNode, useEffect, useState } from "react";

const SOURCE_STORAGE_KEY = "user_source_info";

interface UserSourceContextType {
  userSource: UserSource | null;
  getParamsFromStorage: () => UserSource | null;
}

const UserSourceContext = createContext<UserSourceContextType | null>(null);

function useProvideUserSource(): UserSourceContextType {
  const [userSource, setUserSource] = useState<UserSource | null>(null);

  const isWindow = typeof window !== "undefined";
  const urlString = isWindow ? window.location.href : "";

  const getUtmParamFromUrl = (param: string): string | null => {
    if (!isWindow) return null;
    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);
    return value ? decodeURIComponent(value) || null : null;
  };

  const getSourceFromUrl = (): UserSource | null => {
    if (!isWindow) return null;

    const url = new URL(urlString);
    const referrer = document.referrer || "direct";

    const source: UserSource = {
      urlPath: url.pathname + url.search,
      referrer,
      utmSource: getUtmParamFromUrl("utm_source"),
      utmMedium: getUtmParamFromUrl("utm_medium"),
      utmCampaign: getUtmParamFromUrl("utm_campaign"),
      utmTerm: getUtmParamFromUrl("utm_term"),
      utmContent: getUtmParamFromUrl("utm_content"),
    };

    return source;
  };

  const getParamsFromStorage = (): UserSource | null => {
    const stored = localStorage.getItem(SOURCE_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserSource;
    } catch {
      return null;
    }
  };

  const initUserSource = () => {
    const sourceFromStorage = getParamsFromStorage();
    if (sourceFromStorage) {
      setUserSource(sourceFromStorage);
      return;
    }

    const sourceFromUrl = getSourceFromUrl();
    if (sourceFromUrl) {
      localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(sourceFromUrl));
      setUserSource(sourceFromUrl);
    }
  };

  useEffect(() => {
    initUserSource();
  }, [urlString, isWindow]);

  return {
    userSource,
    getParamsFromStorage,
  };
}

export function UserSourceProvider({ children }: { children: ReactNode }) {
  const hook = useProvideUserSource();
  return <UserSourceContext.Provider value={hook}>{children}</UserSourceContext.Provider>;
}

export const useUserSource = (): UserSourceContextType => {
  const context = useContext(UserSourceContext);
  if (!context) {
    throw new Error("useUserSource must be used within a UserSourceProvider");
  }
  return context;
};
