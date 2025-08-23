import { isTMA, isViewportExpanded } from "@telegram-apps/sdk-react";
const isTelegramApp = isTMA();

export const useWindowSizes = () => {
  const topOffset = isTelegramApp && isViewportExpanded() ? "90px" : "0";

  return {
    topOffset,
  };
};
