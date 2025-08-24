"use client";
import {
  useSignal,
  viewportContentSafeAreaInsetTop,
  viewportSafeAreaInsetTop,
  viewportContentSafeAreaInsetBottom,
  viewportSafeAreaInsetBottom,
} from "@telegram-apps/sdk-react";
import { createContext, useContext, ReactNode, JSX } from "react";

interface WindowSizesContextType {
  topOffset: string;
  bottomOffset: string;
}

const WindowSizesContext = createContext<WindowSizesContextType | null>(null);

function useProvideWindowSizes(): WindowSizesContextType {
  const contentSafeTop = useSignal(viewportContentSafeAreaInsetTop);
  const safeAreaInsetTop = useSignal(viewportSafeAreaInsetTop);

  const contentSafeBottom = useSignal(viewportContentSafeAreaInsetBottom);
  const safeAreaInsetBottom = useSignal(viewportSafeAreaInsetBottom);

  const combinedOffset = contentSafeTop + safeAreaInsetTop;
  const topOffset = combinedOffset ? `${combinedOffset + 0}px` : "0px";

  const combinedBottomOffset = contentSafeBottom + safeAreaInsetBottom;
  const bottomOffset = combinedBottomOffset ? `${combinedBottomOffset + 0}px` : "0px";

  return {
    topOffset,
    bottomOffset,
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
