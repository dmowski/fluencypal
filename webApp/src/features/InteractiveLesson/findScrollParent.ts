export const findScrollParent = (anchor: HTMLElement | null): HTMLElement | null => {
  let el: HTMLElement | null = anchor;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
};

export const scrollElementToStart = (element: HTMLElement | null): void => {
  if (!element) return;
  const scrollEl = findScrollParent(element);
  if (scrollEl) {
    const offset = element.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top;
    scrollEl.scrollTo({
      top: scrollEl.scrollTop + offset,
      behavior: 'smooth',
    });
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
