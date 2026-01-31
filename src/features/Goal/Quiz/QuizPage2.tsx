'use client';

import { FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { MIN_WORDS_FOR_ANSWER, QuizProvider, useQuiz } from './useQuiz';
import { useLanguageGroup } from '../useLanguageGroup';
import { Trans } from '@lingui/react/macro';
import { WebViewWall } from '@/features/Auth/WebViewWall';
import { AuthWall } from '@/features/Auth/AuthWall';
import { ProgressBar } from './ProgressBar';
import { LanguageToLearnSelector } from './LanguageToLearnSelector';
import { InfoStep } from '../../Survey/InfoStep';
import { NativeLanguageSelector } from './NativeLanguageSelector';
import { PageLanguageSelector } from './PageLanguageSelector';
import { RecordUserAudio } from './RecordUserAudio';
import { RecordAboutFollowUp } from './RecordAboutFollowUp';
import { GoalReview } from './GoalReview';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { sleep } from '@/libs/sleep';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import {
  BotOff,
  Check,
  ChevronDown,
  ChevronsRight,
  ChevronUp,
  LockOpen,
  ShieldCheck,
} from 'lucide-react';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { WelcomeChatMessage } from './WelcomeChatMessage';
import { useSettings } from '@/features/Settings/useSettings';
import { SelectTeacher } from '@/features/Conversation/CallMode/SelectTeacher';
import { AiAvatarVideo } from '@/features/Conversation/CallMode/AiAvatarVideo';
import { getAiVoiceByVoice } from '@/features/Conversation/CallMode/voiceAvatar';
import { AiAvatar } from '@/features/Conversation/CallMode/types';
import { useAccess } from '@/features/Usage/useAccess';
import { AccessQuizStep } from './AccessQuizStep';

const QuizQuestions = () => {
  const {
    currentStep,
    isFirstLoading,
    survey,
    nativeLanguage,
    updateSurvey,
    languageToLearn,
    isFollowUpGenerating,
    isGoalQuestionGenerating,
    isStepLoading,
    nextStep,
    confirmPlan,
    pageLanguage,
    isGoalGenerating,
    isLastStep,
    path,
  } = useQuiz();
  const { i18n } = useLingui();

  const settings = useSettings();
  const access = useAccess();

  const [isFullAccessRedirect, setIsFullAccessRedirect] = useState(true);

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const learningLanguageName = fullLanguageName[languageToLearn].toLocaleLowerCase();
  const nativeLanguageName =
    languageGroups.find((g) => g.languageCode === nativeLanguage)?.nativeName || '';

  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const redirectToPractice = async () => {
    setRedirecting(true);
    const url = `${getUrlStart(pageLanguage)}practice`;
    router.push(url);
    await sleep(9000);
    setRedirecting(false);
  };

  const doneQuiz = async () => {
    setRedirecting(true);

    const isAccessStep = path.includes('accessPlan');

    const queryParams =
      isAccessStep && isFullAccessRedirect && !access.isFullAppAccess ? '?paymentModal=true' : '';

    try {
      await confirmPlan();
      const goalTalkModeElement = survey?.goalData?.elements.find(
        (el) => el.mode === 'conversation',
      );
      if (goalTalkModeElement) {
        //const url = `${getUrlStart(pageLanguage)}practice?plan-id=${goalTalkModeElement.id}`;
        const url = `${getUrlStart(pageLanguage)}practice${queryParams}`;
        router.push(url);
      } else {
        const url = `${getUrlStart(pageLanguage)}practice${queryParams}`;
        console.log('url', url);
        router.push(url);
      }
    } catch (e) {
      alert(i18n._('Error creating plan. Please try again.'));
    }
    await sleep(4000);
    setRedirecting(false);
  };

  const next = () => {
    if (isLastStep) {
      doneQuiz();
    } else {
      nextStep();
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
          {currentStep === 'learnLanguage' && <LanguageToLearnSelector />}

          {currentStep === 'before_nativeLanguage' && (
            <InfoStep
              //imageUrl="/avatar/book.webp"
              title={i18n._(`What language do you speak`)}
              subTitle={i18n._(`So I can translate words for you`)}
              actionButtonTitle={i18n._(`Set My Language`)}
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === 'teacherSelection' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Pick your teacher`)}
                subTitle={i18n._(`Select a voice and look that feels right for you.`)}
                actionButtonTitle={i18n._(`Continue`)}
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: '20px',
                      gap: '20px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Stack>
                      <Typography variant="caption">{i18n._('Voice speed')}</Typography>
                      <FormControl fullWidth>
                        <Select
                          value={settings.aiVoiceSpeed}
                          onChange={(e) => settings.setAiVoiceSpeed(e.target.value as any)}
                          sx={{
                            minWidth: '200px',
                          }}
                        >
                          <MenuItem value="extremely-slow">{i18n._('Extra Slow')}</MenuItem>
                          <MenuItem value="slow">{i18n._('Slow')}</MenuItem>
                          <MenuItem value="normal">{i18n._('Normal')}</MenuItem>
                          <MenuItem value="fast">{i18n._('Fast')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>

                    <SelectTeacher
                      selectedVoice={settings.userSettings?.teacherVoice}
                      onSelectVoice={settings.setVoice}
                      voiceSpeed={settings.aiVoiceSpeed}
                    />
                  </Stack>
                }
                onClick={next}
                disabled={isStepLoading || !settings.userSettings?.teacherVoice}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
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

          {currentStep === 'quizOrSkip' && (
            <InfoStep
              title={i18n._(`Do you need a personalized plan?`)}
              subTitle={i18n._(
                `If you want more tailored practice, I can create a plan based on your goals. Otherwise, you can skip this step and start practicing right away!`,
              )}
              onClick={next}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
              secondButtonTitle={i18n._('Skip all')}
              secondButtonEndIcon={<ChevronsRight />}
              onSecondButtonClick={redirectToPractice}
            />
          )}

          {currentStep === 'before_recordAbout' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Conversation preparation`)}
                subTitle={i18n._(
                  `I'll ask you a few questions to get to know you. Then, based on your answers, I'll create a personalized practice plan for you.`,
                )}
                listItems={[
                  {
                    title: i18n._('Main goal in learning'),
                    iconName: 'graduation-cap',
                  },
                  {
                    title: i18n._('The biggest challenge in learning'),
                    iconName: 'alert-triangle',
                  },

                  {
                    title: i18n._('Hobbies or interests'),
                    iconName: 'guitar',
                  },

                  {
                    title: i18n._('Movies, books, or music'),
                    iconName: 'music',
                  },
                ]}
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'recordAbout' && (
            <AuthWall>
              <RecordUserAudio
                title={i18n._('Tell me about your goals')}
                subTitle={
                  languageToLearn === nativeLanguage ? (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b>. This will help
                      me to create a personalized practice plan.
                    </Trans>
                  ) : (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b> or{' '}
                      <b>{nativeLanguageName}</b>. This will help me to create a personalized
                      practice plan.
                    </Trans>
                  )
                }
                listItems={[
                  {
                    title: i18n._('What challenges you face'),
                    iconName: 'alert-triangle',
                  },
                  {
                    title: i18n._('Hobbies or interests'),
                    iconName: 'music',
                  },
                  {
                    title: i18n._('What you want to achieve'),
                    iconName: 'flag',
                  },
                ]}
                transcript={survey?.aboutUserTranscription || ''}
                minWords={MIN_WORDS_FOR_ANSWER}
                nextStep={next}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserTranscription: combinedTranscript,
                    },
                    'recordAbout UI',
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === 'before_recordAboutFollowUp' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Let's continue...`)}
                subTitle={i18n._(`I'll ask you two more questions before I make your plan.`)}
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'recordAboutFollowUp' && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.aboutUserFollowUpQuestion || null}
                transcript={survey?.aboutUserFollowUpTranscription || ''}
                loading={isFollowUpGenerating}
                nextStep={next}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserFollowUpTranscription: combinedTranscript,
                    },
                    'recordAboutFollowUp UI',
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === 'before_recordAboutFollowUp2' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Next question`)}
                subTitle={i18n._(`The last question before we create your plan`)}
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'recordAboutFollowUp2' && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.goalFollowUpQuestion || null}
                transcript={survey?.goalUserTranscription || ''}
                loading={isGoalQuestionGenerating}
                nextStep={next}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      goalUserTranscription: combinedTranscript,
                    },
                    'recordAboutFollowUp2 UI',
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === 'before_goalReview' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`We are ready to craft your plan.`)}
                subTitle={i18n._(`It might take up to a minute.`)}
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'accessPlan' && (
            <AuthWall>
              <AccessQuizStep
                isFullAccessRedirect={isFullAccessRedirect}
                setIsFullAccessRedirect={setIsFullAccessRedirect}
                teacherVoice={settings.userSettings?.teacherVoice || 'shimmer'}
                next={next}
              />
            </AuthWall>
          )}

          {currentStep === 'goalReview' && (
            <AuthWall>
              <GoalReview
                onClick={next}
                isLoading={isGoalGenerating || survey?.goalData === null}
                goalData={survey?.goalData}
                actionButtonLabel={i18n._('Next')}
              />
            </AuthWall>
          )}

          {currentStep === 'callMode' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Call mode`)}
                subTitle={i18n._(`Don't forget to try call mode in the practice section!`)}
                imageUrl="/quiz/callMode.jpg"
                onClick={next}
                actionButtonTitle={i18n._('Go to Practice')}
                actionButtonEndIcon={<Check />}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'writeWelcomeMessageInChat' && (
            <>
              <AuthWall>
                <WelcomeChatMessage
                  title={i18n._(`Send a message to the community`)}
                  subTitle={i18n._(`Record a welcome message to our community of learners.`)}
                  done={next}
                  isLoading={isStepLoading}
                  exampleToRecord={survey?.exampleOfWelcomeMessage || ''}
                  actionButtonTitle={i18n._('Go to Practice with AI')}
                />
              </AuthWall>
            </>
          )}

          {currentStep === 'paidVsFree' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`Free vs Paid Plan`)}
                subTitle={i18n._(`The key differences between them.`)}
                subComponent={
                  <>
                    <Stack
                      sx={{
                        padding: '20px 0',
                        gap: '30px',
                      }}
                    >
                      <Stack>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 'bold', marginBottom: '10px' }}
                        >
                          {i18n._('Free plan:')}
                        </Typography>
                        <ColorIconTextList
                          gap="10px"
                          iconSize="22px"
                          listItems={[
                            {
                              title: i18n._('Speaking and writing practice'),
                              iconName: 'mic',
                            },

                            {
                              title: i18n._('AI voice is disabled'),
                              iconName: 'volume-x',
                            },

                            {
                              title: i18n._('AI responses are text-only'),
                              iconName: 'message-square',
                            },
                          ]}
                        />
                      </Stack>

                      <Stack>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 'bold', marginBottom: '10px' }}
                        >
                          {i18n._('Paid plan:')}
                        </Typography>
                        <ColorIconTextList
                          gap="10px"
                          iconSize="22px"
                          listItems={[
                            {
                              title: i18n._('Listening practice. You can hear AI responses'),
                              iconName: 'volume-2',
                            },

                            {
                              title: i18n._('Real-time conversations with AI using voice'),
                              iconName: 'audio-lines',
                            },
                          ]}
                        />
                      </Stack>

                      <Typography>
                        {i18n._(
                          'Free plan is for speaking and writing practice. Paid plan unlocks listening and real-time conversations with AI',
                        )}
                      </Typography>
                    </Stack>
                  </>
                }
                onClick={doneQuiz}
                actionButtonTitle={i18n._('Go to Practice')}
                actionButtonEndIcon={<Check />}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
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
      <WebViewWall>
        <QuizQuestions />
      </WebViewWall>
    </QuizProvider>
  );
};
