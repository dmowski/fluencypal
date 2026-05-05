import { Button, Stack, Typography } from '@mui/material';
import { Book, HighlightedText } from '../model/types';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ReaderHeader } from './ReaderHeader';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './Paragraph/ReaderParagraph';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { BookInfoButton } from './ReaderSpeechSettingsButton';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useBooks } from '../hooks/useBooks';
import { BackButton } from './BackButton';
import { splitIntoPages } from '../utils/splitParagraphsIntoPages';
import { getReaderProgress } from '../utils/getReaderProgress';
import { useReaderShortcuts } from '../hooks/useReaderShortcuts';
import { TextPopover } from './TextPopover';
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
import { useLingui } from '@lingui/react';

const EMPTY_HIGHLIGHTS: HighlightedText[] = [];

export const Reader = ({ data }: { data: Book }) => {
  const books = useBooks();
  const readerSettings = useReaderSettings();
  const { activePage: storedActivePage, setActivePage } = books;
  const pageStep = readerSettings.columns;
  const isTwoColumnLayout = readerSettings.columns === 2;
  const columnWidth =
    readerSettings.columns === 2
      ? Math.max(0, (readerSettings.contentWidth - readerSettings.columnGap) / 2)
      : readerSettings.contentWidth;

  const pages = useMemo(() => {
    return splitIntoPages({
      bookParagraphs: data.paragraphs,
      settings: {
        ...readerSettings,
        contentWidth: columnWidth,
      },
      imageAspectRatioByHref: data.imageAspectRatioByHref,
    });
  }, [columnWidth, data.imageAspectRatioByHref, data.paragraphs, readerSettings]);

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
  const normalizedStoredPage =
    isTwoColumnLayout && storedActivePage > 1 && storedActivePage % 2 === 0
      ? storedActivePage - 1
      : storedActivePage;
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
    highlights: data.highlights ?? [],
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
  });

  const closeReader = () => books.setActive(null);
  const goToPreviousPage = () => {
    readerSettings.clearResizeAnchorWord();
    setActivePage(Math.max(activePage - pageStep, 1));
  };
  const goToNextPage = () => {
    readerSettings.clearResizeAnchorWord();
    setActivePage(Math.min(activePage + pageStep, maxSpreadStartPage));
  };
  const handleChapterSelect = (targetPage: number) => {
    readerSettings.clearResizeAnchorWord();
    setActivePage(Math.min(Math.max(targetPage, 1), maxSpreadStartPage));
  };
  const handleHighlightSelect = (targetPage: number) => {
    readerSettings.clearResizeAnchorWord();
    setActivePage(Math.min(Math.max(targetPage, 1), maxSpreadStartPage));
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
      setActivePage(Math.min(Math.max(targetPage, 1), maxSpreadStartPage));
    },
    [maxSpreadStartPage, readerSettings, setActivePage],
  );

  useReaderShortcuts({
    activePage,
    maxPage: maxSpreadStartPage,
    onClose: closeReader,
    onNext: goToNextPage,
    onPrevious: goToPreviousPage,
  });

  const playText = useCallback(
    (text: string) => {
      if (!readerSettings.voiceOverSelectedText) return;
      speech.play(text.trim());
    },
    [speech.play, readerSettings.voiceOverSelectedText],
  );

  const handleWordHoverClear = useCallback(() => {
    clearHoverTranslation();
    clearHoveredWord();
  }, [clearHoverTranslation, clearHoveredWord]);

  const [isReading, setIsReading] = useState(false);
  const { i18n } = useLingui();

  if (!isReading) {
    return (
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
        <Stack sx={{ maxWidth: '1200px', width: 'calc(100% - 40px)', minWidth: 0 }}>
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
          sx={{ minWidth: '140px', fontSize: '16px' }}
        >
          {i18n._('Read')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        width: '100%',

        color: '#000',
        alignItems: 'center',
        padding: '60px 0px 35px 0px',
        flex: '1 0 0',
        gap: '40px',
        position: 'relative',
        '@media (max-width: 700px)': {
          paddingBottom: '50px',
        },
      }}
    >
      <BookInfoButton
        bookTitle={data.title}
        speech={speech}
        chapters={chapterItems}
        highlights={highlightItems}
        activeChapterId={activeChapterId}
        onSelectChapter={handleChapterSelect}
        onSelectHighlight={handleHighlightSelect}
      />
      <BackButton onClick={closeReader} />

      <Stack
        ref={contentRef}
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
        activeColor={activeColor}
        onColorSelect={handleActiveColorSelect}
      />

      {flyingTooltipNode}

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
    </Stack>
  );
};
