import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from '@mui/material';
import { Book, BookChapterNavigationItem, HighlightedText, ReaderSettings } from '../model/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReaderHeader } from './ReaderHeader';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './Paragraph/ReaderParagraph';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { BookInfoButton, BookInfoButtonHandle } from './ReaderSpeechSettingsButton';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useBooks } from '../hooks/useBooks';
import { BackButton } from './BackButton';
import { splitIntoPages } from '../utils/splitParagraphsIntoPages';
import { getReaderProgress } from '../utils/getReaderProgress';
import { useReaderShortcuts } from '../hooks/useReaderShortcuts';
import { TextPopover, ReaderTranslationSetupHint } from './TextPopover';
import { useReaderHighlightPopover } from '../hooks/useReaderHighlightPopover';
import { useReaderFlyingTooltip } from '../hooks/useReaderFlyingTooltip';
import { useReaderHoverHighlight } from '../hooks/useReaderHoverHighlight';
import { useReaderHighlightItems } from '../hooks/useReaderHighlightItems';
import { ContentFitChecker } from './ContentFitChecker';
import { ReaderChapterItem } from './ReaderChaptersPopover';
import {
  findActiveChapterId,
  findTargetPageForInternalChapterHref,
  mapChaptersToPages,
} from '../utils/readerChapterNavigation';
import { findTargetPageForWordAnchor } from '../utils/readerPageAnchor';
import { deriveReadingPositionFromPages } from '../utils/deriveReadingPositionFromPages';
import { resolveReadingPositionToPage } from '../utils/resolveReadingPositionToPage';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { useSwipePageNavigation } from '../hooks/useSwipePageNavigation';
import { usePreventReaderPullToRefresh } from '../hooks/usePreventReaderPullToRefresh';
import { SwipePageIndicator } from './SwipePageIndicator';
import { normalizeToNativeLangCode } from '../../Translation/translationHelpers';

const EMPTY_HIGHLIGHTS: HighlightedText[] = [];

