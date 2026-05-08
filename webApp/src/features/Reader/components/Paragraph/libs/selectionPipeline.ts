import { getAbsoluteCharOffset, getRangeCharOffsets } from './absoluteCharOffsetFromDomPoint';
import { normalizeSelectedText } from './normalizeReaderSelectedText';
import type { ParagraphTokenMap } from './paragraphTokenMap';
import { reconcileSelectionOffsets } from './selectionOffsetReconciliation';
import {
  applyNativeSelectionByOffsets,
  applyNativeSelectionByText,
  applyNativeSelectionForWordElement,
} from './selectionDomRestore';
import { getWordCharOffsets } from './selectionOffsetFromWordList';

/**
 * Unified selection pipeline.
 *
 * All selection-touching call sites in the Reader (drag select, word click,
 * hover, popover color apply) consume this module so that reconciliation lives
 * in exactly one place.
 *
 * Conventions:
 * - `RawSelectionRange.endExclusive` is exclusive (matches DOM `Range.endOffset`).
 * - The corresponding `HighlightedText.endIndex` is inclusive; conversion happens
 *   in `rangeToHighlightOffsets`.
 */
export interface RawSelectionRange {
  startInclusive: number;
  endExclusive: number;
  text: string;
}

/**
 * Capture the current native selection inside a paragraph element and translate
 * it to paragraph-relative character offsets using DOM range info. Returns null
 * when the selection is empty or cannot be resolved to char offsets.
 */
export const captureCurrentSelection = ({
  paragraphElement,
  words,
}: {
  paragraphElement: HTMLElement | null;
  words: string[];
}): { range: RawSelectionRange; rect: DOMRect } | null => {
  if (!paragraphElement) return null;

  const sel = typeof window === 'undefined' ? null : window.getSelection();
  const text = normalizeSelectedText(sel?.toString());
  if (!text) return null;

  const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
  if (!range) return null;

  const rect = range.getBoundingClientRect();
  const direct = getRangeCharOffsets(range, paragraphElement);
  if (direct) {
    return {
      range: {
        startInclusive: direct.startInclusive,
        endExclusive: direct.endExclusive,
        text,
      },
      rect,
    };
  }

  const wordCharOffsets = getWordCharOffsets(words);
  const startFromDom = getAbsoluteCharOffset(
    range.startContainer,
    range.startOffset,
    wordCharOffsets,
  );
  const endFromDom = getAbsoluteCharOffset(range.endContainer, range.endOffset, wordCharOffsets);
  if (startFromDom == null || endFromDom == null) return null;

  const startInclusive = Math.min(startFromDom, endFromDom);
  const endExclusive = Math.max(startFromDom, endFromDom);
  if (endExclusive <= startInclusive) return null;

  return {
    range: { startInclusive, endExclusive, text },
    rect,
  };
};

/**
 * Reconcile a raw selection range against the paragraph token map's source
 * text. Returns null when reconciliation fails (e.g. empty selection text).
 *
 * The token map is currently used for its `paragraphText`. Future phases may
 * lean on token-aware lookups for cases that the heuristic reconciler cannot
 * resolve unambiguously.
 */
export const reconcileSelection = (
  raw: RawSelectionRange,
  tokenMap: ParagraphTokenMap,
): RawSelectionRange | null => {
  const reconciled = reconcileSelectionOffsets({
    paragraphText: tokenMap.paragraphText,
    selectedText: raw.text,
    rawStart: raw.startInclusive,
    rawEnd: raw.endExclusive,
  });
  if (!reconciled) return null;

  return {
    startInclusive: reconciled.startInclusive,
    endExclusive: reconciled.endExclusive,
    text: raw.text,
  };
};

/**
 * Apply a reconciled selection range to the DOM. Returns true when the native
 * selection ends up matching the requested text. Strategies are tried in order:
 *   1. Already correct -> no-op.
 *   2. By data-char-offset spans.
 *   3. By text-content occurrence (closest to startInclusive).
 *   4. Re-apply by data-char-offset (correct any drift caused by step 3).
 *   5. Optional fallback: select the entire word element (used by clicks).
 */
export const applySelection = ({
  paragraphElement,
  range,
  fallbackElement,
}: {
  paragraphElement: HTMLElement | null;
  range: RawSelectionRange;
  fallbackElement?: HTMLElement | null;
}): boolean => {
  if (!paragraphElement) return false;

  const matches = (): boolean =>
    normalizeSelectedText(window.getSelection()?.toString()) === range.text;

  if (matches()) return true;

  applyNativeSelectionByOffsets({
    paragraphElement,
    startInclusive: range.startInclusive,
    endExclusive: range.endExclusive,
  });
  if (matches()) return true;

  const restoredByText = applyNativeSelectionByText({
    paragraphElement,
    selectedValue: range.text,
    startHint: range.startInclusive,
  });
  if (restoredByText && matches()) return true;

  applyNativeSelectionByOffsets({
    paragraphElement,
    startInclusive: range.startInclusive,
    endExclusive: range.endExclusive,
  });
  if (matches()) return true;

  if (fallbackElement) {
    applyNativeSelectionForWordElement(fallbackElement);
    return matches();
  }

  return false;
};

/**
 * Convert a paragraph-relative `RawSelectionRange` into the inclusive
 * `HighlightedText` offset pair (`startIndex`, `endIndex`) used everywhere
 * outside the selection pipeline.
 */
export const rangeToHighlightOffsets = (
  range: { startInclusive: number; endExclusive: number },
  paragraphStartCharOffset: number,
): { startIndex: number; endIndex: number } => ({
  startIndex: range.startInclusive + paragraphStartCharOffset,
  endIndex: range.endExclusive - 1 + paragraphStartCharOffset,
});
