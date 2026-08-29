'use client';

import { useEffect, useRef } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SupportedLanguage } from '@/features/Lang/lang';
import { LanguageSetupView } from './LanguageSetupView';
import { LessonPreparingView } from './LessonPreparingView';
import { LessonPartSection } from './LessonPartSection';
import { LessonResultsView } from './LessonResultsView';
import { LessonScrollProgress } from './LessonScrollProgress';
import { ThinkingProgress } from './ThinkingProgress';
import { InteractiveLesson } from './types';
import { NativeLangCode } from '@/libs/language/type';

export const InteractiveLessonModalContent = ({
  lesson,
  languageCode,
  needsLanguageSetup,
  nativeLanguageCode,
  targetLanguageCode,
  isStoreReady,
  isGeneratingLesson,
  isGeneratingNext,
  isGeneratingResults,
  evaluatingPartIndex,
  errorMessage,
  onClose,
  onEnsureLesson,
  onChangeNative,
  onChangeTarget,
  onSubmitSpeech,
  onFinishLesson,
  onNextLesson,
}: {
  lesson: InteractiveLesson | null;
  languageCode: SupportedLanguage;
  needsLanguageSetup: boolean;
  nativeLanguageCode: NativeLangCode | null;
  targetLanguageCode: SupportedLanguage | null;
  isStoreReady: boolean;
  isGeneratingLesson: boolean;
  isGeneratingNext: boolean;
  isGeneratingResults: boolean;
  evaluatingPartIndex: number | null;
  errorMessage: string;
  onClose: () => void;
  onEnsureLesson: () => Promise<void>;
  onChangeNative: (languageCode: NativeLangCode) => void;
  onChangeTarget: (languageCode: SupportedLanguage) => void;
  onSubmitSpeech: (partIndex: number, transcript: string, blob: Blob | null) => Promise<void>;
  onFinishLesson: () => Promise<void>;
  onNextLesson: () => Promise<void>;
}) => {
  const { i18n } = useLingui();
  const contentRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const ensuredRef = useRef(false);

  useEffect(() => {
    if (!isStoreReady) {
      ensuredRef.current = false;
      return;
    }
    if (needsLanguageSetup || lesson) return;
    if (ensuredRef.current) return;
    ensuredRef.current = true;
    void onEnsureLesson();
  }, [isStoreReady, needsLanguageSetup, lesson, onEnsureLesson]);

  useEffect(() => {
    if (!lesson?.lessonResults || !resultsRef.current) return;
    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [lesson?.lessonResults]);

  const handleContinueLanguages = () => {
    ensuredRef.current = false;
    void onEnsureLesson();
  };

  const showPreparing =
    !needsLanguageSetup && !lesson && (isGeneratingLesson || !isStoreReady || !errorMessage);
  const showLoadError = !needsLanguageSetup && !lesson && !!errorMessage && !isGeneratingLesson;

  return (
    <Stack
      sx={{
        backgroundColor: '#37373a',
        color: '#EBEBF5',
        width: '100%',
        height: '100%',
        padding: '0 10px',
      }}
    >
      <Stack
        ref={contentRef}
        data-testid="interactive-lesson-modal"
        sx={{
          gap: '24px',
          padding: '20px 5px 100px',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {needsLanguageSetup ? (
          <LanguageSetupView
            nativeLanguageCode={nativeLanguageCode}
            targetLanguageCode={targetLanguageCode}
            onChangeNative={onChangeNative}
            onChangeTarget={onChangeTarget}
            onContinue={handleContinueLanguages}
          />
        ) : showPreparing ? (
          <LessonPreparingView />
        ) : showLoadError ? (
          <Stack sx={{ gap: '16px' }} data-testid="interactive-lesson-load-error">
            <Alert severity="error">{errorMessage}</Alert>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                ensuredRef.current = false;
                void onEnsureLesson();
              }}
            >
              {i18n._('Retry')}
            </Button>
          </Stack>
        ) : lesson ? (
          <>
            <Stack
              sx={{
                paddingTop: '40px',
                h1: {
                  fontSize: '54px',
                  fontWeight: 800,
                  '@media (max-width:600px)': { fontSize: '32px' },
                },
              }}
            >
              <Markdown variant="rule">{`\n # ${lesson.title} \n\n ${lesson.subTitle}`}</Markdown>
            </Stack>

            {lesson.parts.map((part, index) => (
              <LessonPartSection
                key={`${lesson.id}-${index}`}
                part={part}
                partIndex={index}
                languageCode={languageCode}
                isEvaluating={evaluatingPartIndex === index}
                onSubmitSpeech={onSubmitSpeech}
              />
            ))}

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <Button
              variant="contained"
              color="info"
              onClick={() => {
                void onFinishLesson();
              }}
              disabled={!!lesson.lessonResults || isGeneratingResults}
              data-testid="interactive-lesson-done"
              sx={{ padding: '12px 28px', alignSelf: 'flex-start' }}
            >
              {i18n._('I am done')}
            </Button>

            {isGeneratingResults && !lesson.lessonResults && <ThinkingProgress />}

            <Stack ref={resultsRef}>
              <LessonResultsView
                results={lesson.lessonResults}
                languageCode={languageCode}
                isGeneratingResults={isGeneratingResults}
                isGeneratingNext={isGeneratingNext}
                onNextLesson={() => {
                  void onNextLesson();
                }}
                onFinish={onClose}
              />
            </Stack>
          </>
        ) : (
          <Typography>{i18n._('Could not load the lesson.')}</Typography>
        )}
      </Stack>
      {!needsLanguageSetup && lesson && <LessonScrollProgress anchorRef={contentRef} />}
    </Stack>
  );
};

export const InteractiveLessonModal = ({
  isOpen,
  onClose,
  ...contentProps
}: {
  isOpen: boolean;
  onClose: () => void;
} & Omit<
  Parameters<typeof InteractiveLessonModalContent>[0],
  'onClose'
>) => {
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="0" desktopPadding="0">
      <InteractiveLessonModalContent onClose={onClose} {...contentProps} />
    </CustomModal>
  );
};