export const Reader = ({ data }: { data: Book }) => {
  const books = useBooks();
  const readerSettings = useReaderSettings();
  const { uid, isAuthorized } = useAuth();
  const userId = isAuthorized ? uid : undefined;
  const { activePage: storedActivePage, setActivePage } = books;
  const pageStep = readerSettings.columns;
  const isTwoColumnLayout = readerSettings.columns === 2;
  const columnWidth =
    readerSettings.columns === 2
      ? Math.max(0, (readerSettings.contentWidth - readerSettings.columnGap) / 2)
      : readerSettings.contentWidth;

  const chapterStartParagraphIndices = useMemo(() => {
    const paragraphIndices = new Set<number>();

    const collectChapterStarts = (chapters: BookChapterNavigationItem[]) => {
      chapters.forEach((chapter) => {
        if (chapter.targetParagraphIndex != null && chapter.targetParagraphIndex >= 0) {
          paragraphIndices.add(chapter.targetParagraphIndex);
        }
        if (chapter.children.length > 0) {
          collectChapterStarts(chapter.children);
        }
      });
    };

    collectChapterStarts(data.chapters ?? []);

    return Array.from(paragraphIndices).sort((a, b) => a - b);
  }, [data.chapters]);

  // Restrict pagination inputs to layout-affecting fields so toggling language,
  // voice, translate target, translate-on-hover, or voice-over-selected-text
  // does not invalidate `pages` and re-render book content.
  const paginationSettings: ReaderSettings = useMemo(
    () => ({
      language: '',
      selectedVoiceURI: null,
      translateToLanguage: null,
      translateOnHover: false,
      voiceOverSelectedText: false,
      fontSize: readerSettings.fontSize,
      lineHeight: readerSettings.lineHeight,
      paragraphGap: readerSettings.paragraphGap,
      justifyText: readerSettings.justifyText,
      contentWidth: columnWidth,
      contentHeight: readerSettings.contentHeight,
      columns: readerSettings.columns,
      columnGap: readerSettings.columnGap,
    }),
    [
      columnWidth,
      readerSettings.columnGap,
      readerSettings.columns,
      readerSettings.contentHeight,
      readerSettings.fontSize,
      readerSettings.justifyText,
      readerSettings.lineHeight,
      readerSettings.paragraphGap,
    ],
  );

  const pages = useMemo(() => {
    return splitIntoPages({
      bookParagraphs: data.paragraphs,
      settings: paginationSettings,
      imageAspectRatioByHref: data.imageAspectRatioByHref,
      chapterStartParagraphIndices,
    });
  }, [
    chapterStartParagraphIndices,
    data.imageAspectRatioByHref,
    data.paragraphs,
    paginationSettings,
  ]);

  const highlightsByParagraph = useMemo(() => {
    const grouped = new Map<number, HighlightedText[]>();
    (data.highlights ?? []).forEach((highlight) => {
      const paragraph = highlight.paragraphIndex ?? 0;
      const existing = grouped.get(paragraph);
      if (existing) {
        existing.push(highlight);
      } else {
        grouped.set(paragraph, [highlight]);
      }
    });
    return grouped;
  }, [data.highlights]);

  const pageCount = pages.length;
  const maxPage = Math.max(pageCount, 1);
  const maxSpreadStartPage =
    isTwoColumnLayout && pageCount % 2 === 0 ? Math.max(pageCount - 1, 1) : maxPage;
  // When the local cache is missing (e.g. opening the book on a new device
  // after a sync pull), restore from the synced content-anchored
  // `readingPosition`. The local `activePageIndex` cache, when present, always
  // wins because it preserves the last in-layout choice on this device.
  const restoredPageFromReadingPosition = useMemo(() => {
    if (data.activePageIndex != null) return null;
    if (!data.readingPosition) return null;
    const resolved = resolveReadingPositionToPage({ pages, position: data.readingPosition });
    return resolved?.pageIndex ?? null;
  }, [data.activePageIndex, data.readingPosition, pages]);
  const effectiveStoredPage =
    data.activePageIndex ?? restoredPageFromReadingPosition ?? storedActivePage;
  const normalizedStoredPage =
    isTwoColumnLayout && effectiveStoredPage > 1 && effectiveStoredPage % 2 === 0
      ? effectiveStoredPage - 1
      : effectiveStoredPage;
  const normalizeSpreadStartPage = (page: number) => {
    const normalizedPage = isTwoColumnLayout && page > 1 && page % 2 === 0 ? page - 1 : page;
    return Math.min(Math.max(normalizedPage, 1), maxSpreadStartPage);
  };
  const anchoredPage = readerSettings.resizeAnchorWord
    ? findTargetPageForWordAnchor({ pages, anchor: readerSettings.resizeAnchorWord })
    : null;
  const activePage =
    anchoredPage == null
      ? Math.min(Math.max(normalizedStoredPage, 1), maxSpreadStartPage)
      : normalizeSpreadStartPage(anchoredPage);
  const visiblePages = isTwoColumnLayout
    ? [activePage, activePage + 1].filter((page) => page <= pageCount)
    : [activePage];
  const { currentPage, totalPages } = getReaderProgress({
    activePage,
    pageCount,
    isTwoColumnLayout,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const bookInfoButtonRef = useRef<BookInfoButtonHandle>(null);

  const chapterItems: ReaderChapterItem[] = useMemo(
    () => mapChaptersToPages({ chapters: data.chapters ?? [], pages }),
    [data.chapters, pages],
  );

  const highlightItems = useReaderHighlightItems({
    highlights: data.highlights ?? [],
    paragraphs: data.paragraphs,
    pages,
  });

  const activeChapterId = useMemo(
    () => findActiveChapterId(chapterItems, activePage),
    [chapterItems, activePage],
  );

  const speech = useBrowserSpeech();
  // Latest refs so callbacks passed to memoized ReaderParagraph stay stable
  // when the user toggles voice/translate-related settings.
  const speechPlayRef = useRef(speech.play);
  speechPlayRef.current = speech.play;
  const speechStopRef = useRef(speech.stop);
  speechStopRef.current = speech.stop;
  const voiceOverSelectedTextRef = useRef(readerSettings.voiceOverSelectedText);
  voiceOverSelectedTextRef.current = readerSettings.voiceOverSelectedText;
  const {
    activePopover,
    activeColor,
    popoverPaperRef,
    closeActivePopover,
    handleParagraphSelection,
    handleActiveColorSelect,
  } = useReaderHighlightPopover({
    sourceLanguage: readerSettings.language,
    targetLanguage: readerSettings.translateToLanguage,
    paragraphs: data.paragraphs,
    highlights: data.highlights ?? [],
    userId,
    onApplyHighlight: books.applySelectedHighlight,
    onRemoveHighlight: books.removeHighlight,
  });

  const { flyingTooltipNode, onWordHover, onWordMouseMove, clearHoverTranslation } =
    useReaderFlyingTooltip({
      translateOnHover: readerSettings.translateOnHover,
      sourceLanguage: readerSettings.language,
      targetLanguage: readerSettings.translateToLanguage,
    });

  const { onWordHoverInfo, clearHoveredWord } = useReaderHoverHighlight({
    highlights: data.highlights ?? [],
    onApplyHighlight: books.applySelectedHighlight,
    onRemoveHighlight: books.removeHighlight,
    isPopoverOpen: !!activePopover,
    userId,
  });

  const closeReader = () => books.setActive(null);
  const goToPage = useCallback(
    (targetPage: number) => {
      const clampedPage = Math.min(Math.max(targetPage, 1), maxSpreadStartPage);
      const position = deriveReadingPositionFromPages({
        pages,
        activePageIndex: clampedPage,
        columns: readerSettings.columns,
      });
      setActivePage(clampedPage, position);
    },
    [maxSpreadStartPage, pages, readerSettings.columns, setActivePage],
  );
  const goToPreviousPage = () => {
    readerSettings.clearResizeAnchorWord();
    goToPage(activePage - pageStep);
  };
  const goToNextPage = () => {
    readerSettings.clearResizeAnchorWord();
    goToPage(activePage + pageStep);
  };
  const handleChapterSelect = (targetPage: number) => {
    readerSettings.clearResizeAnchorWord();
    goToPage(targetPage);
  };
  const handleHighlightSelect = (targetPage: number) => {
    readerSettings.clearResizeAnchorWord();
    goToPage(targetPage);
  };

  const getInternalChapterTargetPage = useCallback(
    (href: string): number | null =>
      findTargetPageForInternalChapterHref({
        chapters: data.chapters ?? [],
        pages,
        href,
      }),
    [data.chapters, pages],
  );

  const handleInternalChapterLinkSelect = useCallback(
    (targetPage: number) => {
      readerSettings.clearResizeAnchorWord();
      goToPage(targetPage);
    },
    [goToPage, readerSettings.clearResizeAnchorWord],
  );

  const { isCloseConfirmOpen, confirmClose, cancelClose } = useReaderShortcuts({
    activePage,
    maxPage: maxSpreadStartPage,
    onClose: closeReader,
    onNext: goToNextPage,
    onPrevious: goToPreviousPage,
  });

  const { swipeDirection } = useSwipePageNavigation({
    onNext: goToNextPage,
    onPrevious: goToPreviousPage,
    isFirstPage: activePage === 1,
    isLastPage: activePage >= maxSpreadStartPage,
  });

  const playText = useCallback((text: string) => {
    if (!voiceOverSelectedTextRef.current) return;
    speechPlayRef.current(text.trim());
  }, []);

  const hadActivePopoverRef = useRef(false);
  useEffect(() => {
    if (hadActivePopoverRef.current && !activePopover) {
      speechStopRef.current();
    }
    hadActivePopoverRef.current = Boolean(activePopover);
  }, [activePopover]);

  const handleOpenReaderSettings = useCallback(() => {
    bookInfoButtonRef.current?.openSettings();
  }, []);

  const translationSetupHint = useMemo((): ReaderTranslationSetupHint | null => {
    if (!activePopover || activePopover.isTranslationLoading || activePopover.translatedText) {
      return null;
    }

    if (!readerSettings.translateToLanguage) {
      return 'missing-target';
    }

    const normalizedSourceLanguage = normalizeToNativeLangCode(readerSettings.language);
    if (normalizedSourceLanguage === readerSettings.translateToLanguage) {
      return 'same-language';
    }

    return null;
  }, [activePopover, readerSettings.language, readerSettings.translateToLanguage]);

  const handleWordHoverClear = useCallback(() => {
    clearHoverTranslation();
    clearHoveredWord();
  }, [clearHoverTranslation, clearHoveredWord]);

  const [isReading, setIsReading] = useState(false);
  usePreventReaderPullToRefresh(true);
  const { i18n } = useLingui();

  const closeConfirmDialog = (
    <Dialog
      open={isCloseConfirmOpen}
      onClose={cancelClose}
      data-testid="reader-close-confirm-dialog"
    >
      <DialogContent>
        <DialogContentText>{i18n._('Close the book?')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelClose} data-testid="reader-close-confirm-cancel">
          {i18n._('Cancel')}
        </Button>
        <Button
          onClick={confirmClose}
          color="error"
          autoFocus
          data-testid="reader-close-confirm-ok"
        >
          {i18n._('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!isReading && activePage === 1) {
    return (
      <>
        <Stack
          sx={{
            width: '100%',
            height: '100dvh',
            color: '#000',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '80px 40px 40px',
            gap: '40px',
          }}
        >
          <BackButton onClick={closeReader} />
          <Stack sx={{ maxWidth: '1200px', width: 'calc(100% - 0px)', minWidth: 0 }}>
            <ReaderHeader
              title={data.title}
              subtitle={data.subtitle}
              currentPage={currentPage}
              totalPages={totalPages}
              author={data.author}
            />
          </Stack>
          <Button
            variant="contained"
            size="large"
            onClick={() => setIsReading(true)}
            color="info"
            sx={{
              fontSize: '16px',
              boxShadow: 'none',
              borderRadius: '40px',
              padding: '9px 36px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            {i18n._('Read')}
          </Button>
        </Stack>
        {closeConfirmDialog}
      </>
    );
  }

  return (
    <Stack
      sx={{
        width: '100%',

        color: '#000',
        alignItems: 'center',
        padding: '20px 0px 30px 0px',
        flex: '1 0 0',
        gap: '40px',
        position: 'relative',
        '@media (max-width: 700px)': {
          padding: '50px 0px 50px 0px',
        },
      }}
    >
      <BookInfoButton
        ref={bookInfoButtonRef}
        speech={speech}
        activePage={activePage}
        chapters={chapterItems}
        highlights={highlightItems}
        activeChapterId={activeChapterId}
        onSelectChapter={handleChapterSelect}
        onSelectHighlight={handleHighlightSelect}
      />
      <BackButton onClick={closeReader} />

      <Stack
        ref={contentRef}
        className="reader-content"
        data-testid="reader-content"
        sx={{
          width: '100%',
          alignItems: 'center',
          height: `${readerSettings.contentHeight}px`,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: `${isTwoColumnLayout ? readerSettings.columnGap : 0}px`,
        }}
      >
        {visiblePages.map((pageNumber) => {
          const pageContent = pages[pageNumber - 1] || [];

          return (
            <Stack
              key={pageNumber}
              data-testid="reader-page-column"
              sx={{
                width: `${columnWidth}px`,
                height: '100%',
                position: 'relative',
                zIndex: 1,
                gap: `${readerSettings.paragraphGap}px`,
              }}
            >
              {pageContent.map((paragraph) => {
                const index = paragraph.sourceParagraphIndex;

                return (
                  <Stack
                    key={`${index}-${paragraph.sourceStartCharOffset}`}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <ReaderParagraph
                      paragraphIndex={index}
                      paragraphStartCharOffset={paragraph.sourceStartCharOffset}
                      words={paragraph.words}
                      markdownPrefix={paragraph.markdownPrefix}
                      markdownSuffix={paragraph.markdownSuffix}
                      imagesByHref={data.imagesByHref}
                      imageAspectRatioByHref={data.imageAspectRatioByHref}
                      maxImageHeight={Math.max(0, Math.floor(readerSettings.contentHeight * 0.9))}
                      getInternalChapterTargetPage={getInternalChapterTargetPage}
                      onInternalChapterLinkSelect={handleInternalChapterLinkSelect}
                      fontSize={readerSettings.fontSize}
                      lineHeight={readerSettings.lineHeight}
                      justifyText={readerSettings.justifyText}
                      playText={playText}
                      onSelection={handleParagraphSelection}
                      highlights={highlightsByParagraph.get(index) ?? EMPTY_HIGHLIGHTS}
                      onWordHover={onWordHover}
                      onWordHoverInfo={onWordHoverInfo}
                      onWordMouseMove={onWordMouseMove}
                      onHoverClear={handleWordHoverClear}
                      resizeAnchorWordStartCharOffset={
                        readerSettings.resizeAnchorWord?.paragraphIndex === index
                          ? readerSettings.resizeAnchorWord.wordStartCharOffset
                          : null
                      }
                      isResizeAnchorHighlightVisible={
                        readerSettings.resizeAnchorHighlightKey ===
                        readerSettings.resizeAnchorWord?.key
                      }
                    />
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
      </Stack>

      <ContentFitChecker
        contentRef={contentRef}
        readerSettings={readerSettings}
        activePage={activePage}
      />

      <TextPopover
        anchorPosition={activePopover?.anchorPosition ?? null}
        paperRef={popoverPaperRef}
        onClose={closeActivePopover}
        translatedText={activePopover?.translatedText ?? null}
        isTranslationLoading={activePopover?.isTranslationLoading ?? false}
        translationSetupHint={translationSetupHint}
        onOpenSettings={handleOpenReaderSettings}
        activeColor={activeColor}
        onColorSelect={handleActiveColorSelect}
        onPlayText={() => speech.play(activePopover?.selectionText.trim() || '')}
      />

      {flyingTooltipNode}

      <SwipePageIndicator direction={swipeDirection} />

      <Typography
        data-testid="reader-page-indicator"
        sx={{
          position: 'fixed',
          bottom: '10px',
          left: 0,
          width: '100%',
          fontSize: '14px',
          fontFamily: 'serif',
          color: '#555',
          textTransform: 'uppercase',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        {`${currentPage} / ${totalPages}`}
      </Typography>

      <PaginationPanel
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        isFirstPage={activePage === 1}
        isLastPage={activePage >= maxSpreadStartPage}
      />

      {closeConfirmDialog}
    </Stack>
  );
};
