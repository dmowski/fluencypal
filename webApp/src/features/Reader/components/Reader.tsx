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

  const pages = useMemo(() => {
    return splitIntoPages({
      bookParagraphs: data.paragraphs,
      settings: {
        fontSize: readerSettings.fontSize,
        lineHeight: readerSettings.lineHeight,
        contentWidth: readerSettings.contentWidth,
        contentHeight: readerSettings.contentHeight,
        paragraphGap: readerSettings.paragraphGap,
      },
    });
  }, [
    data.paragraphs,
    readerSettings.fontSize,
    readerSettings.lineHeight,
    readerSettings.contentWidth,
    readerSettings.contentHeight,
    readerSettings.paragraphGap,
  ]);

  const pageCount = pages.length;
  const maxPage = Math.max(pageCount, 1);
  const activePage = Math.min(Math.max(storedActivePage, 1), maxPage);
  const activePageContent = pages[activePage - 1] || [];

  const speech = useBrowserSpeech();

  const closeReader = () => books.setActive(null);
  const goToPreviousPage = () => setActivePage(Math.max(activePage - 1, 1));
  const goToNextPage = () => setActivePage(Math.min(activePage + 1, maxPage));

  useReaderShortcuts({
    activePage,
    maxPage,
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
          activePage={activePage}
          pageCount={pageCount}
          category={data.category}
        />
      </Stack>

      <Stack
        sx={{
          width: '100%',
          alignItems: 'center',
          height: `${readerSettings.contentHeight}px`,
        }}
      >
        <Stack sx={{ gap: `${readerSettings.paragraphGap}px`, width: '100%' }}>
          {activePageContent.map((paragraph, rawIndex) => {
            const index = rawIndex + (activePage - 1) * pageCount;
            return (
              <Stack
                key={rawIndex}
                sx={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  gap: '20px',
                }}
              >
                <Stack
                  key={index}
                  sx={{
                    width: `${readerSettings.contentWidth}px`,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <ReaderParagraph
                    key={index}
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
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <PaginationPanel
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        isFirstPage={activePage === 1}
        isLastPage={activePage === maxPage}
      />
    </Stack>
  );
};
