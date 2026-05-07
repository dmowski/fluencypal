import { normalizeSelectedText } from './normalizeReaderSelectedText';
import { applySelection, type RawSelectionRange } from './selectionPipeline';

const DEFAULT_MAX_DURATION_MS = 500;

const matchesExpectedSelection = (expected: string): boolean => {
  if (typeof window === 'undefined') return false;
  return normalizeSelectedText(window.getSelection()?.toString()) === expected;
};

/**
 * Phase 4 single-shot selection restore.
 *
 * Replaces the legacy `requestAnimationFrame + setTimeout(60/180/350)` chain
 * with two reactive triggers:
 *
 *   1. A `MutationObserver` on the paragraph subtree — re-applies the selection
 *      if React re-renders the spans we anchored to.
 *   2. A `selectionchange` listener — re-applies whenever the native selection
 *      drifts (e.g. MUI Modal's focus trap briefly collapsing it onto the
 *      popover paper).
 *
 * Both triggers stop after the first successful re-apply. A single safety
 * `setTimeout` disconnects the listeners after `maxDurationMs` so they cannot
 * leak across paragraphs.
 *
 * Returns a `cancel()` function that disconnects everything immediately.
 */
export const scheduleSelectionRestore = ({
  paragraphElement,
  range,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  fallbackElement,
}: {
  paragraphElement: HTMLElement | null;
  range: RawSelectionRange;
  maxDurationMs?: number;
  fallbackElement?: HTMLElement | null;
}): (() => void) => {
  if (typeof window === 'undefined' || !paragraphElement) {
    return () => {};
  }

  let disposed = false;
  let observer: MutationObserver | null = null;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    observer = null;
    document.removeEventListener('selectionchange', handleSelectionChange);
    if (safetyTimer !== null) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
  };

  const reapply = () => {
    if (disposed) return;
    if (matchesExpectedSelection(range.text)) return;
    applySelection({ paragraphElement, range, fallbackElement });
  };

  function handleSelectionChange() {
    reapply();
  }

  // Initial synchronous apply.
  applySelection({ paragraphElement, range, fallbackElement });

  // Always install the watchers for the full window: even if the initial apply
  // succeeded, the popover's mount transition can collapse the native selection
  // later (MUI Modal focus trap) or React can re-render the anchor spans.
  observer = new MutationObserver(() => reapply());
  observer.observe(paragraphElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  document.addEventListener('selectionchange', handleSelectionChange);
  safetyTimer = setTimeout(dispose, maxDurationMs);

  return dispose;
};
