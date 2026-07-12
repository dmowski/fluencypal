'use client';

import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import {
  buttonStyle,
  maxContentWidth,
  subTitleFontStyle,
  titleFontStyle,
} from '@/features/Landing/landingSettings';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from '@/features/Lang/lang';
import { GeneralFaqBlock } from '@/features/Landing/FAQ/GeneralFaqBlock';
import { FaqItemInfo } from '@/features/Landing/FAQ/FaqItem';
import { Languages, MessageCircle, Mic, Sparkles, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AliasCtaButton } from './AliasCtaButton';
import { AliasHeroDemo } from './AliasHeroDemo';
import { AliasResultPreview } from './AliasResultPreview';
import { AliasStickyCta } from './AliasStickyCta';
import { trackAliasEvent } from './aliasAnalytics';

const HERO_CTA_ID = 'alias-hero-cta';
const PRACTICE_PATH = 'practice?rolePlayId=alias-game';

interface AliasLandingPageProps {
  lang: SupportedLanguage;
}

const stepIcons = [Languages, Mic, Sparkles] as const;

export const AliasLandingPage = ({ lang }: AliasLandingPageProps) => {
  const { i18n } = useLingui();
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const practiceUrl = getAppUrlStart(lang) + PRACTICE_PATH;
  const friendsUrl = `${getUrlStart(lang)}alias`;
  const privacyUrl = `${getUrlStart(lang)}privacy`;
  const pricingUrl = `${getUrlStart(lang)}pricing`;

  const learnableLanguages = supportedLanguagesToLearn
    .map((code) => fullEnglishLanguageName[code])
    .join(', ');

  useEffect(() => {
    trackAliasEvent('alias_landing_view');
  }, []);

  const faqItems: FaqItemInfo[] = [
    {
      question: i18n._('Do I need a microphone?'),
      answer: (
        <Typography>
          {i18n._(
            'Yes. The Alias game uses your microphone so you can describe words aloud. Your browser asks for permission when you start your first round — not when you open this page.',
          )}
        </Typography>
      ),
    },
    {
      question: i18n._('Do I need an account?'),
      answer: (
        <Typography>
          {i18n._(
            'Yes. Sign in to FluencyPal to play the Alias game and save your progress. After you sign in, you return to the same Alias practice session.',
          )}
        </Typography>
      ),
    },
    {
      question: i18n._('Is the game free?'),
      answer: (
        <Typography>
          {i18n._('FluencyPal offers a ')}
          <Link href={pricingUrl} underline="hover" color="inherit">
            {i18n._('1-day free trial')}
          </Link>
          {i18n._(
            ' without a credit card so you can explore features before deciding whether to upgrade.',
          )}
        </Typography>
      ),
    },
    {
      question: i18n._('What happens to my recording?'),
      answer: (
        <Typography>
          {i18n._(
            'Voice audio is processed to generate transcripts and feedback. FluencyPal does not store your voice recordings. Conversation transcripts may be saved in your account to track progress. See our ',
          )}
          <Link href={privacyUrl} underline="hover" color="inherit" target="_blank">
            {i18n._('Privacy Policy')}
          </Link>
          {i18n._(' for details.')}
        </Typography>
      ),
    },
    {
      question: i18n._('Which languages can I practise?'),
      answer: (
        <Typography>
          {i18n._(
            'You practise speaking in the language you are learning in FluencyPal. Supported learning languages include ',
          )}
          {learnableLanguages}
          {i18n._(
            '. The Alias game adapts word difficulty to the level you choose at the start of each round.',
          )}
        </Typography>
      ),
    },
  ];

  const steps = [
    {
      title: i18n._('Choose your level'),
      text: i18n._('Get words appropriate for your current vocabulary.'),
    },
    {
      title: i18n._('Describe the word'),
      text: i18n._('Explain it aloud without using the word itself.'),
    },
    {
      title: i18n._('See the AI\u2019s guess'),
      text: i18n._('Find out whether your explanation worked and review your feedback.'),
    },
  ];

  const benefits = [
    i18n._('Recall vocabulary without translating every sentence.'),
    i18n._('Explain ideas when you do not know the exact word.'),
    i18n._('Speak spontaneously instead of reading prepared answers.'),
    i18n._('Become more comfortable thinking in your target language.'),
  ];

  const primaryCtaLabel = i18n._('Play a Round with AI');
  const stickyCtaLabel = i18n._('Play with AI');

  return (
    <Stack
      component="article"
      sx={{
        width: '100%',
        color: '#222',
        paddingBottom: { xs: '88px', md: 0 },
      }}
    >
      {/* 1. Hero */}
      <Stack
        component="section"
        sx={{
          width: '100%',
          alignItems: 'center',
          marginTop: '-28px',
          padding: { xs: '52px 16px 98px', md: '68px 24px 92px' },
          backgroundImage:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(231, 222, 203, 0.3) 100%)',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            maxWidth: maxContentWidth,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: '36px', md: '48px' },
            alignItems: 'center',
          }}
        >
          <Stack sx={{ gap: '20px', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Typography
              component="p"
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgb(43 35 88)',
                opacity: 0.85,
              }}
            >
              {i18n._('AI speaking game')}
            </Typography>

            <Typography
              component="h1"
              sx={{
                ...titleFontStyle,
                fontSize: { xs: '2rem', md: '2.6rem' },
                color: '#000',
                lineHeight: 1.15,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {i18n._('Can the AI Guess Your Word?')}
            </Typography>

            <Typography
              component="p"
              sx={{
                fontSize: '0.9rem',
                color: '#666',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {i18n._('Alias Word Guessing Game')}
            </Typography>

            <Typography
              sx={{
                ...subTitleFontStyle,
                fontSize: '1.1rem',
                color: '#444',
                maxWidth: '520px',
                textAlign: { xs: 'center', md: 'left' },
                lineHeight: 1.5,
              }}
            >
              {i18n._(
                'Describe a word without saying it. Speak naturally, let your AI partner guess, and improve your vocabulary and fluency.',
              )}
            </Typography>

            <Stack
              ref={heroCtaRef}
              id={HERO_CTA_ID}
              sx={{
                gap: '12px',
                width: '100%',
                alignItems: { xs: 'center', md: 'flex-start' },
                paddingTop: '8px',
              }}
            >
              <Stack
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: '12px',
                  alignItems: 'center',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <AliasCtaButton href={practiceUrl} placement="hero">
                  {primaryCtaLabel}
                </AliasCtaButton>
                <Button
                  href="#how-it-works"
                  variant="outlined"
                  sx={{
                    ...buttonStyle,
                    height: '3rem',
                    borderRadius: '50px',
                    color: 'rgb(43 35 88)',
                    borderColor: 'rgb(43 35 88)',
                    backgroundColor: 'transparent',
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '400px', sm: 'none' },
                  }}
                >
                  {i18n._('See How It Works')}
                </Button>
              </Stack>

              <Typography
                sx={{
                  fontSize: '0.85rem',
                  color: '#666',
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                {i18n._('Beginner to fluent · Uses your microphone · Works in your browser')}
              </Typography>
            </Stack>
          </Stack>

          <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
            <AliasHeroDemo />
          </Stack>
        </Stack>
      </Stack>

      {/* 2. Three-step explanation */}
      <Stack
        id="how-it-works"
        component="section"
        sx={{
          width: '100%',
          alignItems: 'center',
          padding: { xs: '86px 16px', md: '122px 24px' },
          backgroundColor: '#fff',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: maxContentWidth, gap: '40px', alignItems: 'center' }}>
          <Typography
            component="h2"
            sx={{
              ...titleFontStyle,
              fontSize: { xs: '1.6rem', md: '2rem' },
              color: '#000',
              textAlign: 'center',
            }}
          >
            {i18n._('One round. Three simple steps.')}
          </Typography>

          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: '24px',
              width: '100%',
            }}
          >
            {steps.map((step, index) => {
              const Icon = stepIcons[index] ?? MessageCircle;
              return (
                <Stack
                  key={step.title}
                  sx={{
                    gap: '12px',
                    padding: '24px',
                    borderRadius: '16px',
                    backgroundColor: 'rgb(255, 253, 249)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Stack
                    sx={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(43, 35, 88, 0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgb(43 35 88)',
                    }}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </Stack>
                  <Typography
                    component="h3"
                    sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#000' }}
                  >
                    {index + 1}. {step.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.5 }}>
                    {step.text}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>

          <AliasCtaButton href={practiceUrl} placement="steps">
            {i18n._('Start My First Round')}
          </AliasCtaButton>
        </Stack>
      </Stack>

      {/* 3. Result preview */}
      <Stack
        component="section"
        sx={{
          width: '100%',
          alignItems: 'center',
          padding: { xs: '56px 16px', md: '92px 24px' },
          backgroundColor: 'rgba(231, 222, 203, 0.3)',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            maxWidth: maxContentWidth,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: '40px',
            alignItems: 'center',
          }}
        >
          <Stack sx={{ gap: '16px' }}>
            <Typography
              component="h2"
              sx={{
                ...titleFontStyle,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#000',
              }}
            >
              {i18n._('See the AI\u2019s Guess')}
            </Typography>
            <Typography
              sx={{ fontSize: '1rem', color: '#555', lineHeight: 1.6, maxWidth: '480px' }}
            >
              {i18n._(
                'Every round ends with a clear result: the word the AI guessed, whether you were right, and short feedback on how you explained it.',
              )}
            </Typography>
          </Stack>
          <Stack sx={{ alignItems: 'center' }}>
            <AliasResultPreview />
          </Stack>
        </Stack>
      </Stack>

      {/* 4. Learning benefits */}
      <Stack
        sx={{
          alignItems: 'center',
        }}
      >
        <Stack
          component="section"
          sx={{
            width: '100%',
            maxWidth: maxContentWidth,
            padding: { xs: '98px 10px', md: '104px 0' },
            backgroundColor: '#fff',
          }}
        >
          <Stack sx={{ width: '100%', gap: '20px' }}>
            <Typography
              component="h2"
              sx={{
                ...titleFontStyle,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#000',
              }}
            >
              {i18n._('Practice the skills real conversations require')}
            </Typography>

            <Stack
              component="ul"
              sx={{
                gap: '12px',
                margin: 0,
                padding: 0,
                listStyle: 'none',
              }}
            >
              {benefits.map((benefit) => (
                <Stack
                  component="li"
                  key={benefit}
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <Box sx={{ paddingTop: '2px', color: 'rgb(43 35 88)', flexShrink: 0 }}>
                    <Zap size={18} aria-hidden="true" />
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.5 }}>
                    {benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* 5. FAQ */}
      <Stack
        sx={{
          color: '#fff',
        }}
      >
        <GeneralFaqBlock
          id="alias-faq"
          title={i18n._('Common questions')}
          padding="80px 16px 72px"
          items={faqItems}
        />
      </Stack>

      {/* 6. Final CTA */}
      <Stack
        component="section"
        sx={{
          width: '100%',
          alignItems: 'center',
          padding: { xs: '64px 16px 80px', md: '80px 24px 96px' },
          backgroundColor: '#fff',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            maxWidth: '640px',
            gap: '24px',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            component="h2"
            sx={{
              ...titleFontStyle,
              fontSize: { xs: '1.6rem', md: '2rem' },
              color: '#000',
            }}
          >
            {i18n._('Ready to see whether the AI can guess your word?')}
          </Typography>

          <Typography sx={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.5 }}>
            {i18n._('Choose your level and start your first Alias round.')}
          </Typography>

          <AliasCtaButton href={practiceUrl} placement="final">
            {primaryCtaLabel}
          </AliasCtaButton>

          <Link
            href={friendsUrl}
            underline="hover"
            sx={{
              color: 'rgb(43 35 88)',
              fontSize: '0.95rem',
              fontWeight: 500,
              '&:hover': { color: '#05acff' },
            }}
          >
            {i18n._('Playing with friends? Open the group version →')}
          </Link>
        </Stack>
      </Stack>

      <AliasStickyCta sentinelRef={heroCtaRef} practiceUrl={practiceUrl} label={stickyCtaLabel} />
    </Stack>
  );
};
