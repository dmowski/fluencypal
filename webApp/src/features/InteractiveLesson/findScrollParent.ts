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
