import { Stack, Typography } from '@mui/material';
import { memo, MouseEvent, useMemo, useRef } from 'react';
import { createSelectionFromRange } from './libs/selectionHighlightRange';
import { getWordCharOffsets } from './libs/selectionOffsetFromWordList';
import { normalizeSelectedText } from './libs/normalizeReaderSelectedText';
import { HighlightedText } from '../../model/types';
import { ReaderMarkdown } from './ReaderMarkdown';
import { getPopoverPositionFromRect } from './libs/popoverAnchorPosition';
import { buildParagraphTokenMap, validateParagraphTokenMap } from './libs/paragraphTokenMap';
import { getCoreWordSelectionMeta } from './libs/coreWordSelectionMeta';
import {
  getReaderParagraphTextIndent,
  hasBlockMarkdownFormatting,
} from '../../utils/readerParagraphFormatting';
import {
  applySelection,
  captureCurrentSelection,
  rangeToHighlightOffsets,
  reconcileSelection,
  type RawSelectionRange,
} from './libs/selectionPipeline';
import { scheduleSelectionRestore } from './libs/selectionRestoreObserver';
import { installReaderDebugBridge } from './libs/readerDebugBridge';
import { getCharHighlightColor as getCharColorAtOffset } from './libs/highlightColorAtCharOffset';

// Phase 5 debug surface: idempotent install of `window.__reader__` for DevTools
// + Playwright. Read-only DOM dump; safe in every environment.
installReaderDebugBridge();

export interface ReaderParagraphSelectionPayload {
  paragraphIndex: number;
  selection: HighlightedText;
  selectionText: string;
  anchorPosition: {
    top: number;
    left: number;
  };
}

export interface ReaderParagraphHoverPayload {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
}

interface ReaderParagraphProps {
  paragraphIndex: number;
  paragraphStartCharOffset: number;
  words: string[];
  imagesByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
  maxImageHeight?: number;
  fontSize: number;
  lineHeight: number;
  justifyText: boolean;
  playText: (word: string) => void;
  onSelection: (payload: ReaderParagraphSelectionPayload) => void;
  highlights: HighlightedText[];
  onWordHover?: (word: string, e: MouseEvent<HTMLElement>) => void | Promise<void>;
  onWordHoverInfo?: (payload: ReaderParagraphHoverPayload) => void;
  onWordMouseMove?: (e: MouseEvent<HTMLElement>) => void;
  onHoverClear?: () => void;
  getInternalChapterTargetPage?: (href: string) => number | null;
  onInternalChapterLinkSelect?: (targetPage: number) => void;
  resizeAnchorWordStartCharOffset?: number | null;
  isResizeAnchorHighlightVisible?: boolean;
}

