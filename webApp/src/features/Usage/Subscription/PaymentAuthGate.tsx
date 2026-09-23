'use client';

import { ReactNode } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AuthWall } from '@/features/Auth/AuthWall';

export const PAYMENT_AUTH_GATE_TEST_ID = 'payment-auth-gate';

export const PaymentAuthGate = ({ children }: { children: ReactNode }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid={PAYMENT_AUTH_GATE_TEST_ID}
      sx={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <AuthWall
        startOnAuth
        signInTitle={i18n._('Sign in to subscribe')}
        singInSubTitle={i18n._('So we can save your purchase to your account')}
        authListAfterActions
      >
        {children}
      </AuthWall>
    </Stack>
  );
};
