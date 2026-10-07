import { Button, Stack, Typography } from '@mui/material';
import { Footer } from '@/features/Landing/Footer';
import { GeneralFaqBlock } from '@/features/Landing/FAQ/GeneralFaqBlock';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { ProposalCards } from '@/features/Landing/ProposalCards';
import { RolePlayDemo } from '@/features/Landing/RolePlay/RolePlayDemo';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { WebcamSection } from '@/features/Case/Landing/components/WebcamSection';
import {
  MARIN_IDLE_VIDEO_SRC,
  MARIN_TALKING_VIDEO_SRC,
} from '@/features/Case/Landing/components/WebCamButtons';
import { HowItWorks } from '@/features/Landing/HowItWorks';
import { DynamicIcon } from 'lucide-react/dynamic';
import { WelcomeScreen2 } from '@/features/Landing/WelcomeScreen2';
import { ReviewsSection } from '@/features/Landing/Reviews/ReviewsSection';
import { landingReviews } from '@/features/Landing/Reviews/reviewsData';
import { paidAccessPriceUsd } from '@/features/Price/paidAccessPlans';
import { PRICE_PER_MONTH_USD } from '@/features/Price/price';
import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import Script from 'next/script';
import { getLearnLandingCopy } from './copy';
import { LearnPageLocale, LearnTarget } from './targets';

interface LearnLanguagePageProps {
  ui: LearnPageLocale;
  target: LearnTarget;
}

