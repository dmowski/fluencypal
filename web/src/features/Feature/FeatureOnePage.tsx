import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { maxLandingWidth, titleFontStyle } from '@/features/Landing/landingSettings';
import { getFeatureById } from './featuresData';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Button, Stack, Typography } from '@mui/material';

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
        sx={{ width: '100%', alignItems: 'center', padding: '110px 10px 0' }}
      >
        <Stack sx={{ width: '100%', maxWidth: maxLandingWidth, gap: '15px' }}>
          <Typography component={'h1'} variant="h2" sx={{ ...titleFontStyle, color: '#111' }}>
            {feature.title}
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', color: '#555', maxWidth: '900px' }}>
            {feature.subTitle}
          </Typography>

          <Stack sx={{ alignItems: 'flex-start', paddingTop: '8px' }}>
            <Button variant="outlined" href={`${urlStart}features`}>
              {i18n._('View all features')}
            </Button>
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: '100%',
            maxWidth: maxLandingWidth,
            padding: '24px 0 70px',
            color: '#222',
            h2: {
              fontSize: '1.3rem',
              fontWeight: 650,
            },
          }}
        >
          <Markdown variant="blog">{feature.content}</Markdown>
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
