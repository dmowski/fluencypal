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
import { LanguageToLearnSelector, LanguageToLearnShortSelector } from './LanguageToLearnSelector';
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
import { VoiceSpeedSelector } from '@/features/Settings/VoiceSpeedSelector';
import { SelectTeacher } from '@/features/Conversation/CallMode/SelectTeacher';
import { AiAvatarVideo } from '@/features/Conversation/CallMode/AiAvatarVideo';
import { getAiVoiceByVoice } from '@/features/Conversation/CallMode/voiceAvatar';
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
            <AuthWall>
              <InfoStep
                title={i18n._(`Choose your interlocutor`)}
                subTitle={i18n._(`A voice and style that suits you.`)}
                actionButtonTitle={i18n._(`Continue`)}
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: '20px',
                      gap: '20px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <VoiceSpeedSelector />

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
                title={i18n._(`Practice plan`)}
                subTitle={i18n._(
                  `I'll ask you a few questions to get to know you. Based on your answers, I'll create a personalized practice plan for you.`,
                )}
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === 'recordAbout' && (
            <AuthWall>
              <RecordUserAudio
                title={i18n._('Tell me about yourself')}
                subTitle={`${i18n._(`Let's talk a little about you. This will help me to create a practice plan. Why do you want to practice speaking?`)}`}
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

          {currentStep === 'magicFlow' && (
            <AuthWall>
              <InfoStep
                title={i18n._(`FluencyPal gets stronger as you use it`)}
                subTitle={i18n._(
                  `Different modes help in different ways. You will discover what works best for you over time.`,
                )}
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: '20px',
                      gap: '10px',
                    }}
                    component={'span'}
                  >
                    {[
                      {
                        title: i18n._('Just Talk'),
                        text: i18n._(
                          'Build speaking confidence, fluency, and listening through natural conversation.',
                        ),
                      },
                      {
                        title: i18n._('Grammar Rules'),
                        text: i18n._(
                          'Fix repeated mistakes with clear explanations, quizzes, and focused practice.',
                        ),
                      },
                      {
                        title: i18n._('Words Practice'),
                        text: i18n._(
                          'Learn vocabulary that matches your goals and use it in context.',
                        ),
                      },
                      {
                        title: i18n._('Role Play'),
                        text: i18n._(
                          'Prepare for interviews, daily situations, and real-life conversations.',
                        ),
                      },
                    ].map((item) => (
                      <Stack
                        key={item.title}
                        component={'span'}
                        sx={{
                          padding: '14px 16px',
                          borderRadius: '16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          gap: '4px',
                        }}
                      >
                        <Typography
                          component={'span'}
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          component={'span'}
                          sx={{
                            opacity: 0.9,
                          }}
                        >
                          {item.text}
                        </Typography>
                      </Stack>
                    ))}

                    <Typography
                      component={'span'}
                      sx={{
                        paddingTop: '6px',
                        opacity: 0.9,
                      }}
                    >
                      {i18n._(`Start simple, stay consistent, and let the system adapt as you go.`)}
                    </Typography>
                  </Stack>
                }
                onClick={next}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
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
                  title={i18n._(`Community`)}
                  subTitle={i18n._(
                    `Record a welcome message to our community of learners. It can be a great way to practice your speaking skills and introduce yourself to others!`,
                  )}
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
