import { Button, Stack, Typography } from '@mui/material';
import { Footer } from './Footer';
import { GeneralFaqBlock } from './FAQ/GeneralFaqBlock';
import { CtaBlock } from './ctaBlock';
import { ProposalCards } from './ProposalCards';
import { RolePlayDemo } from './RolePlay/RolePlayDemo';
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguages,
} from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart, getUrlStart } from '../Lang/getUrlStart';
import Script from 'next/script';
import { HeaderStatic } from '../Header/HeaderStatic';
import { WebCamButtons, WebcamSection } from '../Case/Landing/components/WebcamSection';
import { HowItWorks } from './HowItWorks';
import { DynamicIcon } from 'lucide-react/dynamic';
import { WelcomeScreen2 } from './WelcomeScreen2';
import { ReviewsSection } from './Reviews/ReviewsSection';
import { landingReviews } from './Reviews/reviewsData';

interface FAQItem {
  question: string;
  answer: string;
}

interface LandingPageProps {
  lang: SupportedLanguage;
}
export default function LandingPage({ lang }: LandingPageProps) {
  const i18n = getI18nInstance(lang);

  const faqItems: FAQItem[] = [
    {
      question: i18n._(`What is FluencyPal?`),
      answer: i18n._(
        `FluencyPal is an AI-powered conversation practice app designed for intermediate and advanced learners. It helps you improve speaking fluency, pronunciation, and confidence through realistic conversations and instant feedback.`,
      ),
    },

    {
      question: i18n._(`How does FluencyPal understand my learning goals?`),
      answer: i18n._(
        `When you start, FluencyPal asks a short series of questions about your goals, current language level, and areas you want to improve. You answer using your voice. Based on your responses, FluencyPal creates a personalized practice plan for you. For example, business English focuses on professional vocabulary and scenarios, travel English focuses on real-life situations, and interview preparation simulates interview questions with feedback.`,
      ),
    },

    {
      question: i18n._(`What’s the price?`),
      answer: i18n._(
        `FluencyPal offers weekly, monthly, or yearly access, giving you full access to all features. No auto-renew. You pay each month by hand, or you don't. We never charge you while you're not using it.`,
      ),
    },

    {
      question: i18n._(`What level of speaking should I have?`),
      answer: i18n._(
        `FluencyPal is best suited for learners who can hold basic conversations and want to improve fluency, accuracy, and confidence. It works well for pre-intermediate, intermediate, and advanced speakers and adapts to your level over time.`,
      ),
    },

    {
      question: i18n._(`Is there a free trial?`),
      answer: i18n._(
        `No. FluencyPal offers a free plan with limited features and a monthly plan for full access. You can use the free plan indefinitely to practice speaking and explore basic features before deciding to upgrade.`,
      ),
    },

    {
      question: i18n._(`Can I use FluencyPal for free?`),
      answer: i18n._(
        `Yes. FluencyPal offers free full access for users who rank in the top 5 of our speaking game. The game is free to play and includes reading text aloud, describing images, discussing topics, and answering questions. You can improve your speaking skills while playing.`,
      ),
    },

    {
      question: i18n._(`Can FluencyPal create a personal practice plan for me?`),
      answer: i18n._(
        `Yes. FluencyPal generates a personalized practice plan based on your goals and proficiency level. Your daily sessions focus on relevant vocabulary, grammar, and real-life conversations. You can interact with the AI using voice or text.`,
      ),
    },

    {
      question: i18n._(`What is the main focus of FluencyPal?`),
      answer: i18n._(
        `FluencyPal is focused on speaking practice. You can use voice mode and optionally enable webcam feedback with an AI avatar to make conversations feel more realistic and engaging, while receiving feedback on your speaking performance.`,
      ),
    },

    {
      question: i18n._(`Can I practice languages other than English?`),
      answer:
        i18n._(
          `Yes. FluencyPal supports multiple languages and adapts conversations to your selected language and proficiency level. Available languages include:`,
        ) + ` ${supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(', ')}`,
    },

    {
      question: i18n._(`What learning modes are available?`),
      answer: i18n._(
        `FluencyPal offers several learning modes: Casual Conversation for uninterrupted speaking practice, Talk & Correct for instant grammar and pronunciation feedback, Role-Play Scenarios for real-life situations, as well as grammar practice, vocabulary building, and progress tracking.`,
      ),
    },

    {
      question: i18n._(`How do daily tasks help me improve?`),
      answer: i18n._(
        `Daily speaking tasks introduce new vocabulary and sentence structures, help you build a learning habit, and reinforce your skills to improve fluency faster.`,
      ),
    },

    {
      question: i18n._(`Where can I use FluencyPal?`),
      answer: i18n._(
        `FluencyPal is a browser-based app, so you only need an internet browser to use it. You can run FluencyPal on a mobile phone, tablet, or desktop without installing anything.`,
      ),
    },

    {
      question: i18n._(`How is my data handled and is my privacy protected?`),
      answer: i18n._(
        `FluencyPal stores conversation transcripts in its database to improve your learning experience. You can permanently delete your personal data at any time from the app settings. Voice processing is handled using OpenAI services, and FluencyPal does not store your voice recordings. Webcam data is not stored either — it is processed in real time by the AI and then immediately discarded.`,
      ),
    },

    {
      question: i18n._(`Is FluencyPal a replacement for a human teacher?`),
      answer: i18n._(
        `FluencyPal is designed to help you practice speaking and build confidence, not to replace a human teacher. It works best as a daily speaking companion that helps you practice more often, get instant feedback, and prepare for real conversations.`,
      ),
    },

    {
      question: i18n._(`How can I track my progress?`),
      answer: i18n._(
        `FluencyPal tracks your activity and completed tasks over time. As you practice regularly, conversations become more complex, and feedback adapts to your level, helping you notice improvements in fluency, confidence, and accuracy. FluencyPal also assesses your grammar, confidence, vocabulary, and fluency, then creates a progress chart so you can see how your skills grow over time.`,
      ),
    },

    {
      question: i18n._(`What do I need to use FluencyPal?`),
      answer: i18n._(
        `To use FluencyPal, you need a modern internet browser and a microphone. A webcam is optional and only used if you enable webcam feedback. No installation is required.`,
      ),
    },

    {
      question: i18n._(`Is my data used to train AI models?`),
      answer: i18n._(
        `FluencyPal does not use your personal data or conversations to train AI models.`,
      ),
    },

    {
      question: i18n._(`How does FluencyPal improve my speaking skills?`),
      answer: i18n._(
        `During conversations, FluencyPal keeps track of the mistakes you make. Based on these patterns, it generates personalized language rules designed specifically for your weak areas. You can then practice each rule separately: read a short explanation, see clear examples, and speak with the AI while focusing only on that aspect of the language. This allows you to systematically improve the exact grammar or expression patterns that cause you the most difficulty, turning your mistakes into targeted speaking practice.`,
      ),
    },
  ];
  const pageUrl = 'https://www.fluencypal.com' + getUrlStart(lang);

  const seoFaqItems = faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question, // must be plain string
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer, // must be plain string
    },
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: i18n._(`FluencyPal – Your AI English Speaking Partner`),
    url: pageUrl,
    inLanguage: lang,
    mainEntity: seoFaqItems,
    publisher: {
      '@type': 'Organization',
      name: 'FluencyPal',
      url: 'https://www.fluencypal.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.fluencypal.com/logo.png',
      },
    },
  };
  const quizLink = getAppUrlStart(lang) + 'quiz';

  const practiceRedirectUrl = `${getAppUrlStart(lang)}practice`;
  const mainRedirectUrl = practiceRedirectUrl;

  return (
    <>
      <HeaderStatic lang={lang} transparentOnTop />
      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main style={{ width: '100%', margin: 0 }}>
        <Stack sx={{ alignItems: 'center' }}>
          {/*<WelcomeScreenMinimal />*/}
          <WelcomeScreen2
            label={i18n._(`Conversation with AI`)}
            title={i18n._(`Speak English without fear`)}
            subTitle1={i18n._(`Don’t let mistakes stop you.`)}
            subTitle2={i18n._(`Practice the exact conversation you're afraid of.`)}
            buttonTitle={i18n._(`Start Speaking`)}
            openMyPracticeLinkTitle={i18n._(`Start Speaking`)}
            buttonHref={mainRedirectUrl}
            cards={[
              {
                videoUrl: '/landing/preview/grammar2.webm',
                imageUrl: '/landing/preview/grammar2.webp',
                alt: i18n._('Grammar Correction Preview'),
              },
              {
                videoUrl: '/landing/preview/camera2.webm',
                imageUrl: '/landing/preview/camera2.webp',
                alt: i18n._('Webcam Feedback Preview'),
              },
              {
                imageUrl: '/landing/preview/roleplay.webp',
                alt: i18n._('Roleplay Preview'),
              },
            ]}
          />

          <ReviewsSection
            title={i18n._(`What learners are saying`)}
            subTitle={i18n._(
              `Real reviews from people using FluencyPal to practice speaking and prepare for language exams.`,
            )}
            reviews={landingReviews}
            startPracticeButtonTitle={i18n._(`Start Practice`)}
            startPracticeButtonHref={mainRedirectUrl}
            checkReviewsButtonTitle={i18n._(`Check other reviews`)}
            checkReviewsButtonHref="https://www.trustpilot.com/review/www.fluencypal.com"
          />

          <Stack
            sx={{
              width: '100%',
            }}
          >
            <WebcamSection
              theme={'gray'}
              id="webcam-section"
              buttonHref={mainRedirectUrl}
              data={{
                type: 'webcamDemo',
                title: i18n._('Practice Speaking with AI'),
                subTitle: i18n._('Confidence in a safe and calm environment.'),
                content: i18n._(
                  'Practice real conversations and explain your thoughts out loud in a safe, pressure-free environment — without fear of mistakes.',
                ),
                infoList: [
                  {
                    title: i18n._('Speak naturally, without overthinking'),
                    iconName: 'mic',
                    iconColor: '#c2c2c2',
                  },
                  {
                    title: i18n._('Get clear, actionable AI feedback'),
                    iconName: 'message-circle',
                    iconColor: '#c2c2c2',
                  },
                  {
                    title: i18n._('Build confidence through real practice'),
                    iconName: 'chart-bar',
                    iconColor: '#c2c2c2',
                  },
                ],
                webCamPreview: {
                  videoUrl: '/call/marin/talk.webm',
                  title: '',
                  participants: 'Marin - AI Teacher',

                  beforeSectionTitle: i18n._('Warm-up'),
                  beforeSectionSubTitle: i18n._('Done'),

                  afterSectionTitle: i18n._('Free Conversation'),
                  afterSectionSubTitle: i18n._('Next'),
                },
                buttonTitle: i18n._('Start speaking practice'),
              }}
            />

            <HowItWorks
              label={i18n._(`Practice & Progress`)}
              title={i18n._(`How It Works`)}
              allFeaturesTitle={i18n._(`Explore All Features`)}
              allFeaturesHref={`${getUrlStart(lang)}features`}
              subTitle={i18n._(
                'Improving your English speaking skills takes time and consistent practice. FluencyPal is designed for learners who can already communicate at least a little and want to become more fluent, confident, and accurate through regular speaking practice.',
              )}
              cards={[
                {
                  imageUrl: '/quiz/step1.webp',
                  bgColor: '#e9e9e9ff',
                  imageWidth: 560,
                  imageHeight: 440,

                  title: i18n._('Smart Start'),
                  titleColor: '#fff',
                  titleBgColor: '#111',
                  subTitle: i18n._(
                    `Fill out an onboarding quiz to help FluencyPal understand your goals and preferences.`,
                  ),
                  subTitleColor: '#515154ff',
                  footerButton: (
                    <>
                      <Stack
                        sx={{
                          position: 'absolute',
                          bottom: '110px',
                          width: '100%',
                          alignItems: 'center',
                          '@media (max-width: 600px)': {
                            bottom: 0,
                            height: 'auto',
                            aspectRatio: '160 / 46',
                          },
                        }}
                      >
                        <Button
                          href={quizLink}
                          variant="contained"
                          size="large"
                          color="info"
                          sx={{
                            padding: '10px 30px',
                            backgroundColor: '#ffffff',
                            color: '#111',
                            fontWeight: 600,
                            borderRadius: '2px',
                            fontSize: '16px',
                            boxShadow: 'none',
                            minWidth: '240px',
                            '@media (max-width: 600px)': {
                              boxShadow: '4px 4px 30px rgba(0, 0, 0, 0.3)',
                              borderRadius: '1px',
                            },
                          }}
                          endIcon={<DynamicIcon name={'arrow-right'} />}
                        >
                          {i18n._(`Get My Plan`)}
                        </Button>
                      </Stack>
                    </>
                  ),
                },

                {
                  quizAnimation: 'step2',
                  bgColor: '#02b1ff',
                  imageWidth: 1020,
                  imageHeight: 800,

                  title: i18n._('Personal Plan'),
                  titleColor: '#111',
                  titleBgColor: '#fff',

                  subTitle: i18n._(
                    'Based on your onboarding, FluencyPal will create a personalized learning plan just for you.',
                  ),
                  subTitleColor: '#111',
                },

                {
                  videoUrl: '/call/ash/talk1.webm',
                  imageWidth: 1020,
                  imageHeight: 800,
                  bgColor: 'rgb(112, 59, 227)',

                  title: i18n._('Practice'),
                  titleColor: '#111',
                  titleBgColor: '#fff',

                  subTitle: i18n._(
                    'Jump into your tailored learning path and build real skills through engaging practice with AI voice chat.',
                  ),
                  subTitleColor: '#fff',
                  footerButton: <WebCamButtons />,
                },
              ]}
              buttonTitle={i18n._(`Start Practicing`)}
              buttonHref={mainRedirectUrl}
              theme={'dark-red'}
              id={'how-it-works'}
            />
          </Stack>

          <ProposalCards
            title={i18n._(`Four Ways FluencyPal Boosts Your Speaking Skills`)}
            subTitle={i18n._(
              `Target the specific skills you need—speaking, grammar, vocabulary, and progress tracking—to achieve online English fluency faster.`,
            )}
            infoCards={[
              {
                category: i18n._(`Speaking`),
                title: i18n._(`Achieve Speaking Fluency Fast`),
                description: i18n._(
                  `Practice realistic conversations tailored to your skill level. FluencyPal responds naturally, highlights areas for improvement, and builds your confidence.`,
                ),
                img: '/landing/talk.webp',
                imgAlt: i18n._('Illustration of voice recording'),
                href: mainRedirectUrl,
                actionButtonTitle: i18n._(`Start Speaking Practice`),
              },
              {
                category: i18n._(`Grammar`),
                title: i18n._(`Instant Grammar Corrections`),
                description: i18n._(
                  `Get immediate feedback and explanations on your grammar mistakes as you practice. Enhance your speaking accuracy naturally.`,
                ),
                img: '/landing/rules.webp',
                imgAlt: i18n._('Illustration of grammar improvement'),
                href: mainRedirectUrl,
                actionButtonTitle: i18n._(`Enhance Your Grammar`),
              },
              {
                category: i18n._(`Vocabulary`),
                title: i18n._(`Grow Your Vocabulary Daily`),
                description: i18n._(
                  `Receive personalized vocabulary tailored to your conversational needs. Use new words immediately to reinforce learning.`,
                ),
                img: '/landing/words.webp',
                imgAlt: i18n._('Illustration of new words being learned'),
                href: mainRedirectUrl,
                actionButtonTitle: i18n._(`Expand Your Vocabulary`),
              },
              {
                category: i18n._(`Progress tracking`),
                title: i18n._(`Track Your Fluency Progress`),
                description: i18n._(
                  `Visualize your daily progress with intuitive tracking. Stay motivated by clearly seeing your improvements.`,
                ),
                img: '/landing/progressChart.png',
                imgAlt: i18n._(
                  'Illustration of progress tracking chart showing improvement over time',
                ),
                href: mainRedirectUrl,
                actionButtonTitle: i18n._(`Check Your Progress`),
              },
            ]}
          />
          <RolePlayDemo
            title={i18n._(`Real-Life Role-Play for Advanced English Practice`)}
            subTitle={i18n._(
              `Practice speaking fluently in real-world scenarios like job interviews, business meetings, and everyday conversations.`,
            )}
            actionButtonTitle={i18n._(`Explore Role-Play Scenarios`)}
            footerLabel={i18n._(`Looking for something specific?`)}
            footerLinkTitle={i18n._(`Create Your Own Scenario`)}
            importantRolesTitleAfterFooter={i18n._(`Master English Fluency`)}
            lang={lang}
          />
          <GeneralFaqBlock
            title={i18n._(`FAQ`)}
            items={[
              ...faqItems.map((item) => {
                return {
                  question: item.question,
                  answer: <Typography>{item.answer}</Typography>,
                };
              }),
            ]}
          />
          <CtaBlock
            title={i18n._(`Learn anywhere, anytime`)}
            actionButtonTitle={i18n._(`Start Learning Now`)}
            actionButtonLink={mainRedirectUrl}
          />
        </Stack>
      </main>
      <Footer lang={lang} />
    </>
  );
}
