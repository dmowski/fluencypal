import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react/macro';
import { Typography } from '@mui/material';
import { GoogleMeetIcon } from './GoogleMeetIcon';

export const CommunityCallsHeader = () => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        paddingBottom: '15px',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Stack>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {i18n._('Community call on Google Meet')}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 400, opacity: 0.7 }}>
          {i18n._('We meet at a set time and just talk.')}
        </Typography>
      </Stack>
      <GoogleMeetIcon />
    </Stack>
  );
};
