'use client';

import { Stack } from '@mui/material';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { QuizProvider, useQuiz } from './useQuiz';
import { ProgressBar } from './ProgressBar';
import { LanguageToLearnShortSelector } from './LanguageToLearnSelector';
import { InfoStep } from '../../Survey/InfoStep';
import { NativeLanguageSelector } from './NativeLanguageSelector';
import { PageLanguageSelector } from './PageLanguageSelector';
import { GoalReview } from './GoalReview';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  buildJustTalkPracticeUrl,
  markJustTalkAutoStart,
} from '@/features/Conversation/justTalkHandoff';
import { markQuizTalkAbout } from '@/features/Conversation/quizTalk';
import { sleep } from '@/libs/sleep';
import { requestMicrophoneAccess } from '@/libs/mic';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { useSettings } from '@/features/Settings/useSettings';
import { TeacherSelectionQuizStep } from './TeacherSelectionQuizStep';
import { QuizBeforeRecordAboutGate } from './QuizBeforeRecordAboutGate';
import { QuizMicPermissionStep } from './QuizMicPermissionStep';
import { hasAboutTranscription } from './quizGuestAboutStorage';

const QuizQuestions = () => {
  const {
    currentStep,
    isFirstLoading,
    survey,
    saveAboutClip,
    languageToLearn,
    isStepLoading,
    nextStep,
    confirmPlan,
    pageLanguage,
    isGoalGenerating,
    isLastStep,
  } = useQuiz();
  const { i18n } = useLingui();
  const settings = useSettings();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const recordAboutTitle = i18n._('Why do you want to practice speaking?');
  const recordAboutQuestion = i18n._(
    `I will use your answer to create your personalized plan. Please say two or three sentences.`,
  );
  const recordAboutPrompt = `${recordAboutTitle} ${recordAboutQuestion}`;

  const doneQuiz = async () => {
    setRedirecting(true);

    try {
      if (languageToLearn && settings.userSettings?.languageCode !== languageToLearn) {
        await settings.setLanguage(languageToLearn);
      }
      const micOkPromise = requestMicrophoneAccess();
      await confirmPlan();
      if (await micOkPromise) {
        markJustTalkAutoStart();
      }
      markQuizTalkAbout(survey?.aboutUserTranscription);
      router.push(
        buildJustTalkPracticeUrl({
          pageLanguage,
        }),
      );
    } catch (e) {
      alert(i18n._('Error creating plan. Please try again.'));
    }
    await sleep(4000);
    setRedirecting(false);
  };

  const next = () => {
    if (isLastStep) {
      void doneQuiz();
    } else {
      void nextStep();
    }
  };

  if (redirecting) {
    return <QuizPageLoader />;
  }

  return (
    <Stack
      component={'main'}
      sx={{
        width: '100%',
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: 'center',
      }}
    >
      <ProgressBar />

      {!isFirstLoading && (
        <Stack
          sx={{
            maxWidth: '600px',
            padding: '0 10px',
            width: '100%',
          }}
        >
          {currentStep === 'learnLanguage' && (
            <InfoStep
              title={i18n._(`I want to learn:`)}
              subComponent={<LanguageToLearnShortSelector />}
              actionButtonTitle={i18n._(`Next`)}
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'before_nativeLanguage' && (
            <InfoStep
              title={i18n._(`What language do you speak`)}
              subTitle={i18n._(`So I can translate words for you`)}
              actionButtonTitle={i18n._(`Set My Language`)}
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'teacherSelection' && (
            <TeacherSelectionQuizStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'nativeLanguage' && <NativeLanguageSelector />}

          {currentStep === 'before_pageLanguage' && (
            <InfoStep
              title={i18n._(`Choose Site Language`)}
              subTitle={i18n._(`This is text you see on buttons and menus`)}
              imageUrl="/illustrations/ui-schema.png"
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'pageLanguage' && <PageLanguageSelector />}

          {currentStep === 'micPermission' && (
            <QuizMicPermissionStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'before_recordAbout' && (
            <QuizBeforeRecordAboutGate
              languageCode={languageToLearn}
              title={recordAboutTitle}
              subTitle={recordAboutQuestion}
              promptText={recordAboutPrompt}
              alreadySaved={hasAboutTranscription(survey)}
              onSaveRecording={async (recording) => {
                await saveAboutClip(recording);
              }}
              onContinue={next}
            />
          )}

          {currentStep === 'before_goalReview' && (
            <InfoStep
              title={i18n._(`We are ready to craft your plan.`)}
              subTitle={i18n._(`It might take up to a minute.`)}
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'goalReview' && (
            <GoalReview
              onClick={next}
              isLoading={isGoalGenerating || survey?.goalData === null}
              goalData={survey?.goalData}
              actionButtonLabel={i18n._('Start Speaking')}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  return (
    <QuizProvider pageLang={lang} defaultLangToLearn={defaultLangToLearn}>
      <QuizQuestions />
    </QuizProvider>
  );
};
