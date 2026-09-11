/**
 * @jest-environment jsdom
 */
import { findScrollParent, scrollElementToStart } from './findScrollParent';

const rect = (top: number): DOMRect =>
  ({
    top,
    bottom: top + 20,
    left: 0,
    right: 100,
    width: 100,
    height: 20,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

describe('findScrollParent', () => {
  it('returns the nearest overflow scroll ancestor', () => {
    const parent = document.createElement('div');
    parent.style.overflowY = 'auto';
    Object.defineProperty(parent, 'scrollHeight', { value: 400 });
    Object.defineProperty(parent, 'clientHeight', { value: 200 });

    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(findScrollParent(child)).toBe(parent);
    parent.remove();
  });

  it('returns null when nothing scrolls', () => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    expect(findScrollParent(child)).toBeNull();
    child.remove();
  });
});

describe('scrollElementToStart', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrolls the overflow parent so the element is at the top', () => {
    const parent = document.createElement('div');
    parent.style.overflowY = 'auto';
    Object.defineProperty(parent, 'scrollHeight', { value: 800 });
    Object.defineProperty(parent, 'clientHeight', { value: 200 });
    parent.scrollTop = 100;
    const scrollTo = jest.fn();
    parent.scrollTo = scrollTo as typeof parent.scrollTo;

    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    jest.spyOn(child, 'getBoundingClientRect').mockReturnValue(rect(300));
    jest.spyOn(parent, 'getBoundingClientRect').mockReturnValue(rect(0));

    scrollElementToStart(child);

    expect(scrollTo).toHaveBeenCalledWith({ top: 400, behavior: 'smooth' });
    parent.remove();
  });

  it('falls back to scrollIntoView when nothing scrolls', () => {
    const child = document.createElement('div');
    const scrollIntoView = jest.fn();
    child.scrollIntoView = scrollIntoView;
    document.body.appendChild(child);

    scrollElementToStart(child);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    child.remove();
  });
});
