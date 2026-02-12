import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { useSettings } from '../Settings/useSettings';
import { CONTACTS } from '../Landing/Contact/data';

export const BlockedAccess = () => {
  const { i18n } = useLingui();
  const settings = useSettings();

  //const isBlockedByAge = settings.userSettings?.isBlockedByAge;

  return (
    <Stack
      sx={{
        alignItems: 'center',
        padding: '40px 20px',
      }}
    >
      <Stack
        sx={{
          maxWidth: '680px',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800 }}>
          {i18n._(`Access Blocked`)}
        </Typography>

        <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
          {i18n._(
            `Your account is blocked due to age restrictions. Please contact support for assistance.`,
          )}
        </Typography>

        <Typography
          sx={{
            paddingTop: '20px',
            fontSize: '26px',
          }}
        >
          {CONTACTS.email}
        </Typography>
      </Stack>
    </Stack>
  );
};
