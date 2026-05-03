import { findFirstTextNode, findLastTextNode } from './textNodeTraversal';

export const applyNativeSelectionForWordElement = (element: HTMLElement | null): void => {
  if (!element) return;

  const textStart = findFirstTextNode(element);
  const textEnd = findLastTextNode(element);
  if (!textStart || !textEnd) return;

  const range = document.createRange();
  range.setStart(textStart, 0);
  range.setEnd(textEnd, textEnd.textContent?.length ?? 0);
  const domSelection = window.getSelection();
  domSelection?.removeAllRanges();
  domSelection?.addRange(range);
};

export const applyNativeSelectionByOffsets = ({
  paragraphElement,
  startInclusive,
  endExclusive,
}: {
  paragraphElement: HTMLElement | null;
  startInclusive: number;
  endExclusive: number;
}): boolean => {
  if (!paragraphElement) return false;

  const startElement = paragraphElement.querySelector<HTMLElement>(
    `[data-char-offset="${startInclusive}"]`,
  );
  const endElement = paragraphElement.querySelector<HTMLElement>(
    `[data-char-offset="${Math.max(endExclusive - 1, startInclusive)}"]`,
  );
  if (!startElement || !endElement) return false;

  const textStart = findFirstTextNode(startElement);
  const textEnd = findLastTextNode(endElement);
  if (!textStart || !textEnd) return false;

  const range = document.createRange();
  range.setStart(textStart, 0);
  range.setEnd(textEnd, textEnd.textContent?.length ?? 0);

  const domSelection = window.getSelection();
  domSelection?.removeAllRanges();
  domSelection?.addRange(range);

  return true;
};

export const applyNativeSelectionByText = ({
  paragraphElement,
  selectedValue,
  startHint,
}: {
  paragraphElement: HTMLElement | null;
  selectedValue: string;
  startHint?: number;
}): boolean => {
  if (!selectedValue || !paragraphElement) {
    return false;
  }

  const fullText = paragraphElement.textContent ?? '';
  if (!fullText.length) {
    return false;
  }

  const occurrences: number[] = [];
  let searchFrom = 0;
  while (searchFrom <= fullText.length) {
    const index = fullText.indexOf(selectedValue, searchFrom);
    if (index < 0) break;
    occurrences.push(index);
    searchFrom = index + 1;
  }

  if (occurrences.length === 0) {
    return false;
  }

  const targetStart =
    typeof startHint === 'number'
      ? occurrences.reduce((best, current) =>
          Math.abs(current - startHint) < Math.abs(best - startHint) ? current : best,
        )
      : occurrences[0];
  const targetEndExclusive = targetStart + selectedValue.length;

  const walker = document.createTreeWalker(paragraphElement, NodeFilter.SHOW_TEXT);
  const segments: Array<{ node: Text; start: number; end: number }> = [];
  let cursor = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const content = node.textContent ?? '';
    if (!content.length) {
      continue;
    }

    const start = cursor;
    const end = cursor + content.length;
    segments.push({ node, start, end });
    cursor = end;
  }

  const startSegment = segments.find(
    (segment) => segment.start <= targetStart && targetStart < segment.end,
  );
  const endSegment = segments.find(
    (segment) => segment.start < targetEndExclusive && targetEndExclusive <= segment.end,
  );

  if (!startSegment || !endSegment) {
    return false;
  }

  const range = document.createRange();
  range.setStart(startSegment.node, targetStart - startSegment.start);
  range.setEnd(endSegment.node, targetEndExclusive - endSegment.start);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  return true;
};
