import { useLingui } from '@lingui/react';
import { Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { Check, ChevronLeft, ChevronRight, Loader, Lock } from 'lucide-react';
import { useTranslate } from '../../Translation/useTranslate';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { Markdown } from '../../uiKit/Markdown/Markdown';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { useEffect, useRef, useState } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useAiConversation } from '@/features/Conversation/useAiConversation/useAiConversation';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { getMediaVideoStreams } from '@/features/webCam/mediaStream';
import { useSettings } from '@/features/Settings/useSettings';
import { InteractiveExample } from './InteractiveExample';
import { useGrammarImprovement } from './useGrammarImprovement';
import { useDailyTasks } from '@/features/Tasks/useDailyTasks';
import { sleep } from '@/libs/sleep';
import { uniq } from '@/libs/uniq';
import LockIcon from '@mui/icons-material/Lock';

export const GrammarImprovementModal = () => {
  const grammar = useGrammarImprovement();
  const isOpen =
    grammar.selectedIndex !== null && !!grammar.grammarPoints[grammar.selectedIndex ?? -1];

  if (grammar.isLoadingNew) {
    return (
      <Stack
        sx={{
          width: '100dvw',
          height: '100dvh',
          backgroundColor: '#181818',
          position: 'fixed',

          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />
    );
  }

  if (!isOpen) return <></>;

  return <GrammarImprovementModalContent onClose={grammar.handleCloseModal} />;
};

export const GrammarImprovementModalContent = ({ onClose }: { onClose: () => void }) => {
  const grammar = useGrammarImprovement();
  const improvement = grammar.improvements[grammar.grammarPoints[grammar.selectedIndex!].value];
  const isFirstOne = grammar.selectedIndex === 0;
  const isLastOne = grammar.selectedIndex === grammar.grammarPoints.length - 1;
  const translator = useTranslate();
  const { i18n } = useLingui();
  const audio = useConversationAudio();
  const aiConversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const settings = useSettings();
  const dailyTasks = useDailyTasks();
  const [completedExamples, setCompletedExamples] = useState<string[]>([]);

  const onCompleteExample = (example: string) => {
    setCompletedExamples((prev) => uniq([...prev, example]));
  };

  const isAllExamplesCompleted = improvement
    ? completedExamples.length === improvement.examples.length
    : false;

  const isShowLoader = !improvement;

  const practiceWithAi = async () => {
    audio.initAudio();
    if (!isAllExamplesCompleted) {
      alert(i18n._('Please complete all interactive examples before practicing with AI.'));
      return;
    }

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
    await sleep(1000);
    onClose();

    dailyTasks.onCompleteTask('grammar-improvement');
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
    if (!improvement || !isTranslateAvailable) {
      return;
    }

    improvement.examples.forEach((example) => {
      translateExample(example);
    });
  }, [improvement, isTranslateAvailable]);

  return (
    <>
      <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="40px 0 0px 0">
        <CenterContent gap="90px">
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
            </>
          )}
          {translator.translateModal}
        </CenterContent>

        {!isShowLoader && (
          <>
            <Stack
              sx={{
                width: '100%',
                backgroundColor: 'rgba(79, 88, 110, 0.1)',
                alignItems: 'center',
                paddingTop: '40px',
              }}
            >
              <CenterContent>
                {improvement.examples.length > 0 && (
                  <Stack
                    sx={{
                      gap: '30px',
                      padding: '20px 0',
                    }}
                  >
                    <Stack>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: '600',
                        }}
                      >
                        {i18n._(`Interactive examples:`)}
                      </Typography>
                      <Typography>
                        {i18n._('Complete all examples to unlock the AI training option.')}
                      </Typography>
                    </Stack>

                    <Stack
                      sx={{
                        gap: '45px',
                      }}
                    >
                      {improvement.examples.map((example, index) => (
                        <InteractiveExample
                          example={example}
                          translation={translatedExamplesMap[example] || ''}
                          isTranslateAvailable={isTranslateAvailable || false}
                          translateWithModal={translator.translateWithModal}
                          key={index}
                          onComplete={() => onCompleteExample(example)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}
              </CenterContent>
            </Stack>

            <Stack
              sx={{
                gap: '20px',
                width: '100%',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.96)',
                paddingTop: '60px',
              }}
            >
              <CenterContent>
                {improvement?.examples && (
                  <Stack
                    sx={{
                      gap: '20px',
                    }}
                  >
                    <Stack>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: '600',
                        }}
                      >
                        {i18n._(`Ready to real practice?`)}
                      </Typography>
                      {isAllExamplesCompleted ? (
                        <Typography>
                          {i18n._('Join a call with our AI tutor to practice this rule.')}
                        </Typography>
                      ) : (
                        <Typography>
                          {i18n._('Complete all interactive examples to unlock AI practice.')}
                        </Typography>
                      )}
                    </Stack>

                    <Stack
                      sx={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: '5px 20px',
                        width: '100%',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        color={'info'}
                        variant={isAllExamplesCompleted ? 'contained' : 'outlined'}
                        startIcon={isAllExamplesCompleted ? <VideocamIcon /> : <LockIcon />}
                        size="large"
                        sx={{
                          padding: '10px 30px',
                        }}
                        onClick={practiceWithAi}
                      >
                        {i18n._('Join a Call')}
                      </Button>
                      <Typography>
                        {i18n._('Done:')}{' '}
                        <b>
                          {completedExamples.length} / {improvement.examples.length}
                        </b>
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </CenterContent>
            </Stack>

            <Stack
              sx={{
                gap: '20px',
                width: '100%',
                alignItems: 'center',
                paddingTop: '60px',
              }}
            >
              <CenterContent gap="20px">
                <Stack>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: '600',
                    }}
                  >
                    {i18n._(`Explore more grammar points`)}
                  </Typography>
                  <Typography>{i18n._('Check other grammar points and examples.')}</Typography>
                </Stack>
                <Stack
                  sx={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    gap: '20px',
                  }}
                >
                  <IconButton
                    size="large"
                    disabled={isFirstOne}
                    onClick={grammar.handlePrevious}
                    sx={{
                      border: '1px solid rgba(97, 100, 107, 0.7)',
                    }}
                  >
                    <ChevronLeft size={'18px'} />
                  </IconButton>

                  <IconButton
                    size="large"
                    disabled={isLastOne}
                    onClick={grammar.handleNext}
                    sx={{
                      border: '1px solid rgba(97, 100, 107, 0.7)',
                    }}
                  >
                    <ChevronRight size={'18px'} />
                  </IconButton>
                </Stack>
              </CenterContent>
            </Stack>
          </>
        )}
      </CustomModal>
    </>
  );
};

const CenterContent = ({ children, gap }: { children: React.ReactNode; gap?: string }) => {
  return (
    <Stack
      sx={{
        gap: gap,
        padding: '20px 5px',
        width: '100%',
        maxWidth: '700px',
        paddingBottom: '80px',
        opacity: 0,
        animation: `fadeInOpacity  1.6s ease 100ms forwards`,
      }}
    >
      {children}
    </Stack>
  );
};
