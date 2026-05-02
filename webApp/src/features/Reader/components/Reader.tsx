import { Stack } from '@mui/material';
import { Book } from '../model/types';
import { ReaderHeader } from './ReaderHeader';
import { useMemo } from 'react';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './ReaderParagraph';
import { useBrowserSpeech } from '../hooks/useBrowserSpeech';
import { ReaderSpeechSettingsButton } from './ReaderSpeechSettingsButton';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useBooks } from '../hooks/useBooks';
import { BackButton } from './BackButton';
import { splitIntoPages } from '../utils/splitParagraphsIntoPages';
import { useReaderShortcuts } from '../hooks/useReaderShortcuts';

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
        fontSize: readerSettings.fontSize,
        lineHeight: readerSettings.lineHeight,
        contentWidth: columnWidth,
        contentHeight: readerSettings.contentHeight,
        paragraphGap: readerSettings.paragraphGap,
        columns: readerSettings.columns,
        columnGap: readerSettings.columnGap,
      },
    });
  }, [
    columnWidth,
    data.paragraphs,
    readerSettings.fontSize,
    readerSettings.lineHeight,
    readerSettings.contentHeight,
    readerSettings.paragraphGap,
    readerSettings.columns,
    readerSettings.columnGap,
  ]);

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
  const pageLabel =
    visiblePages.length > 1
      ? `${visiblePages[0]}-${visiblePages[visiblePages.length - 1]}`
      : String(visiblePages[0] ?? 1);

  const speech = useBrowserSpeech();

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

  const playText = (text: string) => {
    speech.play(text.trim());
  };

  return (
    <Stack
      sx={{
        width: '100%',

        color: '#000',
        alignItems: 'center',
        padding: '80px 0px 120px 0px',
        flex: '1 0 0',
        gap: '90px',
        position: 'relative',
      }}
    >
      <BackButton onClick={closeReader} />
      <ReaderSpeechSettingsButton speech={speech} />

      <Stack
        sx={{
          maxWidth: '900px',
          width: '100%',
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ReaderHeader
          title={data.title}
          subtitle={data.subtitle}
          pageLabel={pageLabel}
          pageCount={pageCount}
          category={data.category}
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
              sx={{
                width: `${columnWidth}px`,
                height: '100%',
                position: 'relative',
                zIndex: 1,
                gap: `${readerSettings.paragraphGap}px`,
              }}
            >
              {pageContent.map((paragraph, rawIndex) => {
                const index = rawIndex + (pageNumber - 1) * pageCount;

                return (
                  <Stack
                    key={index}
                    sx={{
                      width: '100%',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <ReaderParagraph
                      paragraphIndex={index}
                      words={paragraph}
                      fontSize={readerSettings.fontSize}
                      lineHeight={readerSettings.lineHeight}
                      sourceLanguage={readerSettings.language}
                      targetLanguage={readerSettings.translateToLanguage}
                      onWordClick={playText}
                      onTextSelected={playText}
                      highlights={(data.highlights ?? []).filter(
                        (highlight) => (highlight.paragraphIndex ?? 0) === index,
                      )}
                      onHighlightColorSelect={books.applySelectedHighlight}
                      onRemoveHighlight={books.removeHighlight}
                    />
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
      </Stack>

      <PaginationPanel
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        isFirstPage={activePage === 1}
        isLastPage={activePage >= maxSpreadStartPage}
      />
    </Stack>
  );
};
