'use client';

import { useEffect, useRef } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Check, SkipForward } from 'lucide-react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SupportedLanguage } from '@/features/Lang/lang';
import { LanguageSetupView } from './LanguageSetupView';
import { LessonPreparingView } from './LessonPreparingView';
import { LessonPartSection } from './LessonPartSection';
import { LessonResultsView } from './LessonResultsView';
import { LessonScrollProgress } from './LessonScrollProgress';
import { ThinkingProgress } from './ThinkingProgress';
import { InteractiveLesson, isOpenTalkPart } from './types';
import { NativeLangCode } from '@/libs/language/type';
import { isLessonUserError } from './lessonErrors';
import { findScrollParent } from './findScrollParent';

export const InteractiveLessonModalContent = ({
  lesson,
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
  onPrepareSpeechAudio,
  onSubmitSpeech,
  onFinishLesson,
  onSkipLesson,
  onNextLesson,
}: {
  lesson: InteractiveLesson | null;
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
  onPrepareSpeechAudio: (partIndex: number, blob: Blob) => void;
  onSubmitSpeech: (partIndex: number, transcript: string, blob: Blob | null) => Promise<void>;
  onFinishLesson: () => Promise<void>;
  onSkipLesson: () => Promise<void>;
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

  const scrollLessonToTop = () => {
    const scrollEl = findScrollParent(contentRef.current);
    if (scrollEl) {
      scrollEl.scrollTo({ top: 0 });
      return;
    }
    contentRef.current?.scrollIntoView({ block: 'start' });
  };

  const handleContinueLanguages = () => {
    ensuredRef.current = false;
    void onEnsureLesson();
  };

  const showPreparing =
    !needsLanguageSetup && !lesson && (isGeneratingLesson || !isStoreReady || !errorMessage);
  const showLoadError = !needsLanguageSetup && !lesson && !!errorMessage && !isGeneratingLesson;
  const visibleError = isLessonUserError(errorMessage)
    ? i18n._(
        "Something went wrong. Alex is notified. If he doesn't fix it, please write in the global chat.",
      )
    : errorMessage;

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
            <Alert severity="error">{visibleError}</Alert>
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
                isEvaluating={evaluatingPartIndex === index}
                isOpenTalk={isOpenTalkPart(lesson.parts, index)}
                onPrepareSpeechAudio={onPrepareSpeechAudio}
                onSubmitSpeech={onSubmitSpeech}
              />
            ))}

            {errorMessage && <Alert severity="error">{visibleError}</Alert>}

            <Stack
              sx={{
                flexDirection: 'row',
                gap: '22px',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginTop: '34px',
                borderTop: '1px solid #444447',
                paddingTop: '24px',
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Check size={20} />}
                onClick={() => {
                  void onFinishLesson();
                }}
                disabled={!!lesson.lessonResults || isGeneratingResults}
                data-testid="interactive-lesson-done"
              >
                {i18n._("I'm done")}
              </Button>
              <Button
                variant="text"
                color="error"
                startIcon={<SkipForward size={20} />}
                onClick={() => {
                  const confirmed = window.confirm(
                    i18n._('Skip this lesson and generate a new one?'),
                  );
                  if (!confirmed) return;
                  void onSkipLesson();
                }}
                disabled={!!lesson.lessonResults || isGeneratingResults || isGeneratingLesson}
                data-testid="interactive-lesson-skip"
              >
                {i18n._('Skip this lesson')}
              </Button>
            </Stack>

            {isGeneratingResults && !lesson.lessonResults && <ThinkingProgress />}

            <Stack ref={resultsRef}>
              <LessonResultsView
                results={lesson.lessonResults}
                isGeneratingResults={isGeneratingResults}
                isGeneratingNext={isGeneratingNext}
                onNextLesson={() => {
                  void onNextLesson();
                  scrollLessonToTop();
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
