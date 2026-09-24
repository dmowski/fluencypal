export const scrollTopFast = () => {
  window.scrollTo(0, 0);
};

export const scrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const scrollToLangButton = (langCode: string) => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) return;

  const element = document.querySelector(`button[aria-label='${langCode}']`);
  if (!(element instanceof HTMLElement)) return;

  // scrollIntoView recurses until iOS WebKit throws Maximum call stack size exceeded.
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2;
  window.scrollTo(0, Math.max(0, top));
};
