import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { useUsage } from './useUsage';
import { useEffect, useState } from 'react';
import { CheckCheck, Landmark } from 'lucide-react';

export const SubscriptionWaiter = ({
  onClose,
  initActiveTill,
}: {
  onClose: () => void;
  initActiveTill: string;
}) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (initActiveTill !== usage.activeSubscriptionTill) {
      setIsChanged(true);
      return;
    }
  }, [usage.activeSubscriptionTill]);

  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        minHeight: '100dvh',
        maxWidth: '100dvw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Stack sx={{ alignItems: 'center', gap: '20px', padding: '0 10px' }}>
        {isChanged ? (
          <>
            <CheckCheck size={'40px'} color="#4caf50" />
            <Stack sx={{ alignItems: 'center', gap: '0px' }}>
              <Typography variant="h6" align="center">
                {i18n._(`Done`)}
              </Typography>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`Your subscription has been successfully changed.`)}
              </Typography>
            </Stack>
            <Button variant="contained" onClick={onClose}>
              {i18n._(`Close`)}
            </Button>
          </>
        ) : (
          <>
            <Landmark size={'40px'} />
            <Stack sx={{ alignItems: 'center', gap: '0px' }}>
              <Typography variant="h6" align="center">
                {i18n._(`Waiting for payment...`)}
              </Typography>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`Please wait while we process your payment.`)}
              </Typography>
            </Stack>
            <Button variant="text" onClick={onClose}>
              {i18n._(`Close`)}
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
};
