/**
 * @jest-environment jsdom
 */
import { findScrollParent } from './findScrollParent';

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
