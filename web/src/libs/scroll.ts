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
  if (element) {
    element.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
};
