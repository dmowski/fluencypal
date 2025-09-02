"use client";

import { createContext, useContext, ReactNode, JSX } from "react";
import { PageType } from "./types";
import { useUrlState } from "../Url/useUrlParam";

interface AppNavigationContextType {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  isLoading: boolean;
  pageUrl: (page: PageType) => string;
}

const AppNavigationContext = createContext<AppNavigationContextType | null>(null);

function useProvideAppNavigation(): AppNavigationContextType {
  const [internalValue, setValue, isLoading] = useUrlState("page", "home");

  const pageUrl = (page: PageType) => {
    const searchParamsNew = new URLSearchParams(window.location.search);
    searchParamsNew.set("page", page);
    return `${window.location.pathname}?${searchParamsNew.toString()}`;
  };

  return {
    currentPage: internalValue as PageType,
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
