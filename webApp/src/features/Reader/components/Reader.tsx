import { Stack } from '@mui/material';
import { Book, HighlightedText } from '../model/types';
import { ReaderHeader } from './ReaderHeader';
import { useCallback, useMemo } from 'react';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './Paragraph/ReaderParagraph';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { ReaderSpeechSettingsButton } from './ReaderSpeechSettingsButton';
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
  const activePage = Math.min(Math.max(normalizedStoredPage, 1), maxSpreadStartPage);
  const visiblePages = isTwoColumnLayout
    ? [activePage, activePage + 1].filter((page) => page <= pageCount)
    : [activePage];
  const { currentPage, totalPages } = getReaderProgress({
    activePage,
    pageCount,
    isTwoColumnLayout,
  });

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
  const goToPreviousPage = () => setActivePage(Math.max(activePage - pageStep, 1));
  const goToNextPage = () => setActivePage(Math.min(activePage + pageStep, maxSpreadStartPage));

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

  return (
    <Stack
      sx={{
        width: '100%',

        color: '#000',
        alignItems: 'center',
        padding: '80px 0px 15px 0px',
        flex: '1 0 0',
        gap: '90px',
        position: 'relative',
        '@media (max-width: 700px)': {
          paddingBottom: '50px',
        },
      }}
    >
      <ReaderSpeechSettingsButton speech={speech} />
      <BackButton onClick={closeReader} />

      <Stack
        sx={{
          maxWidth: '900px',
          width: 'calc(100% - 40px)',
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ReaderHeader
          title={data.title}
          subtitle={data.subtitle}
          currentPage={currentPage}
          totalPages={totalPages}
          author={data.author}
        />
      </Stack>

      <Stack
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
                    />
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
      </Stack>

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

      <PaginationPanel
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        isFirstPage={activePage === 1}
        isLastPage={activePage >= maxSpreadStartPage}
      />
    </Stack>
  );
};
