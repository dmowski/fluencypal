"use client";
import { useSignal, viewportContentSafeAreaInsetTop } from "@telegram-apps/sdk-react";
import { createContext, useContext, ReactNode, JSX } from "react";

interface WindowSizesContextType {
  topOffset: string;
}

const WindowSizesContext = createContext<WindowSizesContextType | null>(null);

function useProvideWindowSizes(): WindowSizesContextType {
  const safeTop = useSignal(viewportContentSafeAreaInsetTop);
  const topOffset = safeTop ? `${safeTop + 80}px` : "0px";

  return {
    topOffset,
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
