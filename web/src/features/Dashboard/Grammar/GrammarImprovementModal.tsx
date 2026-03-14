import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useTranslate } from '../../Translation/useTranslate';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { GrammarImprovement } from './types';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useAiConversation } from '@/features/Conversation/useAiConversation/useAiConversation';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { getMediaVideoStreams } from '@/features/webCam/mediaStream';
import { useSettings } from '@/features/Settings/useSettings';
import { InteractiveExample } from './InteractiveExample';

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
  const auth = useAuth();
  const audio = useConversationAudio();
  const aiConversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const settings = useSettings();

  const practiceWithAi = async () => {
    audio.initAudio();
    if (!improvement || isCallStarting) return;
    setIsCallStarting(true);

    try {
      /*const mediaStream = await getMediaAudioStreams();
          if (!mediaStream) {
            throw new Error('Could not access microphone');
          }*/

      //await sleep(100);
      await getMediaVideoStreams();
    } catch (e) {
      console.error('Microphone permission denied. error', e);
      alert(
        i18n._(
          'Microphone permission is required to start the call. Please allow microphone access and try again.',
        ),
      );
      window.location.reload();
      setIsCallStarting(false);
      return;
    }

    const baseInstruction = `${improvement.description}
    
Important: User already read the rule.
    
Your goal is to talk with user and make them practice this rule. You should try to make user produce different sentences with this grammar rule. 

You should ask user questions to make them produce more sentences with this grammar rule.

You should not explain the rule, just make user practice it.

Cover all examples: ${improvement.examples.join('\n')}.

When user struggle with one example, try to switch to another example and come back later to the difficult one.
`;

    await settings.setConversationMode('record');

    await aiConversation.startConversation({
      mode: 'grammar-improvement',
      ruleToLearn: baseInstruction,
      conversationMode: 'record',
    });
    setIsCallStarting(false);
  };

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

  const isShowLoader = isLoading || !improvement;

  return (
    <>
      <CustomModal isOpen={isOpen} onClose={onClose}>
        <Stack
          sx={{
            gap: '90px',
            padding: '20px',
            width: '100%',
            maxWidth: '700px',
            paddingBottom: '80px',
            opacity: 0,
            animation: `fadeInOpacity  1.6s ease 100ms forwards`,
          }}
        >
          {isShowLoader ? (
            <Stack
              sx={{
                width: '100%',
                gap: '20px',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {i18n._('Creating your improvement...')}
              </Typography>
              <Typography variant="body2" sx={{}}>
                {i18n._(
                  'It might take about a minute to prepare rules and examples based on your conversation. Please wait.',
                )}
              </Typography>
              <LoadingShapes sizes={['30px', '200px', '30px', '200px']} />
            </Stack>
          ) : (
            <>
              <Stack
                sx={{
                  gap: '20px',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {improvement.title}
                </Typography>
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
                    {i18n._(`Interactive examples:`)}
                  </Typography>
                  <Stack
                    sx={{
                      gap: '50px',
                    }}
                  >
                    {improvement.examples.map((example, index) => (
                      <InteractiveExample
                        example={example}
                        translation={translatedExamplesMap[example] || ''}
                        isTranslateAvailable={isTranslateAvailable || false}
                        translateWithModal={translator.translateWithModal}
                        key={index}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}
              <Stack
                sx={{
                  gap: '20px',
                }}
              >
                <Stack
                  sx={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    gap: '20px',
                  }}
                >
                  <Button
                    color="info"
                    variant="contained"
                    size="large"
                    endIcon={isCallStarting ? <Loader /> : <VideocamIcon />}
                    sx={{
                      padding: '10px 30px',
                    }}
                    onClick={practiceWithAi}
                  >
                    {i18n._('Practice with AI')}
                  </Button>
                </Stack>

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
                    fullWidth
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
                    variant="outlined"
                    color="info"
                    size="large"
                    fullWidth
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
              </Stack>
            </>
          )}
          {translator.translateModal}
        </Stack>
      </CustomModal>
    </>
  );
};
