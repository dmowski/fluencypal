import { Stack, Typography, Button } from '@mui/material';
import { getAppUrlStart } from '../Lang/getUrlStart';
import { SupportedLanguage } from '../Lang/lang';
import { ChevronRight } from 'lucide-react';

export const PageMoved = ({ lang, page }: { lang: SupportedLanguage; page: string }) => {
  const url = getAppUrlStart(lang) + page;
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
        }}
      >
        <Typography variant="h3" component={'h1'} sx={{ mb: 3 }}>
          The application has been moved to a new address
        </Typography>
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
            Go to new URL
          </Button>
          <Typography variant="caption" color="textSecondary">
            {url}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
