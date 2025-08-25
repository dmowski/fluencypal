"use client";

import { createContext, useContext, ReactNode, JSX, useState, useEffect } from "react";
import { PageType } from "./types";
import { useRouter, useSearchParams } from "next/navigation";
import { scrollTop } from "@/libs/scroll";

interface AppNavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  isLoading: boolean;
  pageUrl: (page: PageType) => string;
}

const AppNavigationContext = createContext<AppNavigationContextType | null>(null);

function useProvideAppNavigation(): AppNavigationContextType {
  const [internalValue, setInternalValue] = useState<PageType>("home");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page") as PageType | null;
  const router = useRouter();

  const pageUrl = (page: PageType) => {
    const searchParamsNew = new URLSearchParams(searchParams.toString());
    searchParamsNew.set("page", page);
    return `${window.location.pathname}?${searchParamsNew.toString()}`;
  };

  useEffect(() => {
    if (urlPage && urlPage !== internalValue) {
      setInternalValue(urlPage);
      return;
    }
  }, [urlPage]);

  const setValue = (value: PageType) => {
    setInternalValue(value);
    const isDefault = value === "home";

    setTimeout(() => {
      setIsLoading(true);

      const searchParams = new URLSearchParams(window.location.search);
      if (!isDefault) {
        searchParams.set("page", value);
      } else {
        searchParams.delete("page");
      }
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

      router.push(`${newUrl}`, { scroll: false });
      scrollTop();

      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, 20);
  };

  return {
    currentPage: internalValue,
    setCurrentPage: setValue,
    pageUrl,
    isLoading,
  };
}

export function AppNavigationProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAppNavigation();
  return <AppNavigationContext.Provider value={hook}>{children}</AppNavigationContext.Provider>;
}

export const useAppNavigation = (): AppNavigationContextType => {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error("useAppNavigation must be used within a AppNavigationProvider");
  }
  return context;
};
