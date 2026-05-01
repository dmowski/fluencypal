import { Stack } from '@mui/material';
import { Book } from './types';
import { ReaderHeader } from './ReaderHeader';
import { Mic, Pause } from 'lucide-react';
import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { PaginationPanel } from './PaginationButtons';
import { ReaderParagraph } from './ReaderParagraph';
import { useBrowserSpeech } from './useBrowserSpeech';
import { ReaderSpeechSettingsButton } from './ReaderSpeechSettingsButton';
import { ReaderButton } from './ReaderButton';
import { useNativeRealtimeTranscript } from '../Transcript/useNativeRealtimeTranscript';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { useBooks } from './useBooks';

export const Reader = ({ data }: { data: Book }) => {
  const [activePage, setActivePage] = useState(1);
  const { i18n } = useLingui();
  const books = useBooks();

  const pageCount = 1;

  const activeParagraphIndex = 0;

  const speech = useBrowserSpeech();
  const recorder = useNativeRealtimeTranscript();

  const isRecording = recorder.isActive || recorder.isActivating;

  const playText = (text: string) => {
    speech.play(text.trim());
  };

  const startRecording = () => {
    recorder.start();
  };

  const pauseRecording = () => {
    recorder.stop();
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
          <Stack
            sx={{
              alignItems: 'center',
              display: 'none',
            }}
          >
            <Stack
              sx={{
                maxWidth: '900px',
                width: '100%',
                fontFamily: 'serif',
                fontSize: '36px',
                lineHeight: '1.5',
                '*': {
                  fontFamily: 'serif',
                },
                '* em': {
                  color: 'rgb(12, 12, 12)',
                  fontStyle: 'normal',
                  backgroundColor: 'rgba(253, 178, 178, 0.93)',
                  borderRadius: '3px',
                },
              }}
            >
              <Markdown variant="rule">{'hello'}</Markdown>
            </Stack>
          </Stack>

          {data.paragraphs.map((paragraph, index) => (
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
                  <ReaderButton
                    startIcon={<Pause size={16} />}
                    type="error"
                    disabled={recorder.isActivating}
                    onClick={pauseRecording}
                  >
                    {i18n._('Pause')}
                  </ReaderButton>
                )}

                {!isRecording && activeParagraphIndex === index && (
                  <ReaderButton
                    startIcon={<Mic size={16} />}
                    onClick={startRecording}
                    disabled={recorder.isActivating}
                  >
                    {i18n._('Read')}
                  </ReaderButton>
                )}
              </Stack>
              <Stack key={index} sx={{ width: '900px', position: 'relative', zIndex: 1 }}>
                <ReaderParagraph
                  key={index}
                  paragraphIndex={index}
                  words={paragraph}
                  onWordClick={playText}
                  onTextSelected={playText}
                  highlights={(data.highlights ?? []).filter(
                    (highlight) => (highlight.paragraphIndex ?? 0) === index,
                  )}
                  onHighlightColorSelect={books.applySelectedHighlight}
                  onRemoveHighlight={books.removeHighlight}
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
