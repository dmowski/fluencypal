import { Button, Stack, Typography } from '@mui/material';
import { Clock, Languages, Users } from 'lucide-react';
import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { MutedPreviewVideo } from '@/features/uiKit/Video/MutedPreviewVideo';
import { buttonStyle, maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { englishGroupCallOnboardingHref, talkWithAlexHref } from './groupCallOnboardingHref';
import { GroupConversationJoinButton } from './GroupConversationJoinButton';
import { FeatureData } from '../types';

export const GroupConversationsFeaturePage = ({
  lang,
  feature,
}: {
  lang: SupportedLanguage;
  feature: FeatureData;
}) => {
  const i18n = getI18nInstance(lang);
  const appHref = englishGroupCallOnboardingHref(lang);
  const alexHref = talkWithAlexHref(lang);
  const expectations = [
    {
      icon: <Users size={22} />,
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
      title: i18n._('A time that fits'),
      body: i18n._(
        'I look for people who fit, then we pick a time that is comfortable for everyone.',
      ),
    },
  ];
  const steps = [
    {
      title: i18n._('Tell me about you'),
      body: i18n._('Share your interests, your English level, and how I can reach you.'),
    },
    {
      title: i18n._('I look for people'),
      body: i18n._('I will write once I find people who fit. Group calls are free.'),
    },
    {
      title: i18n._('We pick a time'),
      body: i18n._('We discuss a time slot and arrange a call that works for each person.'),
    },
  ];
  const questions = [
    {
      question: i18n._('Do the calls cost money?'),
      answer: i18n._(
        'No. Group conversations are free. There is no payment and no account required to request one.',
      ),
    },
    {
      question: i18n._('Can a beginner keep up?'),
      answer: i18n._(
        'Speak even when the words come slowly. Mistakes are welcome. Nobody corrects you unless you ask.',
      ),
    },
    {
      question: i18n._('When is the call?'),
      answer: i18n._(
        'After I find a good group, I write you. We choose a time that is comfortable for everyone.',
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
          <Stack sx={{ gap: { xs: '28px', md: '40px' } }}>
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
                gap: { xs: '28px', md: '48px' },
                alignItems: { xs: 'flex-start', md: 'center' },
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
                  sx={{
                    fontSize: '1.15rem',
                    color: 'rgba(244, 247, 251, 0.78)',
                    maxWidth: '520px',
                  }}
                >
                  {feature.subTitle}
                </Typography>
                <GroupConversationJoinButton href={appHref} />
              </Stack>

              <Stack
                data-testid="group-conversations-video"
                sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'center' }}
              >
                <MutedPreviewVideo src="/group_call/intro2.webm" />
              </Stack>
            </Stack>

            <Stack
              data-testid="group-conversations-whats-next"
              sx={{
                gap: '22px',
                padding: { xs: '0', md: '100px 0 30px 0' },
              }}
            >
              <Stack sx={{ gap: '10px', maxWidth: '1240px' }}>
                <Typography
                  sx={{
                    color: '#7DDEAA',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                  }}
                >
                  {i18n._("What's next")}
                </Typography>
                <Typography component="h2" variant="h2" sx={{ fontWeight: 800 }}>
                  {i18n._('Talk with the group, or just with Alex')}
                </Typography>
                <Typography sx={{ maxWidth: '640px', color: 'rgba(244, 247, 251, 0.75)' }}>
                  {i18n._(
                    'Group calls are free, with other learners. I arrange a time that works for the people on the call. While you wait, you can practice with AI, or talk with Alex first.',
                  )}
                </Typography>
              </Stack>
              <Stack
                sx={{
                  width: '100%',
                  maxWidth: '640px',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: '16px',
                }}
              >
                <Stack sx={{ gap: '8px', alignItems: 'center' }}>
                  <Button
                    href={appHref}
                    variant="outlined"
                    size="large"
                    data-analytics="community-call-video"
                    data-testid="group-conversations-join-group"
                    sx={{
                      ...buttonStyle,
                      width: '100%',
                      padding: '12px 24px',
                      color: '#f4f7fb',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(125, 222, 170, 0.7)',
                      fontWeight: 800,
                    }}
                  >
                    {i18n._('Request a group call')}
                  </Button>
                  <Typography
                    sx={{
                      color: 'rgba(244, 247, 251, 0.7)',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                    }}
                  >
                    {i18n._('I will write when I find a good group')}
                  </Typography>
                </Stack>
                <Stack sx={{ gap: '8px', alignItems: 'center' }}>
                  <Button
                    href={alexHref}
                    variant="contained"
                    size="large"
                    data-analytics="talk-with-alex-cta"
                    data-testid="group-conversations-talk-with-alex"
                    sx={{
                      ...buttonStyle,
                      width: '100%',
                      padding: '12px 24px',
                      color: '#041018',
                      backgroundColor: '#7DDEAA',
                      fontWeight: 800,
                    }}
                  >
                    {i18n._('Talk with Alex')}
                  </Button>
                  <Typography
                    sx={{
                      color: 'rgba(244, 247, 251, 0.7)',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                    }}
                  >
                    {i18n._('A short call so we can get to know each other')}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack sx={{ gap: '18px', paddingTop: '48px' }}>
            <Typography component="h2" variant="h2" sx={{ fontWeight: 800 }}>
              {i18n._('What to expect')}
            </Typography>
            <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)', maxWidth: '720px' }}>
              {i18n._('Each call also has a text chat in FluencyPal for the people on it.')}
            </Typography>
            <Stack
              sx={{
                display: 'grid',
                paddingTop: '18px',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: '36px',
              }}
            >
              {expectations.map((item) => (
                <Stack
                  key={item.title}
                  sx={{
                    gap: '20px',
                    padding: '30px 0 0 0 ',
                    borderTop: '1px solid #435045',
                  }}
                >
                  <Stack sx={{ color: '#7DDEAA' }}>{item.icon}</Stack>
                  <Stack>
                    <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)' }}>{item.body}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack sx={{ gap: '18px', paddingTop: '68px' }}>
            <Typography component="h2" variant="h2" sx={{ fontWeight: 800 }}>
              {i18n._('How a call is arranged')}
            </Typography>
            <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)', maxWidth: '720px' }}>
              {i18n._('Want to warm up before your call? Practice with AI first.')}
            </Typography>
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: '36px',
              }}
            >
              {steps.map((step, index) => (
                <Stack
                  key={step.title}
                  sx={{
                    gap: '20px',
                    padding: '30px 0 0 0 ',
                    borderTop: '1px solid #435045',
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: '#7DDEAA', fontSize: '2.15rem' }}>
                    {index + 1}
                  </Typography>
                  <Stack>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(244, 247, 251, 0.75)' }}>{step.body}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack sx={{ gap: '22px', maxWidth: '720px', paddingBottom: '24px', paddingTop: '68px' }}>
            <Typography component="h2" variant="h2" sx={{ fontWeight: 800 }}>
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
        title={i18n._('Request a free group call')}
        actionButtonTitle={i18n._('Send a request')}
        actionButtonLink={appHref}
        actionButtonId="community-call-cta-footer"
        buttonBackgroundColor="#7DDEAA"
        buttonColor="#041018"
      />
      <Footer lang={lang} />
    </>
  );
};
