"use client";
import {
  useSignal,
  viewportContentSafeAreaInsetTop,
  viewportSafeAreaInsetTop,
} from "@telegram-apps/sdk-react";
import { createContext, useContext, ReactNode, JSX } from "react";

interface WindowSizesContextType {
  topOffset: string;
  topOffset2: string;
}

const WindowSizesContext = createContext<WindowSizesContextType | null>(null);

function useProvideWindowSizes(): WindowSizesContextType {
  const navbarHeight = useSignal(viewportContentSafeAreaInsetTop);
  const safeAreaInsetTop = useSignal(viewportSafeAreaInsetTop);
  const topOffset = navbarHeight ? `${navbarHeight + 0}px` : "0px";
  const topOffset2 = safeAreaInsetTop ? `${safeAreaInsetTop + 0}px` : "0px";

  return {
    topOffset,
    topOffset2,
  };
}

export function WindowSizesProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideWindowSizes();
  return <WindowSizesContext.Provider value={hook}>{children}</WindowSizesContext.Provider>;
}

export const useWindowSizes = (): WindowSizesContextType => {
  const context = useContext(WindowSizesContext);
  if (!context) {
    throw new Error("useWindowSizes must be used within a WindowSizesProvider");
  }
  return context;
};
