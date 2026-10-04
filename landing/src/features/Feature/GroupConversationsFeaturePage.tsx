import { Button, Link, Stack, Typography } from '@mui/material';
import { Calendar, Languages, Video } from 'lucide-react';
import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { buttonStyle, maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
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
  const exampleCalls = [
    {
      month: 'TUE',
      day: '14',
      when: i18n._('Tuesday · 18:00'),
      detail: i18n._('English · 6 joined'),
    },
    {
      month: 'THU',
      day: '16',
      when: i18n._('Thursday · 19:00'),
      detail: i18n._('English · 4 joined'),
    },
    {
      month: 'SAT',
      day: '18',
      when: i18n._('Saturday · 11:00'),
      detail: i18n._('Spanish · 3 joined'),
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
        <Stack sx={{ width: '100%', maxWidth: maxLandingWidth, gap: { xs: '48px', md: '72px' } }}>
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
              <Typography component="h1" variant="h2" sx={{ ...titleFontStyle, color: '#fff' }}>
                {feature.title}
              </Typography>
              <Typography
                sx={{ fontSize: '1.15rem', color: 'rgba(244, 247, 251, 0.78)', maxWidth: '560px' }}
              >
                {feature.subTitle}
              </Typography>
              <Button
                href={appHref}
                variant="contained"
                size="large"
                data-analytics="feature-cta"
                data-testid="group-conversations-cta"
                sx={{
                  ...buttonStyle,
                  marginTop: '8px',
                  padding: '12px 32px',
                  color: '#041018',
                  backgroundColor: '#7DDEAA',
                  fontWeight: 800,
                }}
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
                position: 'relative',
                gap: '4px',
                padding: '22px',
                borderRadius: '20px',
                border: '1px solid rgba(148, 145, 255, 0.22)',
                backgroundColor: '#16181e',
                boxShadow: '0 12px 45px #00000040',
                overflow: 'hidden',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
                {i18n._('Upcoming calls')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.65, paddingBottom: '8px' }}>
                {i18n._('A sample week. Next, you will see real times for where you live.')}
              </Typography>
              {exampleCalls.map((call) => (
                <Stack
                  key={call.when}
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
                    <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>{call.month}</Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
                      {call.day}
                    </Typography>
                  </Stack>
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{call.when}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {call.detail}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: '16px',
            }}
          >
            {[
              {
                icon: <Video size={22} />,
                title: i18n._('Google Meet'),
                body: i18n._('You talk together on Google Meet.'),
              },
              {
                icon: <Languages size={22} />,
                title: i18n._('Mixed levels'),
                body: i18n._(
                  'Beginners and advanced learners share the call. Everyone is practicing.',
                ),
              },
              {
                icon: <Calendar size={22} />,
                title: i18n._('$2 for a month'),
                body: i18n._(
                  '$2 pays for one month of group calls. After that month, you can pay again if you want more. If you already pay for practice, the calls are included.',
                ),
              },
            ].map((item) => (
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

          <Stack sx={{ gap: '14px', maxWidth: '720px' }}>
            <Typography component="h2" variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('How you join')}
            </Typography>
            {[
              i18n._('Choose the language you want to practice.'),
              i18n._('See the next calls in your own time.'),
              i18n._('Tell us your language, then create an account.'),
              i18n._('Pay $2 for the month, or skip it and pay later.'),
              i18n._('Talk with AI while you wait, then join the call.'),
            ].map((line, index) => (
              <Stack key={line} direction="row" sx={{ gap: '12px', alignItems: 'flex-start' }}>
                <Typography sx={{ fontWeight: 800, color: '#7DDEAA', minWidth: '24px' }}>
                  {index + 1}
                </Typography>
                <Typography sx={{ fontSize: '1.05rem' }}>{line}</Typography>
              </Stack>
            ))}
          </Stack>

          <Stack
            sx={{
              maxWidth: '680px',
              paddingBottom: '40px',
              color: 'rgba(244, 247, 251, 0.88)',
              h2: { fontSize: '1.4rem', fontWeight: 750, color: '#fff' },
              h3: { fontSize: '1.15rem', fontWeight: 700, color: '#fff' },
            }}
          >
            <Markdown variant="blog">{feature.content}</Markdown>
          </Stack>
        </Stack>
      </Stack>
      <CtaBlock
        title={i18n._('See the next group call')}
        actionButtonTitle={i18n._('See upcoming calls')}
        actionButtonLink={appHref}
        actionButtonId="group-conversations-cta-footer"
      />
      <Footer lang={lang} />
    </>
  );
};
