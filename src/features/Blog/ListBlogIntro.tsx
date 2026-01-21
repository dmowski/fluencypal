import { Stack, Typography } from '@mui/material';
import { maxContentWidth, subTitleFontStyle, titleFontStyle } from '../Landing/landingSettings';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

interface ListBlogIntroProps {
  lang: SupportedLanguage;
}
export const ListBlogIntro = ({ lang }: ListBlogIntroProps) => {
  const i18n = getI18nInstance(lang);

  return (
    <Stack
      sx={{
        width: '100%',
        padding: '120px 0 0px 0',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '100px',
        backgroundColor: `#ecf6f2`,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          gap: '50px',
        }}
      >
        <Stack
          sx={{
            maxWidth: maxContentWidth,
            boxSizing: 'border-box',
            alignItems: 'center',
            padding: '0 10px',
            display: 'grid',
            gridTemplateColumns: '3fr 1fr',
            gap: '60px',
            '@media (max-width: 800px)': {
              gridTemplateColumns: '1fr',
              gap: '0px',
            },
          }}
        >
          <Stack
            gap={'10px'}
            sx={{
              paddingBottom: '50px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h3"
              component={'h2'}
              sx={{
                ...titleFontStyle,
                fontSize: '2.8rem',
                color: '#000',
                '@media (max-width: 800px)': {
                  fontSize: '2.2rem',
                },
              }}
            >
              {i18n._(`Read and Learn with my blog`)}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: '810px',
                color: '#000',
                ...subTitleFontStyle,
                fontSize: '1.1rem',
              }}
            >
              {i18n._(
                `Get inspired and learn about the latest trends in language learning, teaching, and technology.`,
              )}
            </Typography>
          </Stack>
          <Stack
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              '@media (max-width: 1100px)': {
                zIndex: 0,
                maxHeight: '230px',
                alignItems: 'center',
                justifyContent: 'flex-start',
              },
            }}
          >
            <img
              src="/blog.jpg"
              alt="Illustration of people reading"
              style={{
                width: 'max-content',
                maxWidth: '90vw',
                height: '370px',
                opacity: 0.9,
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
