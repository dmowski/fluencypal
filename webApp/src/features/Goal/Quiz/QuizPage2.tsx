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
import { useCallback, useEffect, useRef, useState } from 'react';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useAuth } from '@/features/Auth/useAuth';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { useSettings } from '@/features/Settings/useSettings';
import { TeacherSelectionQuizStep } from './TeacherSelectionQuizStep';
import { QuizPlayerIdentityStep } from './QuizPlayerIdentityStep';
import { QuizBeforeGoalReviewStep } from './QuizBeforeGoalReviewStep';
import { QuizBeforeRecordAboutGate } from './QuizBeforeRecordAboutGate';
import { QuizMicPermissionStep, QuizRecordingConsentStep } from './QuizRecordingConsentStep';
import { hasAboutTranscription, hasFollowUpTranscription } from './quizGuestAboutStorage';
import { isFollowUpQuestionReady } from './followUpQuestion';
import { followUpSubtitle, practiceReasonExamples } from './onboardingContent';
import {
  QuizActivityChoiceStep,
  QuizFeatureAiTalkStep,
  QuizFeatureDailyLessonStep,
  QuizFeatureGameStep,
  QuizFeaturePersonalPlanStep,
} from './QuizActivitySteps';
import {
  QuizAuthWallStep,
  QuizDailyPracticeStep,
  QuizLimitedAccessStep,
  QuizNoRemindersStep,
  QuizPreAuthStep,
  QuizReviewsStep,
  QuizTalkWithPeopleStep,
} from './QuizExpectationSteps';

const QuizSignedInHandoff = ({ start, ready }: { start: () => Promise<void>; ready: boolean }) => {
  const startRef = useRef(start);
  startRef.current = start;
  const [failed, setFailed] = useState(false);
  const { i18n } = useLingui();

  const run = useCallback(() => {
    if (!ready) return;
    setFailed(false);
    void startRef.current().catch(() => setFailed(true));
  }, [ready]);

  useEffect(() => {
    run();
  }, [run]);

  if (failed) {
    return (
      <InfoStep
        title={i18n._('Error creating plan. Please try again.')}
        actionButtonTitle={i18n._('Try again')}
        onClick={run}
      />
    );
  }

  return <QuizPageLoader />;
};

const QuizQuestions = () => {
  const {
    currentStep,
    isFirstLoading,
    survey,
    saveAboutClip,
    saveFollowUpClip,
    followUpQuestionError,
    retryFollowUpQuestion,
    saveWantsRealPeople,
    continueWithActivities,
    languageToLearn,
    isStepLoading,
    nextStep,
    confirmPlan,
    pageLanguage,
    isGoalGenerating,
    isLastStep,
  } = useQuiz();
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const router = useRouter();
  const startLock = useRef(false);

  const recordAboutTitle = i18n._('Why do you want to practice?');
  const recordAboutQuestion = i18n._(
    'Say a few sentences in your own words. The examples below are only ideas.',
  );
  const recordAboutPrompt = `${recordAboutTitle} ${recordAboutQuestion}`;
  const reasonExamples = practiceReasonExamples(i18n);
  const followUpHint = followUpSubtitle(i18n);
  const followUpReady = isFollowUpQuestionReady(
    survey?.aboutUserFollowUpQuestion,
    survey?.aboutUserTranscription || '',
    pageLanguage,
  );
  const followUp = survey?.aboutUserFollowUpQuestion.title.trim() || '';

  const startFirstLesson = useCallback(async () => {
    if (startLock.current) return;
    startLock.current = true;

    try {
      if (languageToLearn && settings.userSettings?.languageCode !== languageToLearn) {
        await settings.setLanguage(languageToLearn);
      }
      await confirmPlan();
      const firstLessonId = survey?.goalData?.elements[0]?.id;
      if (!firstLessonId) {
        throw new Error('Plan has no lesson to open');
      }
      router.push(
        `${getUrlStart(pageLanguage)}practice?plan-id=${encodeURIComponent(firstLessonId)}`,
      );
    } catch (e) {
      console.error(e);
      startLock.current = false;
      throw e;
    }
  }, [confirmPlan, languageToLearn, pageLanguage, router, settings, survey?.goalData]);

  const next = () => {
    if (isLastStep) {
      void startFirstLesson().catch(() => undefined);
    } else {
      void nextStep();
    }
  };

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

          {currentStep === 'playerIdentity' && (
            <QuizPlayerIdentityStep onContinue={next} isStepLoading={isStepLoading} />
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

          {currentStep === 'recordingConsent' && (
            <QuizRecordingConsentStep
              pageLanguage={pageLanguage}
              onContinue={next}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'micPermission' && (
            <QuizMicPermissionStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'before_recordAbout' && (
            <QuizBeforeRecordAboutGate
              languageCode={languageToLearn}
              title={recordAboutTitle}
              subTitle={recordAboutQuestion}
              promptText={recordAboutPrompt}
              examples={reasonExamples}
              alreadySaved={hasAboutTranscription(survey)}
              savedTranscript={survey?.aboutUserTranscription}
              onSaveRecording={async (recording) => {
                await saveAboutClip(recording);
              }}
              onContinue={next}
            />
          )}

          {currentStep === 'recordAboutFollowUp' &&
            (followUpReady ? (
              <QuizBeforeRecordAboutGate
                languageCode={languageToLearn}
                title={followUp}
                subTitle={followUpHint}
                promptText={`${followUp} ${followUpHint}`}
                contextMessage={survey?.aboutUserTranscription}
                alreadySaved={hasFollowUpTranscription(survey)}
                savedTranscript={survey?.aboutUserFollowUpTranscription}
                onSaveRecording={async (recording) => {
                  await saveFollowUpClip(recording);
                }}
                onContinue={next}
              />
            ) : followUpQuestionError ? (
              <InfoStep
                title={i18n._('Could not write your next question. Please try again.')}
                actionButtonTitle={i18n._('Try again')}
                onClick={retryFollowUpQuestion}
              />
            ) : (
              <QuizPageLoader />
            ))}

          {currentStep === 'talkWithPeople' && (
            <QuizTalkWithPeopleStep
              onChoose={(value) => {
                void saveWantsRealPeople(value).then(() => next());
              }}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'dailyPractice' && (
            <QuizDailyPracticeStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'noReminders' && (
            <QuizNoRemindersStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'limitedAccess' && (
            <QuizLimitedAccessStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'reviews' && (
            <QuizReviewsStep
              pageLanguage={pageLanguage}
              onContinue={next}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'activityChoice' && (
            <QuizActivityChoiceStep
              onContinue={(activities) => {
                void continueWithActivities(activities);
              }}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'featureDailyLesson' && (
            <QuizFeatureDailyLessonStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'featureGame' && (
            <QuizFeatureGameStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'featureAiTalk' && (
            <QuizFeatureAiTalkStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'featurePersonalPlan' && (
            <QuizFeaturePersonalPlanStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'before_goalReview' && (
            <QuizBeforeGoalReviewStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'goalReview' && (
            <GoalReview
              onClick={next}
              isLoading={isGoalGenerating || survey?.goalData === null}
              goalData={survey?.goalData}
              actionButtonLabel={i18n._('Continue')}
            />
          )}

          {currentStep === 'preAuth' && (
            <QuizPreAuthStep onContinue={next} isStepLoading={isStepLoading} />
          )}

          {currentStep === 'authWall' && (
            <QuizAuthWallStep>
              {survey?.goalData ? (
                <QuizSignedInHandoff start={startFirstLesson} ready={auth.isIdentified} />
              ) : (
                <QuizPageLoader />
              )}
            </QuizAuthWallStep>
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
