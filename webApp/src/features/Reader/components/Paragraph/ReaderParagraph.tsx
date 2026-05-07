import { Stack, Typography } from '@mui/material';
import { memo, MouseEvent, useMemo, useRef } from 'react';
import { createSelectionFromRange } from './libs/selectionHighlightRange';
import { getWordCharOffsets } from './libs/selectionOffsetFromWordList';
import { normalizeSelectedText } from './libs/normalizeReaderSelectedText';
import { HighlightedText } from '../../model/types';
import { ReaderMarkdown } from './ReaderMarkdown';
import { getPopoverPositionFromRect } from './libs/popoverAnchorPosition';
import { getSafeWordMeta } from './libs/wordIndexSafeMeta';
import { buildParagraphTokenMap, validateParagraphTokenMap } from './libs/paragraphTokenMap';
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
import { getCharHighlightColor as getCharColorAtOffset } from './libs/highlightColorAtCharOffset';

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

  const getCoreWordSelectionMeta = (rawWord: string) => {
    let startOffset = 0;
    let endOffsetExclusive = rawWord.length;

    while (startOffset < endOffsetExclusive && !/[\p{L}\p{N}]/u.test(rawWord[startOffset])) {
      startOffset += 1;
    }

    while (
      endOffsetExclusive > startOffset &&
      !/[\p{L}\p{N}]/u.test(rawWord[endOffsetExclusive - 1])
    ) {
      endOffsetExclusive -= 1;
    }

    if (startOffset === endOffsetExclusive) {
      return {
        normalizedWord: rawWord,
        startOffset: 0,
        endOffsetExclusive: rawWord.length,
      };
    }

    return {
      normalizedWord: rawWord.slice(startOffset, endOffsetExclusive),
      startOffset,
      endOffsetExclusive,
    };
  };

  const resolveSourceWordMeta = ({
    renderedWord,
    wordIndex,
  }: {
    renderedWord: string;
    wordIndex: number;
  }) => {
    const fallback = getSafeWordMeta({
      wordIndex,
      fallbackWord: renderedWord,
      words,
      wordCharOffsets,
    });

    if (!shouldRenderMarkdown) {
      return fallback;
    }

    const normalizedRendered = getCoreWordSelectionMeta(renderedWord).normalizedWord.toLowerCase();
    if (!normalizedRendered) {
      return fallback;
    }

    const matchQuality = (sourceWord: string): 0 | 1 | 2 => {
      const normalizedSource = getCoreWordSelectionMeta(sourceWord).normalizedWord.toLowerCase();
      if (!normalizedSource) {
        return 0;
      }
      if (normalizedSource === normalizedRendered) {
        return 2; // exact core match
      }
      if (normalizedRendered.includes(normalizedSource)) {
        return 1; // rendered contains source (rendered word is a superset of source core)
      }
      return 0;
    };

    // Find the closest word with the highest match quality.
    let bestIndex = -1;
    let bestQuality = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < words.length; i += 1) {
      const quality = matchQuality(words[i] ?? '');
      if (quality === 0) continue;
      const dist = Math.abs(i - wordIndex);
      if (quality > bestQuality || (quality === bestQuality && dist < bestDistance)) {
        bestIndex = i;
        bestQuality = quality;
        bestDistance = dist;
      }
    }

    if (bestIndex < 0) {
      // Secondary: pure-punctuation fallback — find the nearest source word whose full
      // text contains the rendered token (handles stripped markdown decorators like "me*,"
      // which renders as "me" + standalone ",").
      let bestPunDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < words.length; i += 1) {
        if ((words[i] ?? '').includes(renderedWord)) {
          const dist = Math.abs(i - wordIndex);
          if (dist < bestPunDist) {
            bestPunDist = dist;
            bestIndex = i;
          }
        }
      }
    }

    if (bestIndex < 0) {
      return fallback;
    }

    return getSafeWordMeta({
      wordIndex: bestIndex,
      fallbackWord: renderedWord,
      words,
      wordCharOffsets,
    });
  };

  const getClickedElementCoreCharRange = (element: HTMLElement, rawWord: string) => {
    const charSpans = Array.from(element.querySelectorAll<HTMLElement>('[data-char-offset]'));
    if (!charSpans.length) {
      return null;
    }

    const renderedText = charSpans.map((entry) => entry.textContent ?? '').join('');
    const { normalizedWord } = getCoreWordSelectionMeta(rawWord);
    const startInRendered = renderedText.toLowerCase().indexOf(normalizedWord.toLowerCase());

    if (startInRendered < 0) {
      return null;
    }

    const endInRenderedExclusive = startInRendered + normalizedWord.length;
    const startElement = charSpans[startInRendered];
    const endElement = charSpans[endInRenderedExclusive - 1];
    if (!startElement || !endElement) {
      return null;
    }

    const startOffset = Number(startElement.getAttribute('data-char-offset'));
    const endOffset = Number(endElement.getAttribute('data-char-offset')) + 1;
    if (Number.isNaN(startOffset) || Number.isNaN(endOffset)) {
      return null;
    }

    return {
      normalizedWord,
      startOffset,
      endOffset,
    };
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

    const restoreSelection = () => {
      applySelection({ paragraphElement: paragraphRef.current, range: reconciled });
    };
    // TODO(Phase 4): replace this timer chain with a MutationObserver-based
    // single-shot re-apply after the popover transition settles.
    requestAnimationFrame(() => {
      restoreSelection();
      setTimeout(restoreSelection, 60);
      setTimeout(restoreSelection, 180);
      setTimeout(restoreSelection, 350);
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

    const clickedCharRange = getClickedElementCoreCharRange(element, rawWordForSelection);
    const coreSelectionMeta = getCoreWordSelectionMeta(rawWordForSelection);
    const clickedWordText = clickedCharRange?.normalizedWord ?? coreSelectionMeta.normalizedWord;

    playText(clickedWordText);

    // Show highlight popover by creating a selection for this word
    e.preventDefault();
    e.stopPropagation();

    const fallbackWordMeta = resolveSourceWordMeta({
      renderedWord: rawWordForSelection,
      wordIndex,
    });
    const fallbackWordStart = fallbackWordMeta.sourceStart + coreSelectionMeta.startOffset;
    const fallbackWordEnd = fallbackWordMeta.sourceStart + coreSelectionMeta.endOffsetExclusive;
    const rawWordStart = clickedCharRange?.startOffset ?? fallbackWordStart;
    const rawWordEnd = clickedCharRange?.endOffset ?? fallbackWordEnd;

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

    const restoreSelection = () => {
      const currentWordElement = paragraphRef.current?.querySelector<HTMLElement>(
        `[data-word-index="${wordIndex}"]`,
      );
      applySelection({
        paragraphElement: paragraphRef.current,
        range: reconciled,
        fallbackElement: currentWordElement ?? null,
      });
    };
    // TODO(Phase 4): replace this timer chain with a MutationObserver-based
    // single-shot re-apply after the popover transition settles.
    requestAnimationFrame(() => {
      restoreSelection();
      setTimeout(restoreSelection, 60);
      setTimeout(restoreSelection, 180);
      setTimeout(restoreSelection, 350);
    });
  };

  const renderSpace = (word: string, wordIndex: number) => {
    const renderableToken = renderableTokens[wordIndex];
    const fallback = resolveSourceWordMeta({ renderedWord: word, wordIndex });
    const spaceCharOffset = renderableToken
      ? renderableToken.sourceEndExclusive
      : fallback.sourceStart + fallback.sourceWord.length;

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
            // Phase 2: prefer the token-map mapping; fall back to the legacy
            // heuristic only when the token-map lookup is unavailable.
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

            let wordStart: number;
            if (tokenSourceStart !== null && tokenSourceEndExclusive !== null) {
              // For 'word' tokens the span text exactly matches the source slice;
              // for 'link'/'image' tokens the span text is the visible label,
              // which always starts at sourceStart in the rendered chunk.
              wordStart = tokenSourceStart;
            } else {
              const { sourceWord, sourceStart } = resolveSourceWordMeta({
                renderedWord: word,
                wordIndex,
              });
              const renderedWordStartInSource = sourceWord
                .toLowerCase()
                .indexOf(word.toLowerCase());
              wordStart =
                renderedWordStartInSource >= 0
                  ? sourceStart + renderedWordStartInSource
                  : sourceStart;
            }

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
                  backgroundColor: isResizeAnchorWord ? 'rgba(255, 153, 0, 0.35)' : 'transparent',
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
