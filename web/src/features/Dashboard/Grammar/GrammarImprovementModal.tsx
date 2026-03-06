import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AudioPlayIcon } from '../../Audio/AudioPlayIcon';
import { useTranslate } from '../../Translation/useTranslate';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { GrammarImprovement } from './types';
import { useEffect, useRef, useState } from 'react';

export const GrammarImprovementModal = ({
  improvement,
  isLoading,
  isFirstOne,
  isLastOne,
  isOpen,
  onClose,
  onClickNext,
  onClickPrevious,
}: {
  improvement: GrammarImprovement | null;
  isLoading: boolean;
  isFirstOne: boolean;
  isLastOne: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClickNext: () => void;
  onClickPrevious: () => void;
}) => {
  const translator = useTranslate();
  const { i18n } = useLingui();

  const isTranslateAvailable = translator.isTranslateAvailable;

  const [translatedExamplesMap, setTranslatedExamplesMap] = useState<Record<string, string>>({});
  const translatedExamplesProgressMap = useRef<Record<string, Promise<string> | null>>({});

  const translateExample = async (example: string) => {
    if (translatedExamplesMap[example]) {
      return translatedExamplesMap[example];
    }

    if (translatedExamplesProgressMap.current[example]) {
      return translatedExamplesProgressMap.current[example];
    }

    const translatedPromise = translator.translateText({ text: example });
    translatedExamplesProgressMap.current[example] = translatedPromise;
    const translated = await translatedPromise;
    setTranslatedExamplesMap((prev) => ({ ...prev, [example]: translated }));
    translatedExamplesProgressMap.current[example] = null;
    return translated;
  };

  useEffect(() => {
    if (!isOpen || !improvement || !isTranslateAvailable) {
      return;
    }

    improvement.examples.forEach((example) => {
      translateExample(example);
    });
  }, [isOpen, improvement, isTranslateAvailable]);

  const rowHeight = '40px';

  if (isLoading || !improvement) return <LoadingShapes sizes={[rowHeight]} />;
  return (
    <>
      <CustomModal isOpen={isOpen} onClose={onClose}>
        <Stack
          sx={{
            gap: '90px',
            padding: '20px',
            maxWidth: '700px',
            paddingBottom: '80px',
            opacity: 0,
            animation: `fadeInOpacity  1.6s ease 100ms forwards`,
          }}
        >
          <Stack
            sx={{
              gap: '0px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textTransform: 'uppercase',
              }}
            >
              {improvement.title}
            </Typography>
            <Stack>
              <Markdown
                variant="rule"
                onWordClick={
                  translator.isTranslateAvailable
                    ? (word, element) => {
                        translator.translateWithModal(word, element);
                      }
                    : undefined
                }
              >
                {'\n' + improvement.description}
              </Markdown>
            </Stack>
          </Stack>

          {improvement.examples.length > 0 && (
            <Stack sx={{ gap: '10px' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Examples:
              </Typography>
              <Stack
                sx={{
                  gap: '50px',
                }}
              >
                {improvement.examples.map((example, index) => (
                  <Stack
                    key={index}
                    sx={{
                      gap: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      //padding: '10px',
                      overflow: 'hidden',
                      '@media (max-width: 600px)': {
                        border: 'none',
                      },
                    }}
                  >
                    <Stack
                      sx={{
                        padding: '10px',
                        gap: '7px',
                        '@media (max-width: 600px)': {
                          padding: 0,
                        },
                      }}
                    >
                      <Stack
                        sx={{
                          '* strong': {
                            backgroundColor: 'rgba(11, 130, 194, 0.79)',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontWeight: '700',
                          },
                        }}
                      >
                        <Markdown
                          onWordClick={
                            translator.isTranslateAvailable
                              ? (word, element) => {
                                  translator.translateWithModal(word, element);
                                }
                              : undefined
                          }
                          variant="rule"
                        >
                          {'\n' + example}
                        </Markdown>
                      </Stack>
                      {isTranslateAvailable && (
                        <Stack
                          sx={{
                            fontSize: '16px',

                            '* strong': {
                              color: 'rgb(255, 255, 255)',
                              fontWeight: 800,
                            },
                          }}
                        >
                          <Markdown variant="small">
                            {translatedExamplesMap[example] || 'Translating...'}
                          </Markdown>
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        //padding: '0 10px 10px 10px',
                        padding: '10px',
                        gap: '10px',
                        '@media (max-width: 600px)': {
                          backgroundColor: 'transparent',
                          padding: '0',
                        },
                      }}
                    >
                      <AudioPlayIcon text={example} type="icon" />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          )}

          <Stack
            sx={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              gap: '20px',
            }}
          >
            <Button
              color="info"
              variant="outlined"
              size="large"
              sx={{
                padding: '10px 30px',
              }}
              disabled={isFirstOne}
              onClick={onClickPrevious}
              startIcon={<ChevronLeft size={'18px'} />}
            >
              {i18n._('Previous')}
            </Button>

            <Button
              variant="contained"
              color="info"
              size="large"
              sx={{
                padding: '10px 30px',
              }}
              disabled={isLastOne}
              onClick={onClickNext}
              endIcon={<ChevronRight size={'18px'} />}
            >
              {i18n._('Next')}
            </Button>
          </Stack>
          {translator.translateModal}
        </Stack>
      </CustomModal>
    </>
  );
};
