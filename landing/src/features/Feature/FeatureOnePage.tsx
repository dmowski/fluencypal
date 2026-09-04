import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { Footer } from '@/features/Landing/Footer';
import { CtaBlock } from '@/features/Landing/ctaBlock';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { buttonStyle, titleFontStyle } from '@/features/Landing/landingSettings';
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
  const contactLink = `${urlStart}contacts`;

  const isRemoved = feature.removed;

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
                  color: '#0b6abd',
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

            {!isRemoved && (
              <Button
                href={`${getAppUrlStart(lang)}quiz`}
                variant="contained"
                size="large"
                data-analytics="feature-cta"
                sx={{
                  ...buttonStyle,
                  marginTop: '8px',
                  padding: '12px 36px',
                  color: '#000',
                  backgroundColor: '#05acff',
                  alignSelf: 'flex-start',
                }}
              >
                {i18n._('Get Started')}
              </Button>
            )}

            {isRemoved && (
              <Stack
                sx={{
                  backgroundColor: 'rgba(211, 47, 47, 0.06)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d32f2f',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Stack>
                  <Typography
                    sx={{
                      color: '#d32f2f',
                      fontWeight: 600,
                    }}
                    variant="h5"
                  >
                    {i18n._('This feature has been removed.')}
                  </Typography>
                  <Typography sx={{ color: '#d32f2f' }}>
                    {i18n._(
                      `I've removed this feature to focus on improving other aspects of FluencyPal. We appreciate your understanding and support. If you'd like to use this feature, please contact me.`,
                    )}
                  </Typography>
                </Stack>

                <Button variant="outlined" color="error" href={contactLink}>
                  {i18n._('Contacts')}
                </Button>
              </Stack>
            )}
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
        actionButtonLink={`${getAppUrlStart(lang)}quiz`}
      />
      <Footer lang={lang} />
    </>
  );
};
