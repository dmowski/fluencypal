import { Button, Link, Stack, Typography } from '@mui/material';
import { Clock, Languages, Video } from 'lucide-react';
import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { buttonStyle, maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { FeatureData } from './types';

const ctaButtonSx = {
  ...buttonStyle,
  padding: '12px 32px',
  color: '#041018',
  backgroundColor: '#7DDEAA',
  fontWeight: 800,
};

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
  const exampleCalls = [
    { weekday: 'TUE', day: '14', time: '18:00', detail: i18n._('English · 6 joined') },
    { weekday: 'THU', day: '16', time: '19:00', detail: i18n._('English · 4 joined') },
    { weekday: 'SAT', day: '18', time: '11:00', detail: i18n._('English · 3 joined') },
  ];
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
      body: i18n._('Choose a time that works for you. You can look before you pay.'),
    },
    {
      title: i18n._('Get access'),
      body: i18n._(
        'Create an account. Pay $2 for one month, or use a Practice, Conversation, or Conversation 10 plan that already includes the calls.',
      ),
    },
    {
      title: i18n._('Join on Google Meet'),
      body: i18n._('Open the call when it starts.'),
    },
  ];
  const questions = [
    {
      question: i18n._('Can I look before I pay?'),
      answer: i18n._(
        'Yes. The schedule is open. You need the $2 month, or an active Practice, Conversation, or Conversation 10 plan, before you enter the call.',
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
              <Button
                href={appHref}
                variant="contained"
                size="large"
                data-analytics="community-call-cta"
                data-testid="group-conversations-cta"
                sx={{ ...ctaButtonSx, marginTop: '8px' }}
              >
                {i18n._('See upcoming calls')}
              </Button>
              <Link href={`${urlStart}features`} sx={{ color: '#8ec8ef' }}>
                {i18n._('View all features')}
              </Link>
            </Stack>

            <Stack
              data-testid="group-conversations-schedule"
              sx={{
                gap: '4px',
                padding: '22px',
                borderRadius: '20px',
                border: '1px solid rgba(148, 145, 255, 0.22)',
                backgroundColor: '#16181e',
                boxShadow: '0 12px 45px #00000040',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                {i18n._('Example schedule')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.65, paddingBottom: '8px' }}>
                {i18n._('Open the schedule to see available calls in your local time zone.')}
              </Typography>
              {exampleCalls.map((call) => (
                <Stack
                  key={call.time}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Stack
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>
                      {call.weekday}
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
                      {call.day}
                    </Typography>
                  </Stack>
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{call.time}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {call.detail}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
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
              {i18n._(
                'Want to warm up before your call? Practice with AI first. That practice is separate from the $2.',
              )}
            </Typography>
          </Stack>

          <Stack sx={{ gap: '12px', maxWidth: '720px' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('$2 for one month of group calls')}
            </Typography>
            <Typography sx={{ color: 'rgba(244, 247, 251, 0.78)', fontSize: '1.05rem' }}>
              {i18n._(
                'No automatic renewal. You can look at the schedule before you pay. You need this month, or an active Practice, Conversation, or Conversation 10 plan, before you enter the call.',
              )}
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
