import { Stack, Typography, Button } from '@mui/material';
import { getAppUrlStart } from '../Lang/getUrlStart';
import { SupportedLanguage } from '../Lang/lang';
import { ChevronRight } from 'lucide-react';
import { getI18nInstance } from '@/appRouterI18n';

export const QuizStart = ({ lang }: { lang: SupportedLanguage }) => {
  const url = getAppUrlStart(lang) + 'quiz';
  const i18n = getI18nInstance(lang);

  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Stack
        sx={{
          maxWidth: '600px',
          alignItems: 'flex-start',
          width: '100%',
          gap: '30px',
          padding: '20px',
        }}
      >
        <Stack>
          <Typography
            variant="h3"
            component={'h1'}
            sx={{
              fontWeight: 'bold',
            }}
          >
            {i18n._('Learning Plan')}
          </Typography>
          <Typography>
            {i18n._('Create a personalized language learning plan with FluencyPal.')}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: '5px',
          }}
        >
          <Button
            endIcon={<ChevronRight />}
            color="info"
            size="large"
            href={url}
            variant="contained"
          >
            Go to Quiz
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
