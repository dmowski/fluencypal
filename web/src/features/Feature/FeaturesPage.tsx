import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { getFeaturesData } from './featuresData';
import { Button, Link, Stack, Typography } from '@mui/material';

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
          padding: { xs: '96px 12px 0', md: '118px 16px 0' },
          backgroundColor: 'rgba(10, 18, 30, 1)',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: maxLandingWidth, gap: { xs: '12px', md: '14px' } }}>
          <Typography
            component={'h1'}
            variant="h2"
            sx={{
              ...titleFontStyle,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {i18n._('FluencyPal Features')}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              color: 'text.secondary',
              maxWidth: '900px',
              lineHeight: 1.5,
            }}
          >
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
            gridTemplateColumns: '1fr',
            gap: { xs: '34px', md: '38px' },
            padding: { xs: '24px 0 60px', md: '30px 0 76px' },
          }}
        >
          {features.map((feature) => (
            <Stack
              key={feature.id}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '14px',
                backgroundColor: 'rgba(255,255,255, 0.02)',
                padding: { xs: '20px 20px', md: '30px' },
                gap: '12px',
                justifyContent: 'space-between',
                boxShadow: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <Typography
                variant="h5"
                component={'h2'}
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.35,
                  fontWeight: 800,
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.5,
                  flexGrow: 1,
                }}
              >
                {feature.subTitle}
              </Typography>
              <Stack sx={{ alignItems: 'flex-start', paddingTop: '6px' }}>
                <Link
                  href={`${urlStart}features/${feature.id}`}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  {`${i18n._('Read more about')} ${feature.title}`}
                </Link>
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
