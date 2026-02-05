import { useLingui } from '@lingui/react';
import { Stack, Typography, Button } from '@mui/material';

export const PaymentSuccess = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '30px',
      }}
    >
      <Stack>
        <Typography variant="h4">{i18n._('Payment successful!')}</Typography>
        <Typography>{i18n._('Thank you for your purchase.')}</Typography>
      </Stack>
      <Button variant="contained" color="info" size="large" onClick={onClose}>
        {i18n._('Start using the app')}
      </Button>
    </Stack>
  );
};
