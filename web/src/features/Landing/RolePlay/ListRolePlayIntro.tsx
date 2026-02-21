import { Stack, Typography } from '@mui/material';
import { maxContentWidth, subTitleFontStyle, titleFontStyle } from '../landingSettings';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

interface ListRolePlayIntroProps {
  lang: SupportedLanguage;
}
export const ListRolePlayIntro = ({ lang }: ListRolePlayIntroProps) => {
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
              {i18n._(`Practice Real-Life Conversations With Role-Play Scenarios`)}
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
                `Order food, schedule appointments, ace job interviews, and more—all with guidance from your AI tutor.`,
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
              src="/peopleIll.jpg"
              alt="Role Play Scenarios"
              style={{
                width: 'max-content',
                maxWidth: '90vw',
                height: '370px',
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
