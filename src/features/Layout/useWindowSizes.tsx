import { useSignal, viewportContentSafeAreaInsetTop } from "@telegram-apps/sdk-react";

export const useWindowSizes = () => {
  const safeTop = useSignal(viewportContentSafeAreaInsetTop);
  const topOffset = safeTop ? `${safeTop + 20}px` : "0px";

  return {
    topOffset,
  };
};
