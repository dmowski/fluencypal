'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect } from 'react';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { useAccess } from '@/features/Usage/useAccess';

export const CommunityPaywall = () => {
  const { i18n } = useLingui();
  const access = useAccess();

  useEffect(() => {
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'community' });
  }, []);

  return (
    <Stack
      data-testid="community-paywall"
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        minHeight: '240px',
        padding: '48px 20px',
        textAlign: 'center',
        backgroundColor: '#F5F6F7',
        color: '#08101C',
        borderRadius: '0 0 16px 16px',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {i18n._('Community is for members')}
      </Typography>
      <Typography sx={{ maxWidth: '420px', textWrap: 'balance' }}>
        {i18n._('Paid members can read messages and reply.')}
      </Typography>
      <Button
        size="large"
        color="success"
        variant="contained"
        data-testid="community-paywall-buy"
        data-analytics="buy-access"
        onClick={() => access.showPaymentModal()}
        sx={{
          backgroundColor: 'rgba(25, 178, 91, 0.78)',
          color: '#fff',
          fontWeight: 600,
          boxShadow: 'none',
          borderRadius: '30px',
          minHeight: '48px',
        }}
      >
        {i18n._('Buy access')}
      </Button>
    </Stack>
  );
};

export const CommunityMessagesGate = ({ children }: { children: React.ReactNode }) => {
  const access = useAccess();

  if (access.communityAccessLoading) {
    return <Stack data-testid="community-access-loading" sx={{ minHeight: '220px' }} />;
  }

  if (!access.canReadCommunity) {
    return <CommunityPaywall />;
  }

  return <>{children}</>;
};
