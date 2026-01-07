export const isActiveBrowserTab = (): boolean => {
  const isWindow = typeof window !== "undefined";
  if (!isWindow) return false;

  return document.visibilityState === "visible";
};
