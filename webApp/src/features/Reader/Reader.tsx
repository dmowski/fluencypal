import { Button, Stack, Typography } from '@mui/material';
import { ReaderData } from './types';
import { ReaderHeader } from './ReaderHeader';
import { ChevronLeft, ChevronRight, Mic, Pause } from 'lucide-react';
import { useState } from 'react';
import { useLingui } from '@lingui/react';

export const ReaderParagraph = ({ text }: { text: string }) => (
  <Typography
    variant="body1"
    sx={{
      fontFamily: 'serif',
      fontSize: '36px',
      lineHeight: '1.5',
      textAlign: 'justify',
    }}
  >
    {text}
  </Typography>
);

const PaginationButtons = ({
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
}: {
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Stack
        component={'button'}
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          color: '#333',
          opacity: isFirstPage ? 0.4 : 1,
        }}
        disabled={isFirstPage}
        onClick={onPrevious}
      >
        <ChevronLeft />
      </Stack>

      <Stack
        component={'button'}
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          color: '#333',
          opacity: isLastPage ? 0.4 : 1,
        }}
        disabled={isLastPage}
        onClick={onNext}
      >
        <ChevronRight />
      </Stack>
    </Stack>
  );
};

const splitParagraphsIntoPages = (paragraphs: string[], pageSizeChars: number): string[][] => {
  const [firstParagraph, ...restParagraphs] = paragraphs;

  const pages: string[][] = [firstParagraph ? [firstParagraph] : []];
  let currentPage: string[] = pages[0];
  let currentPageCharCount = firstParagraph ? firstParagraph.length : 0;

  restParagraphs.forEach((paragraph) => {
    if (currentPageCharCount + paragraph.length > pageSizeChars) {
      pages.push(currentPage);
      currentPage = [];
      currentPageCharCount = 0;
    }
    currentPage.push(paragraph);
    currentPageCharCount += paragraph.length;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

export const Reader = ({ data }: { data: ReaderData }) => {
  const [activePage, setActivePage] = useState(1);
  const { i18n } = useLingui();

  const allParagraphs = data.content.split('\n').filter((paragraph) => paragraph.trim() !== '');

  const pages = splitParagraphsIntoPages(allParagraphs, 1000);
  const paragraphs = pages[activePage - 1] || [];
  const pageCount = pages.length;

  const isPlaying = false;
  const activeParagraphIndex = 0;

  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: '#F4E1C6',
        color: '#000',
        alignItems: 'center',
        padding: '80px 0px 120px 0px',
        flex: '1 0 0',
        borderRadius: '16px',
        gap: '90px',
        position: 'relative',
      }}
    >
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
        }}
      >
        <Stack sx={{ gap: '20px', width: '100%' }}>
          {paragraphs.map((paragraph, index) => (
            <Stack
              key={index}
              sx={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '20px',
              }}
            >
              <Stack
                className="buttonContainer"
                sx={{
                  width: '100px',
                  paddingTop: '10px',
                }}
              >
                {isPlaying && activeParagraphIndex === index && (
                  <Button
                    startIcon={<Pause size={16} />}
                    sx={{
                      backgroundColor: '#EB5452',
                      borderRadius: '50px',
                      color: '#fff',
                      boxShadow: 'none',
                      padding: '5px 2px 5px 0',
                    }}
                    variant="contained"
                  >
                    {i18n._('Pause')}
                  </Button>
                )}

                {!isPlaying && activeParagraphIndex === index && (
                  <Button
                    startIcon={<Mic size={16} />}
                    sx={{
                      backgroundColor: '#5285eb',
                      borderRadius: '50px',
                      color: '#fff',
                      boxShadow: 'none',
                      padding: '5px 2px 5px 0',
                    }}
                    variant="contained"
                  >
                    {i18n._('Read')}
                  </Button>
                )}
              </Stack>
              <Stack key={index} sx={{ width: '900px', position: 'relative', zIndex: 1 }}>
                <ReaderParagraph key={index} text={paragraph} />
              </Stack>
              <Stack
                sx={{
                  width: '100px',
                }}
                className="annotation"
              ></Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '10px 0',
          zIndex: 0,
        }}
      >
        <PaginationButtons
          onPrevious={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setActivePage((prev) => Math.min(prev + 1, pageCount))}
          isFirstPage={activePage === 1}
          isLastPage={activePage === pageCount}
        />
      </Stack>
    </Stack>
  );
};
