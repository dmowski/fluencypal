import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { getFeatureById } from './featuresData';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Button, Link, Stack, Typography } from '@mui/material';

interface FeatureOnePageProps {
  id: string;
  lang: SupportedLanguage;
}

export const FeatureOnePage = ({ id, lang }: FeatureOnePageProps) => {
  const i18n = getI18nInstance(lang);
  const feature = getFeatureById(lang, id);

  if (!feature) {
    return null;
  }

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
        <Stack sx={{ width: '100%', gap: '15px', maxWidth: '900px' }}>
          <Stack sx={{ width: '100%', gap: '15px' }}>
            <Stack sx={{ alignItems: 'flex-start', paddingTop: '8px' }}>
              <Link
                sx={{
                  color: '#007eeb',
                }}
                href={`${urlStart}features`}
              >
                {i18n._('View all features')}
              </Link>
            </Stack>
            <Typography component={'h1'} variant="h2" sx={{ ...titleFontStyle, color: '#111' }}>
              {feature.title}
            </Typography>
            <Typography sx={{ fontSize: '1.1rem', color: '#555', maxWidth: '900px' }}>
              {feature.subTitle}
            </Typography>
          </Stack>
          <Stack
            sx={{
              width: '100%',

              padding: '40px 0 120px 0',
              color: '#222',
              alignItems: 'flex-start',

              h2: {
                fontSize: '1.3rem',
                fontWeight: 650,
              },
            }}
          >
            <Stack
              sx={{
                maxWidth: '600px',
              }}
            >
              <Markdown variant="blog">{feature.content}</Markdown>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <CtaBlock
        title={i18n._('Practice This Skill with FluencyPal')}
        actionButtonTitle={i18n._('Start Practice')}
        actionButtonLink={`${urlStart}quiz`}
      />
      <Footer lang={lang} />
    </>
  );
};
