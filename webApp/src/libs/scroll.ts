export const scrollTopFast = () => {
  window.scrollTo(0, 0);
};

export const scrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const scrollToLangButton = async (langCode: string) => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) return;

  const element = document.querySelector(`button[aria-label='${langCode}']`);
  if (!element) return;
  try {
    element.scrollIntoView({ block: 'center' });
  } catch {
    // iOS WebKit can kill the tab on scrollIntoView options. A failed scroll is not worth a crash.
  }
};