export function LearnLanguagePage({ ui, target }: LearnLanguagePageProps) {
  const i18n = getI18nInstance(ui);
  const copy = getLearnLandingCopy(ui, target);
  const startUrl = `${getAppUrlStart(ui)}quiz?learn=${target}`;
  const pageUrl = `https://www.fluencypal.com${ui === 'en' ? '' : `/${ui}`}/learn/${target}`;

  const faqItems = [
    {
      question: i18n._(`What’s the price?`),
      answer: i18n._(
        `Paid access is one payment for a week, a month, or a year. There is no auto-renew. Practice is {practicePrice} a month: unlimited Just Talk, a personal plan, exams, role-play, and daily lessons. Group conversations are free. Conversation is {conversationPrice} a month and adds 1 hour of advanced conversation. Conversation 10 is {conversation10Price} a month and adds 10 hours of advanced conversation. A week costs half of the month. A year costs ten months.`,
        {
          practicePrice: `$${PRICE_PER_MONTH_USD}`,
          conversationPrice: `$${paidAccessPriceUsd('conversation', 'month')}`,
          conversation10Price: `$${paidAccessPriceUsd('conversation-10', 'month')}`,
        },
      ),
    },
    {
      question: i18n._(`What level of speaking should I have?`),
      answer: i18n._(
        `FluencyPal is best suited for learners who can hold basic conversations and want to improve fluency, accuracy, and confidence. It works well for pre-intermediate, intermediate, and advanced speakers and adapts to your level over time.`,
      ),
    },
    {
      question: i18n._(`Can I use FluencyPal for free?`),
      answer: i18n._(
        `Yes, with limits. You can start speaking on the free plan. Unlimited practice requires paid access.`,
      ),
    },
    {
      question: i18n._(`Where can I use FluencyPal?`),
      answer: i18n._(
        `FluencyPal is a browser-based app, so you only need an internet browser to use it. You can run FluencyPal on a mobile phone, tablet, or desktop without installing anything.`,
      ),
    },
    {
      question: i18n._(`Is FluencyPal a replacement for a human teacher?`),
      answer: i18n._(
        `FluencyPal is designed to help you practice speaking and build confidence, not to replace a human teacher. It works best as a daily speaking companion that helps you practice more often, get instant feedback, and prepare for real conversations.`,
      ),
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.shareTitle,
    description: copy.description,
    url: pageUrl,
    inLanguage: ui,
    about: {
      '@type': 'Language',
      name: copy.englishName,
      alternateName: copy.name,
    },
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <HeaderStatic lang={ui} transparentOnTop />
      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main style={{ width: '100%', margin: 0 }}>
        <Stack sx={{ alignItems: 'center' }}>
          <WelcomeScreen2
            label={copy.label}
            title={copy.headline}
            title2={copy.heroTitle2}
            subTitle1={copy.heroSubtitle}
            buttonTitle={i18n._(`Start Speaking`)}
            openMyPracticeLinkTitle={i18n._(`Start Speaking`)}
            buttonHref={startUrl}
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

          <Stack sx={{ width: '100%' }}>
            <WebcamSection
              theme={'gray'}
              id="webcam-section"
              buttonHref={startUrl}
              data={{
                type: 'webcamDemo',
                title: copy.webcamTitle,
                subTitle: copy.webcamSubtitle,
                content: copy.webcamContent,
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
                  videoUrl: MARIN_IDLE_VIDEO_SRC,
                  talkingVideoUrl: MARIN_TALKING_VIDEO_SRC,
                  title: '',
                  participants: 'Marin - AI Teacher',
                  beforeSectionTitle: i18n._('Warm-up'),
                  beforeSectionSubTitle: i18n._('Done'),
                  afterSectionTitle: i18n._('Free Conversation'),
                  afterSectionSubTitle: i18n._('Next'),
                },
                buttonTitle: i18n._('Start Speaking'),
              }}
            />

            <HowItWorks
              label={i18n._(`Practice & Progress`)}
              title={i18n._(`How It Works`)}
              allFeaturesTitle={i18n._(`Explore All Features`)}
              allFeaturesHref={`${getUrlStart(ui)}features`}
              subTitle={copy.howSubtitle}
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
                        href={startUrl}
                        variant="contained"
                        size="large"
                        color="info"
                        data-analytics="learn-language-quiz"
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
                    'Based on your onboarding, FluencyPal will create a personalized speaking plan just for you.',
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
                    'Jump into speaking practice and build fluency through real conversations with AI.',
                  ),
                  subTitleColor: '#fff',
                },
              ]}
              buttonTitle={i18n._(`Start Speaking`)}
              buttonHref={startUrl}
              theme={'dark-red'}
              id={'how-it-works'}
            />
          </Stack>

          <ProposalCards
            title={i18n._(`Six Ways FluencyPal Boosts Your Speaking Skills`)}
            subTitle={i18n._(
              `Stop studying in silence. Practice speaking, fix grammar in conversation, grow vocabulary you can actually use, take a daily lesson, join a live call, and see your fluency improve.`,
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
                href: startUrl,
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
                href: startUrl,
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
                href: startUrl,
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
                href: startUrl,
                actionButtonTitle: i18n._(`Check Your Progress`),
              },
              {
                category: i18n._(`Live calls`),
                title: i18n._(`Talk with other learners`),
                description: i18n._(
                  `Join a live call on Google Meet. See the next times for where you live, and talk with AI until it starts.`,
                ),
                img: '/landing/community-calls.jpg',
                imgAlt: i18n._('A list of upcoming group conversation calls'),
                href: `${getUrlStart(ui)}features/group-conversations`,
                analyticsId: 'community-call-feature',
                actionButtonTitle: i18n._(`See upcoming calls`),
              },
              {
                category: i18n._(`Daily lesson`),
                title: i18n._(`Practice one pattern a day`),
                description: i18n._(
                  `Read how it works, say it out loud, and hear feedback. Then talk for a couple of minutes. The next lesson follows what you said.`,
                ),
                img: '/landing/daily-lesson.jpg',
                imgAlt: i18n._('A daily speaking lesson with a sentence to read aloud'),
                href: `${getUrlStart(ui)}features/interactive-lesson`,
                actionButtonTitle: i18n._(`Start a daily lesson`),
              },
            ]}
          />

          <RolePlayDemo
            title={copy.rolePlayTitle}
            subTitle={copy.rolePlaySubtitle}
            actionButtonTitle={i18n._(`Explore Role-Play Scenarios`)}
            footerLabel={i18n._(`Looking for something specific?`)}
            footerLinkTitle={i18n._(`Create Your Own Scenario`)}
            importantRolesTitleAfterFooter={copy.ctaTitle}
            lang={ui}
          />

          <ReviewsSection
            title={i18n._(`What learners are saying`)}
            subTitle={i18n._(
              `Real reviews from people using FluencyPal to practice speaking and build confidence in real conversations.`,
            )}
            reviews={landingReviews}
            startPracticeButtonTitle={i18n._(`Start Speaking`)}
            startPracticeButtonHref={startUrl}
            checkReviewsButtonTitle={i18n._(`Check other reviews`)}
            checkReviewsButtonHref="https://www.trustpilot.com/review/www.fluencypal.com"
          />

          <GeneralFaqBlock
            title={i18n._(`FAQ`)}
            items={faqItems.map((item) => ({
              question: item.question,
              answer: <Typography>{item.answer}</Typography>,
            }))}
          />
          <CtaBlock
            title={copy.ctaTitle}
            actionButtonTitle={i18n._(`Start Speaking`)}
            actionButtonLink={startUrl}
          />
        </Stack>
      </main>
      <Footer lang={ui} />
    </>
  );
}
