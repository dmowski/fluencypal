import { Link, Stack, Typography } from '@mui/material';
import { Clock, Languages, Video } from 'lucide-react';
import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { GroupConversationJoinButton } from './GroupConversationJoinButton';
import { GroupConversationSchedule } from './GroupConversationSchedule';
import { FeatureData } from './types';

export const GroupConversationsFeaturePage = ({
  lang,
  feature,
}: {
  lang: SupportedLanguage;
  feature: FeatureData;
}) => {
  const i18n = getI18nInstance(lang);
  const appHref = `${getAppUrlStart(lang)}community-call`;
  const urlStart = getUrlStart(lang);
  const expectations = [
    {
      icon: <Video size={22} />,
      title: i18n._('Other learners'),
      body: i18n._('You talk together on Google Meet. There is no teacher and no set topic.'),
    },
    {
      icon: <Languages size={22} />,
      title: i18n._('Mixed levels'),
      body: i18n._(
        'Beginners can speak slowly. Advanced learners practice too. A correction comes only if someone asks.',
      ),
    },
    {
      icon: <Clock size={22} />,
      title: i18n._('Your pace'),
      body: i18n._(
        'Join when the call starts. Leave when you need to. You can see how many people plan to come.',
      ),
    },
  ];
  const steps = [
    {
      title: i18n._('Find a call'),
      body: i18n._('Choose a time that works for you. The calls are free.'),
    },
    {
      title: i18n._('Create an account'),
      body: i18n._('Sign up to save your place. There is no payment.'),
    },
    {
      title: i18n._('Join on Google Meet'),
      body: i18n._('Open the call when it starts.'),
    },
  ];
  const questions = [
    {
      question: i18n._('Do the calls cost money?'),
      answer: i18n._(
        'No. Group conversations are free. Create an account, then join when the call starts.',
      ),
    },
    {
      question: i18n._('Can a beginner keep up?'),
      answer: i18n._(
        'Speak even when the words come slowly. Mistakes are welcome. Nobody corrects you unless you ask.',
      ),
    },
    {
      question: i18n._('How often are calls?'),
      answer: i18n._(
        'When one is on the schedule. Open it to see the next English calls in your local time zone.',
      ),
    },
  ];

  return (
    <>
      <HeaderStatic lang={lang} />
      <Stack
        component="main"
        data-testid="group-conversations-page"
        sx={{
          width: '100%',
          alignItems: 'center',
          padding: { xs: '96px 16px 0', md: '120px 24px 0' },
          backgroundColor: '#0a121e',
          color: '#f4f7fb',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: maxLandingWidth, gap: { xs: '56px', md: '80px' } }}>
          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
              gap: { xs: '28px', md: '48px' },
              alignItems: 'center',
            }}
          >
            <Stack sx={{ gap: '18px', alignItems: 'flex-start' }}>
              <Typography
                sx={{
                  color: '#7DDEAA',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                {i18n._('Group conversations')}
              </Typography>
              <Typography
                component="h1"
                sx={{ ...titleFontStyle, color: '#fff', fontSize: { xs: '2.1rem', md: '3rem' } }}
              >
                {i18n._('Practice English with other learners')}
              </Typography>
              <Typography
                sx={{ fontSize: '1.15rem', color: 'rgba(244, 247, 251, 0.78)', maxWidth: '520px' }}
              >
                {feature.subTitle}
              </Typography>
              <GroupConversationJoinButton href={appHref} />
              <Link href={`${urlStart}features`} sx={{ color: '#8ec8ef' }}>
                {i18n._('View all features')}
              </Link>
            </Stack>

            <GroupConversationSchedule moreHref={appHref} />
          </Stack>

          <Stack sx={{ gap: '18px' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('What to expect')}
            </Typography>
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: '16px',
              }}
            >
              {expectations.map((item) => (
                <Stack
                  key={item.title}
                  sx={{
                    gap: '10px',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <Stack sx={{ color: '#7DDEAA' }}>{item.icon}</Stack>
                  <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                  <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)' }}>{item.body}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)', maxWidth: '720px' }}>
              {i18n._('Each call also has a text chat in FluencyPal for the people on it.')}
            </Typography>
          </Stack>

          <Stack sx={{ gap: '18px' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('How you join')}
            </Typography>
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: '16px',
              }}
            >
              {steps.map((step, index) => (
                <Stack
                  key={step.title}
                  sx={{
                    gap: '8px',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#7DDEAA' }}>{index + 1}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)' }}>{step.body}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)', maxWidth: '720px' }}>
              {i18n._('Want to warm up before your call? Practice with AI first.')}
            </Typography>
          </Stack>

          <Stack sx={{ gap: '22px', maxWidth: '720px', paddingBottom: '24px' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('Questions')}
            </Typography>
            {questions.map((item) => (
              <Stack key={item.question} sx={{ gap: '6px' }}>
                <Typography sx={{ fontWeight: 800 }}>{item.question}</Typography>
                <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)' }}>{item.answer}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
      <CtaBlock
        title={i18n._('See the next English call')}
        actionButtonTitle={i18n._('See upcoming calls')}
        actionButtonLink={appHref}
        actionButtonId="community-call-cta-footer"
        buttonBackgroundColor="#7DDEAA"
        buttonColor="#041018"
      />
      <Footer lang={lang} />
    </>
  );
};