const ReaderParagraphBase = ({
  paragraphIndex,
  paragraphStartCharOffset,
  words,
  imagesByHref,
  imageAspectRatioByHref,
  maxImageHeight,
  fontSize,
  lineHeight,
  justifyText,
  playText,
  onSelection,
  highlights,
  onWordHover,
  onWordHoverInfo,
  onWordMouseMove,
  onHoverClear,
  getInternalChapterTargetPage,
  onInternalChapterLinkSelect,
  resizeAnchorWordStartCharOffset,
  isResizeAnchorHighlightVisible,
}: ReaderParagraphProps) => {
  const paragraphText = words.join(' ');
  const isParagraphStart = paragraphStartCharOffset === 0;
  const hasMarkdownLinkOrImage = /(!\[[^\]]*\]\([^\)]*\)|\[[^\]]+\]\([^\)]*\))/u.test(
    paragraphText,
  );
  const hasMarkdownEmphasis =
    /(^|[^\p{L}\p{N}_*])((\*\*[^*\n](?:[^*\n]*[^*\n])?\*\*)|(\*[^*\n]+\*)|(__[^_\n](?:[^_\n]*[^_\n])?__)|(_[^_\n]+_))(?=$|[^\p{L}\p{N}_*])/u.test(
      paragraphText,
    );
  const hasInlineMarkdownFormatting = hasMarkdownLinkOrImage || hasMarkdownEmphasis;
  const hasBlockMarkdown = hasBlockMarkdownFormatting(paragraphText);
  const shouldRenderMarkdown = hasInlineMarkdownFormatting || hasBlockMarkdown;
  const paragraphTextIndent = getReaderParagraphTextIndent({
    paragraphText,
    isParagraphStart,
  });

  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => getWordCharOffsets(words), [words]);
  const paragraphRef = useRef<HTMLDivElement | null>(null);
  const cancelSelectionRestoreRef = useRef<(() => void) | null>(null);

  // Phase 1 (read-only): build the per-paragraph rendered token map and expose it
  // via debug data attributes. The renderer does not consume it yet.
  const paragraphTokenMap = useMemo(() => buildParagraphTokenMap(words), [words]);
  const paragraphTokenMapViolation = useMemo(
    () =>
      process.env.NODE_ENV === 'production' ? null : validateParagraphTokenMap(paragraphTokenMap),
    [paragraphTokenMap],
  );
  // Phase 2: ordered list of tokens that the markdown renderer emits as visible words.
  // The wordIndex passed to renderWord/renderSpace indexes into this array.
  const renderableTokens = useMemo(
    () =>
      paragraphTokenMap.tokens.filter(
        (token) => token.kind === 'word' || token.kind === 'link' || token.kind === 'image',
      ),
    [paragraphTokenMap],
  );

  /**
   * Source-text start offset of the rendered token at `wordIndex`. The token
   * map is the single source of truth; the `wordCharOffsets` fallback only
   * covers the unreachable case where the renderer emits more tokens than the
   * map lists (would indicate a bug in `paragraphTokenMap`).
   */
  const getRenderedTokenSourceStart = (wordIndex: number): number => {
    const token = renderableTokens[wordIndex];
    if (token) return token.sourceStart;
    return wordCharOffsets[wordIndex] ?? 0;
  };

  /**
   * Source-text end-exclusive offset of the rendered token at `wordIndex`,
   * used to place the trailing space's `data-char-offset`.
   */
  const getRenderedTokenSourceEndExclusive = (wordIndex: number, fallbackWord: string): number => {
    const token = renderableTokens[wordIndex];
    if (token) return token.sourceEndExclusive;
    return (wordCharOffsets[wordIndex] ?? 0) + fallbackWord.length;
  };

  const handleMouseDown = () => {
    cancelSelectionRestoreRef.current?.();
    cancelSelectionRestoreRef.current = null;
    // Clear any existing selection so handleMouseUp won't mistake a stale
    // word-click selection for a fresh drag and incorrectly call onSelection.
    window.getSelection()?.removeAllRanges();
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const captured = captureCurrentSelection({
      paragraphElement: paragraphRef.current,
      words,
    });
    if (!captured) return;

    const reconciled = reconcileSelection(captured.range, paragraphTokenMap) ?? captured.range;
    const selection = createSelectionFromRange({
      paragraphIndex,
      rawStart: reconciled.startInclusive,
      rawEnd: reconciled.endExclusive,
    });
    const highlightOffsets = rangeToHighlightOffsets(
      { startInclusive: selection.startIndex, endExclusive: selection.endIndex + 1 },
      paragraphStartCharOffset,
    );

    onSelection({
      paragraphIndex,
      selection: {
        ...selection,
        startIndex: highlightOffsets.startIndex,
        endIndex: highlightOffsets.endIndex,
      },
      selectionText: reconciled.text,
      anchorPosition: getPopoverPositionFromRect(captured.rect),
    });

    // If the handler dismissed the popup without reopening (same-word re-click
    // on a drag selection), it cleared the selection — don't re-apply it.
    const postMouseUpSel = window.getSelection();
    if (!postMouseUpSel?.rangeCount || postMouseUpSel.isCollapsed) {
      cancelSelectionRestoreRef.current?.();
      cancelSelectionRestoreRef.current = null;
      return;
    }

    cancelSelectionRestoreRef.current?.();
    cancelSelectionRestoreRef.current = scheduleSelectionRestore({
      paragraphElement: paragraphRef.current,
      range: reconciled,
    });

    playText(reconciled.text);
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string, wordIndex: number) => {
    const currentSelection = window.getSelection();
    const hasExpandedSelection = Boolean(
      currentSelection?.rangeCount && !currentSelection.getRangeAt(0).collapsed,
    );
    if (hasExpandedSelection) {
      return;
    }

    const element = e.currentTarget as HTMLElement;
    const elementText = normalizeSelectedText(element.textContent);
    const fallbackWordFromElement = elementText.split(/\s+/u).at(-1) ?? word;
    const rawWordForSelection = /\s/u.test(word) ? fallbackWordFromElement : word;

    // Token-map gives us the source range of the clicked rendered token; the
    // core selection meta trims trailing punctuation that may live inside a
    // single plain-text token (e.g. `criticizing,` -> `criticizing`).
    const tokenSourceStart = getRenderedTokenSourceStart(wordIndex);
    const coreSelectionMeta = getCoreWordSelectionMeta(rawWordForSelection);
    const clickedWordText = coreSelectionMeta.normalizedWord;
    const rawWordStart = tokenSourceStart + coreSelectionMeta.startOffset;
    const rawWordEnd = tokenSourceStart + coreSelectionMeta.endOffsetExclusive;

    playText(clickedWordText);

    // Show highlight popover by creating a selection for this word
    e.preventDefault();
    e.stopPropagation();

    const rawRange: RawSelectionRange = {
      startInclusive: rawWordStart,
      endExclusive: rawWordEnd,
      text: clickedWordText,
    };
    const reconciled = reconcileSelection(rawRange, paragraphTokenMap) ?? rawRange;

    const selection = createSelectionFromRange({
      paragraphIndex,
      rawStart: reconciled.startInclusive,
      rawEnd: reconciled.endExclusive,
    });
    const highlightOffsets = rangeToHighlightOffsets(
      { startInclusive: selection.startIndex, endExclusive: selection.endIndex + 1 },
      paragraphStartCharOffset,
    );

    // Keep a visible native selection while the popover opens.
    applySelection({
      paragraphElement: paragraphRef.current,
      range: reconciled,
      fallbackElement: e.currentTarget,
    });

    const rect = element.getBoundingClientRect();
    onSelection({
      paragraphIndex,
      selection: {
        ...selection,
        startIndex: highlightOffsets.startIndex,
        endIndex: highlightOffsets.endIndex,
      },
      selectionText: reconciled.text,
      anchorPosition: getPopoverPositionFromRect(rect),
    });

    const wordElementForFallback =
      paragraphRef.current?.querySelector<HTMLElement>(`[data-word-index="${wordIndex}"]`) ??
      e.currentTarget;
    cancelSelectionRestoreRef.current?.();

    // If the handler dismissed the popup without reopening (same-word re-click),
    // it cleared the selection — don't re-apply it.
    const postClickSel = window.getSelection();
    if (!postClickSel?.rangeCount || postClickSel.isCollapsed) return;

    cancelSelectionRestoreRef.current = scheduleSelectionRestore({
      paragraphElement: paragraphRef.current,
      range: reconciled,
      fallbackElement: wordElementForFallback,
    });
  };

  const renderSpace = (word: string, wordIndex: number) => {
    const spaceCharOffset = getRenderedTokenSourceEndExclusive(wordIndex, word);

    return (
      <span
        data-char-offset={spaceCharOffset}
        data-reader-token-kind="space"
        data-reader-token-source-start={spaceCharOffset}
        data-reader-token-source-end-exclusive={spaceCharOffset + 1}
        style={{
          backgroundColor:
            getCharColorAtOffset(spaceCharOffset + paragraphStartCharOffset, highlights) ??
            'transparent',
          cursor: 'pointer',
        }}
      >
        {' '}
      </span>
    );
  };

  return (
    <>
      <Typography
        variant="body1"
        component="div"
        ref={paragraphRef}
        data-reader-paragraph-start-offset={paragraphStartCharOffset}
        data-reader-paragraph-is-continuation={isParagraphStart ? undefined : 'true'}
        data-reader-paragraph-token-count={paragraphTokenMap.tokens.length}
        data-reader-paragraph-source-text-length={paragraphText.length}
        data-reader-invariant-violation={paragraphTokenMapViolation ?? undefined}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={onHoverClear}
        sx={{
          fontFamily: 'serif',
          fontSize: `${fontSize}px`,
          lineHeight,
          textAlign: justifyText ? 'justify' : 'left',
          textIndent: paragraphTextIndent,
          '*': {
            fontFamily: 'serif',
          },
        }}
      >
        <ReaderMarkdown
          words={shouldRenderMarkdown ? undefined : words}
          imageDataUrlByHref={imagesByHref}
          imageAspectRatioByHref={imageAspectRatioByHref}
          maxImageHeight={maxImageHeight}
          getInternalChapterTargetPage={getInternalChapterTargetPage}
          onInternalChapterLinkSelect={onInternalChapterLinkSelect}
          renderWord={({ word, wordIndex }) => {
            const renderableToken = renderableTokens[wordIndex];
            const tokenSourceStart = renderableToken?.sourceStart ?? null;
            const tokenSourceEndExclusive = renderableToken?.sourceEndExclusive ?? null;
            const tokenSourceWordIndex =
              renderableToken &&
              (renderableToken.kind === 'word' ||
                renderableToken.kind === 'link' ||
                renderableToken.kind === 'image')
                ? renderableToken.wordIndex
                : null;

            // Token map is the single source of truth: the rendered word's
            // first character corresponds to `tokenSourceStart` in paragraphText.
            // For 'word' tokens the rendered text matches the source slice; for
            // 'link'/'image' tokens the rendered text is the visible label,
            // which still anchors at sourceStart in the rendered chunk.
            const wordStart = tokenSourceStart ?? getRenderedTokenSourceStart(wordIndex);

            const sourceWordStartCharOffset = paragraphStartCharOffset + wordStart;
            const isResizeAnchorWord =
              isResizeAnchorHighlightVisible &&
              resizeAnchorWordStartCharOffset != null &&
              sourceWordStartCharOffset === resizeAnchorWordStartCharOffset;

            return (
              <Stack
                component="span"
                className="conversation-word"
                data-word-index={wordIndex}
                data-reader-token-kind={renderableToken?.kind ?? 'word'}
                data-reader-token-source-start={tokenSourceStart ?? wordStart}
                data-reader-token-source-end-exclusive={
                  tokenSourceEndExclusive ?? wordStart + word.length
                }
                data-reader-word-source-index={tokenSourceWordIndex ?? undefined}
                data-reader-word-anchor="true"
                data-reader-anchor-key={`${paragraphIndex}-${sourceWordStartCharOffset}`}
                data-reader-anchor-paragraph-index={paragraphIndex}
                data-reader-anchor-word-start-char-offset={sourceWordStartCharOffset}
                data-resize-anchor-highlighted={isResizeAnchorWord ? 'true' : undefined}
                sx={{
                  fontSize: `${fontSize}px`,
                  lineHeight,
                  display: 'inline',
                  cursor: 'pointer',
                  borderBottom: '1px dotted transparent',
                  position: 'relative',
                  backgroundColor: isResizeAnchorWord ? 'rgba(234, 11, 11, 0.94)' : 'transparent',
                  borderRadius: isResizeAnchorWord ? '4px' : 0,
                  transition: 'background-color 200ms ease-out',
                  ':hover': {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: 'calc(100% + 13px)',
                      height: 'calc(100% + 0px)',
                      top: '1px',
                      left: '-6px',
                      borderRadius: '8px',
                      backgroundColor: '#d3d3d3ab',
                      zIndex: -1,
                      '@media (max-width: 500px)': {
                        display: 'none',
                      },
                    },
                  },
                }}
                onClick={(e) => {
                  const element = e.currentTarget as HTMLElement;
                  if (element.closest('a')) {
                    return;
                  }
                  handleWordClick(e, word, wordIndex);
                }}
                onMouseEnter={(e) => {
                  void onWordHover?.(word, e);
                  const coreSelectionMeta = getCoreWordSelectionMeta(word);
                  const rawHover: RawSelectionRange = {
                    startInclusive: wordStart + coreSelectionMeta.startOffset,
                    endExclusive: wordStart + coreSelectionMeta.endOffsetExclusive,
                    text: coreSelectionMeta.normalizedWord,
                  };
                  const hover = reconcileSelection(rawHover, paragraphTokenMap) ?? rawHover;
                  onWordHoverInfo?.({
                    paragraphIndex,
                    ...rangeToHighlightOffsets(hover, paragraphStartCharOffset),
                  });
                }}
                onMouseMove={(e) => onWordMouseMove?.(e)}
              >
                {word.split('').map((char, charIdx) => {
                  const absOffset = wordStart + charIdx;
                  const sourceOffset = absOffset + paragraphStartCharOffset;
                  const color = getCharColorAtOffset(sourceOffset, highlights);
                  const prevColor =
                    charIdx > 0 ? getCharColorAtOffset(sourceOffset - 1, highlights) : null;
                  const nextColor =
                    charIdx < word.length - 1
                      ? getCharColorAtOffset(sourceOffset + 1, highlights)
                      : null;
                  const isStart = color !== null && color !== prevColor;
                  const isEnd = color !== null && color !== nextColor;

                  return (
                    <span
                      key={charIdx}
                      data-char-offset={absOffset}
                      style={{
                        backgroundColor: color ?? 'transparent',
                        cursor: 'pointer',
                        borderRadius:
                          isStart && isEnd
                            ? '3px'
                            : isStart
                              ? '3px 0 0 3px'
                              : isEnd
                                ? '0 3px 3px 0'
                                : '0',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </Stack>
            );
          }}
          renderSpace={renderSpace}
        >
          {paragraphText}
        </ReaderMarkdown>
      </Typography>
    </>
  );
};

export const ReaderParagraph = memo(ReaderParagraphBase);
ReaderParagraph.displayName = 'ReaderParagraph';
