import { useLingui } from '@lingui/react';
import { Stack, Typography, Button } from '@mui/material';
import { Check } from 'lucide-react';

export const PaymentSuccess = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '30px',
        width: '100%',
        maxWidth: '700px',
      }}
    >
      <Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('Payment successful!')}
          </Typography>
        </Stack>

        <Typography>{i18n._('Thank you for your purchase.')}</Typography>
      </Stack>
      <Button
        variant="contained"
        color="success"
        size="large"
        onClick={onClose}
        startIcon={<Check size={'20px'} />}
      >
        {i18n._('Start using the app')}
      </Button>
    </Stack>
  );
};
