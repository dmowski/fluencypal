/**
 * @jest-environment jsdom
 */
import { scheduleSelectionRestore } from './selectionRestoreObserver';
import type { RawSelectionRange } from './selectionPipeline';

const buildParagraphWithChars = (text: string): HTMLElement => {
  const paragraph = document.createElement('div');
  for (let i = 0; i < text.length; i += 1) {
    const span = document.createElement('span');
    span.setAttribute('data-char-offset', String(i));
    span.textContent = text[i];
    paragraph.appendChild(span);
  }
  document.body.innerHTML = '';
  document.body.appendChild(paragraph);
  return paragraph;
};

const collapseSelection = () => {
  window.getSelection()?.removeAllRanges();
};

const range = (start: number, end: number, text: string): RawSelectionRange => ({
  startInclusive: start,
  endExclusive: end,
  text,
});

describe('scheduleSelectionRestore', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    collapseSelection();
  });

  it('applies the selection synchronously and disposes when already correct', () => {
    const paragraphElement = buildParagraphWithChars('hello world');
    const cancel = scheduleSelectionRestore({
      paragraphElement,
      range: range(0, 5, 'hello'),
    });

    expect(window.getSelection()?.toString()).toBe('hello');
    // Calling cancel after auto-dispose must be idempotent.
    expect(() => cancel()).not.toThrow();
  });

  it('re-applies the selection after a paragraph subtree mutation', async () => {
    const paragraphElement = buildParagraphWithChars('hello world');
    scheduleSelectionRestore({
      paragraphElement,
      range: range(6, 11, 'world'),
    });
    expect(window.getSelection()?.toString()).toBe('world');

    // Simulate React re-render: collapse selection then mutate the subtree.
    collapseSelection();
    expect(window.getSelection()?.toString()).toBe('');

    const extra = document.createElement('span');
    extra.textContent = '!';
    paragraphElement.appendChild(extra);

    // MutationObserver callback is microtask-scheduled.
    await Promise.resolve();
    await Promise.resolve();

    expect(window.getSelection()?.toString()).toBe('world');
  });

  it('re-applies the selection when an external selectionchange clears it', () => {
    const paragraphElement = buildParagraphWithChars('hello world');
    scheduleSelectionRestore({
      paragraphElement,
      range: range(0, 5, 'hello'),
    });
    expect(window.getSelection()?.toString()).toBe('hello');

    collapseSelection();
    document.dispatchEvent(new Event('selectionchange'));

    expect(window.getSelection()?.toString()).toBe('hello');
  });

  it('disposes after maxDurationMs and stops responding to mutations', () => {
    jest.useFakeTimers();
    try {
      const paragraphElement = buildParagraphWithChars('hello');
      scheduleSelectionRestore({
        paragraphElement,
        range: range(0, 5, 'hello'),
        maxDurationMs: 100,
      });

      // Force the observer to remain active by clearing the selection so the
      // initial-apply success branch does not auto-dispose.
      collapseSelection();
      document.dispatchEvent(new Event('selectionchange'));
      // selectionchange handler will reapply and self-dispose; clear again to
      // simulate a slow external clearer that races past the safety timeout.
      collapseSelection();

      jest.advanceTimersByTime(150);

      // After dispose, mutations must NOT trigger re-apply.
      const extra = document.createElement('span');
      paragraphElement.appendChild(extra);
      document.dispatchEvent(new Event('selectionchange'));

      expect(window.getSelection()?.toString()).toBe('');
    } finally {
      jest.useRealTimers();
    }
  });

  it('cancel() disposes immediately and prevents further re-apply', async () => {
    const paragraphElement = buildParagraphWithChars('hello world');
    const cancel = scheduleSelectionRestore({
      paragraphElement,
      range: range(6, 11, 'world'),
    });
    cancel();
    collapseSelection();
    document.dispatchEvent(new Event('selectionchange'));

    const extra = document.createElement('span');
    paragraphElement.appendChild(extra);
    await Promise.resolve();

    expect(window.getSelection()?.toString()).toBe('');
  });
});
