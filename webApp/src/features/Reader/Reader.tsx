import { Button, Stack } from '@mui/material';
import { ReaderData } from './types';
import { ReaderHeader } from './ReaderHeader';
import { Mic, Pause } from 'lucide-react';
import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './ReaderParagraph';
import { splitParagraphsIntoPages } from './splitParagraphsIntoPages';
import { useBrowserSpeech } from './useBrowserSpeech';
import { ReaderSpeechSettingsButton } from './ReaderSpeechSettingsButton';
import { ReaderButton } from './ReaderButton';

export const Reader = ({ data }: { data: ReaderData }) => {
  const [activePage, setActivePage] = useState(1);
  const { i18n } = useLingui();

  const allParagraphs = data.content.split('\n').filter((paragraph) => paragraph.trim() !== '');

  const pages = splitParagraphsIntoPages(allParagraphs, 1000);
  const paragraphs = pages[activePage - 1] || [];
  const pageCount = pages.length;

  const isRecording = false;
  const activeParagraphIndex = 0;

  const speech = useBrowserSpeech();

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
                  paddingTop: '15px',
                }}
              >
                {isRecording && activeParagraphIndex === index && (
                  <ReaderButton startIcon={<Pause size={16} />} type="error" onClick={() => {}}>
                    {i18n._('Pause')}
                  </ReaderButton>
                )}

                {!isRecording && activeParagraphIndex === index && (
                  <ReaderButton startIcon={<Mic size={16} />} onClick={() => {}}>
                    {i18n._('Read')}
                  </ReaderButton>
                )}
              </Stack>
              <Stack key={index} sx={{ width: '900px', position: 'relative', zIndex: 1 }}>
                <ReaderParagraph
                  key={index}
                  text={paragraph}
                  onWordClick={playText}
                  onTextSelected={playText}
                />
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

      <PaginationPanel
        onPrevious={() => setActivePage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setActivePage((prev) => Math.min(prev + 1, pageCount))}
        isFirstPage={activePage === 1}
        isLastPage={activePage === pageCount}
      />
    </Stack>
  );
};
