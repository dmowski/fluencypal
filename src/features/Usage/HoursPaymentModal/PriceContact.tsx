import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useSettings } from '@/features/Settings/useSettings';
import { useLingui } from '@lingui/react';
import { Stack, Typography, Button } from '@mui/material';
import { Users, Headset } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const PriceContact = () => {
  const { i18n } = useLingui();
  const router = useRouter();
  const settings = useSettings();
  const language = settings.userSettings?.pageLanguageCode || 'en';

  const communityUrl = getUrlStart(language) + 'practice?page=community&section=chat';
  const supportUrl = getUrlStart(language) + 'practice?page=community&section=tech-support';

  return (
    <Stack
      sx={{
        gap: '5px',
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="h6" component="h3" sx={{ marginBottom: '0px' }}>
        {i18n._('Not sure yet?')}
      </Typography>
      <Button
        variant="text"
        startIcon={<Users size={'14px'} />}
        onClick={() => router.push(communityUrl)}
      >
        {i18n._('Ask community')}
      </Button>
      <Button
        startIcon={<Headset size={'14px'} />}
        variant="text"
        onClick={() => router.push(supportUrl)}
      >
        {i18n._('Ask in support channel')}
      </Button>
    </Stack>
  );
};
