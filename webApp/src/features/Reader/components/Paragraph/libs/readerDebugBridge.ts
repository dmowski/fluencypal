/**
 * Phase 5 debug bridge: exposes a small, read-only `window.__reader__` API for
 * Playwright + DevTools so external tooling can inspect Reader paragraph state
 * without scraping arbitrary DOM. The bridge only reads from the DOM (no
 * mutations, no network, no auth-sensitive data), so it is safe to enable in
 * every environment including production.
 *
 * Available methods:
 *   - dumpParagraphTokenMap(paragraphIndex): structured snapshot of one paragraph
 *   - dumpAllParagraphs(): structured snapshot of every visible paragraph
 *   - getCurrentSelection(): the current native selection text + range bounds
 *   - assertInvariants(): walks the DOM and returns invariant violations
 */

interface ParagraphSnapshot {
  paragraphIndex: number;
  paragraphStartCharOffset: number | null;
  tokenCount: number | null;
  sourceTextLength: number | null;
  tokenMapViolation: string | null;
  charOffsets: number[];
  text: string;
  tokens: Array<{
    kind: string | null;
    sourceStart: number | null;
    sourceEndExclusive: number | null;
    wordSourceIndex: number | null;
    text: string;
  }>;
}

interface InvariantReport {
  paragraphIndex: number;
  duplicateOffsets: number[];
  firstNonMonotonicAt: number | null;
  tokenMapViolation: string | null;
  missingDebugAttrs: boolean;
}

interface CurrentSelectionInfo {
  text: string;
  paragraphIndex: number | null;
  paragraphStartCharOffset: number | null;
  startOffsetWithinParagraph: number | null;
  endOffsetExclusiveWithinParagraph: number | null;
}

const collectParagraphRoots = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-reader-paragraph-start-offset]'));

const numAttr = (el: Element, name: string): number | null => {
  const raw = el.getAttribute(name);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

const snapshotParagraph = (root: HTMLElement, paragraphIndex: number): ParagraphSnapshot => {
  const charSpans = Array.from(root.querySelectorAll<HTMLElement>('[data-char-offset]'));
  const charOffsets = charSpans.map((el) => Number(el.getAttribute('data-char-offset')));
  const tokenSpans = Array.from(root.querySelectorAll<HTMLElement>('[data-reader-token-kind]'));
  return {
    paragraphIndex,
    paragraphStartCharOffset: numAttr(root, 'data-reader-paragraph-start-offset'),
    tokenCount: numAttr(root, 'data-reader-paragraph-token-count'),
    sourceTextLength: numAttr(root, 'data-reader-paragraph-source-text-length'),
    tokenMapViolation: root.getAttribute('data-reader-invariant-violation'),
    charOffsets,
    text: root.textContent ?? '',
    tokens: tokenSpans.map((el) => ({
      kind: el.getAttribute('data-reader-token-kind'),
      sourceStart: numAttr(el, 'data-reader-token-source-start'),
      sourceEndExclusive: numAttr(el, 'data-reader-token-source-end-exclusive'),
      wordSourceIndex: numAttr(el, 'data-reader-word-source-index'),
      text: el.textContent ?? '',
    })),
  };
};

const computeInvariantReport = (root: HTMLElement, paragraphIndex: number): InvariantReport => {
  const offsets = Array.from(root.querySelectorAll<HTMLElement>('[data-char-offset]')).map((el) =>
    Number(el.getAttribute('data-char-offset')),
  );
  const counts = new Map<number, number>();
  offsets.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  const duplicateOffsets: number[] = [];
  counts.forEach((count, value) => {
    if (count > 1) duplicateOffsets.push(value);
  });
  duplicateOffsets.sort((a, b) => a - b);

  let firstNonMonotonicAt: number | null = null;
  for (let i = 1; i < offsets.length; i += 1) {
    if (offsets[i] < offsets[i - 1]) {
      firstNonMonotonicAt = i;
      break;
    }
  }

  return {
    paragraphIndex,
    duplicateOffsets,
    firstNonMonotonicAt,
    tokenMapViolation: root.getAttribute('data-reader-invariant-violation'),
    missingDebugAttrs:
      root.getAttribute('data-reader-paragraph-token-count') === null ||
      root.getAttribute('data-reader-paragraph-source-text-length') === null,
  };
};

export interface ReaderDebugBridge {
  dumpParagraphTokenMap: (paragraphIndex: number) => ParagraphSnapshot | null;
  dumpAllParagraphs: () => ParagraphSnapshot[];
  getCurrentSelection: () => CurrentSelectionInfo;
  assertInvariants: () => InvariantReport[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __reader__?: ReaderDebugBridge;
  }
}

export const installReaderDebugBridge = () => {
  if (typeof window === 'undefined') return;
  if (window.__reader__) return;

  window.__reader__ = {
    dumpParagraphTokenMap: (paragraphIndex) => {
      const roots = collectParagraphRoots();
      const root = roots[paragraphIndex];
      return root ? snapshotParagraph(root, paragraphIndex) : null;
    },
    dumpAllParagraphs: () =>
      collectParagraphRoots().map((root, index) => snapshotParagraph(root, index)),
    getCurrentSelection: () => {
      const sel = window.getSelection();
      const text = sel?.toString() ?? '';
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
      const paragraphRoot = range
        ? (range.startContainer.parentElement?.closest<HTMLElement>(
            '[data-reader-paragraph-start-offset]',
          ) ?? null)
        : null;
      const roots = collectParagraphRoots();
      const paragraphIndex = paragraphRoot ? roots.indexOf(paragraphRoot) : -1;

      const offsetFromContainer = (container: Node | null | undefined): number | null => {
        if (!container) return null;
        const parent = container instanceof Element ? container : (container.parentElement ?? null);
        const charEl = parent?.closest<HTMLElement>('[data-char-offset]') ?? null;
        return charEl ? numAttr(charEl, 'data-char-offset') : null;
      };

      const startInParagraph = range ? offsetFromContainer(range.startContainer) : null;
      const endInclusive = range ? offsetFromContainer(range.endContainer) : null;

      return {
        text,
        paragraphIndex: paragraphIndex >= 0 ? paragraphIndex : null,
        paragraphStartCharOffset: paragraphRoot
          ? numAttr(paragraphRoot, 'data-reader-paragraph-start-offset')
          : null,
        startOffsetWithinParagraph: startInParagraph,
        endOffsetExclusiveWithinParagraph: endInclusive === null ? null : endInclusive + 1,
      };
    },
    assertInvariants: () =>
      collectParagraphRoots()
        .map((root, index) => computeInvariantReport(root, index))
        .filter(
          (report) =>
            report.duplicateOffsets.length > 0 ||
            report.firstNonMonotonicAt !== null ||
            report.tokenMapViolation !== null ||
            report.missingDebugAttrs,
        ),
  };
};
