'use client';
import {
  useSignal,
  viewportContentSafeAreaInsetTop,
  viewportSafeAreaInsetTop,
  viewportContentSafeAreaInsetBottom,
  viewportSafeAreaInsetBottom,
} from '@telegram-apps/sdk-react';
import { createContext, useContext, ReactNode, JSX, useState, useEffect } from 'react';

const DEFAULT_TOP = '0px';
const DEFAULT_BOTTOM = '0px';

interface WindowSizesContextType {
  topOffset: string;
  bottomOffset: string;
}

const WindowSizesContext = createContext<WindowSizesContextType | null>(null);

function useProvideWindowSizes(): WindowSizesContextType {
  const contentSafeTop = useSignal(viewportContentSafeAreaInsetTop);
  const safeAreaInsetTop = useSignal(viewportSafeAreaInsetTop);

  const [isAllowApply, setIsAllowApply] = useState(false);

  const contentSafeBottom = useSignal(viewportContentSafeAreaInsetBottom);
  const safeAreaInsetBottom = useSignal(viewportSafeAreaInsetBottom);

  useEffect(() => {
    setTimeout(() => {
      setIsAllowApply(true);
    }, 90);
  }, []);

  const combinedOffset = contentSafeTop + safeAreaInsetTop;
  const topOffset = isAllowApply && combinedOffset ? `${combinedOffset + 0}px` : DEFAULT_TOP;

  const combinedBottomOffset = contentSafeBottom + safeAreaInsetBottom;
  const bottomOffset =
    isAllowApply && combinedBottomOffset ? `${combinedBottomOffset + 0}px` : DEFAULT_BOTTOM;

  return {
    topOffset,
    //topOffset: "120px",
    //bottomOffset: "20px",
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
    throw new Error('useWindowSizes must be used within a WindowSizesProvider');
  }
  return context;
};
