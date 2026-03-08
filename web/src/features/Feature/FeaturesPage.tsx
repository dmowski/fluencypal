import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { getFeaturesData } from './featuresData';
import { Button, Stack, Typography } from '@mui/material';

interface FeaturesPageProps {
  lang: SupportedLanguage;
}

export const FeaturesPage = ({ lang }: FeaturesPageProps) => {
  const i18n = getI18nInstance(lang);
  const { features } = getFeaturesData(lang);
  const urlStart = getUrlStart(lang);

  return (
    <>
      <HeaderStatic lang={lang} />
      <Stack
        component={'main'}
        sx={{
          width: '100%',
          alignItems: 'center',
          padding: '110px 10px 0',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: maxLandingWidth, gap: '18px' }}>
          <Typography component={'h1'} variant="h2" sx={{ ...titleFontStyle, color: '#111' }}>
            {i18n._('FluencyPal Features')}
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', color: '#444', maxWidth: '900px' }}>
            {i18n._(
              'Explore FluencyPal features for AI English speaking practice, personalized grammar, vocabulary lessons, role plays, stories, debates, and community learning.',
            )}
          </Typography>
        </Stack>

        <Stack
          sx={{
            width: '100%',
            maxWidth: maxLandingWidth,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            padding: '28px 0 70px',
          }}
        >
          {features.map((feature) => (
            <Stack
              key={feature.id}
              sx={{
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '12px',
                padding: '18px',
                gap: '10px',
              }}
            >
              <Typography variant="h6" component={'h2'} sx={{ color: '#111' }}>
                {feature.title}
              </Typography>
              <Typography sx={{ color: '#555' }}>{feature.subTitle}</Typography>
              <Stack sx={{ alignItems: 'flex-start', paddingTop: '6px' }}>
                <Button variant="contained" href={`${urlStart}features/${feature.id}`}>
                  {i18n._('Read more')}
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <CtaBlock
        title={i18n._('Start Your Journey to Fluent Conversations Now')}
        actionButtonTitle={i18n._('Get Started')}
        actionButtonLink={`${urlStart}quiz`}
      />
      <Footer lang={lang} />
    </>
  );
};
