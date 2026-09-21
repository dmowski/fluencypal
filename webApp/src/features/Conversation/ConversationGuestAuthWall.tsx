'use client';

import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AuthWall } from '@/features/Auth/AuthWall';

export const CONVERSATION_GUEST_AUTH_TEST_ID = 'conversation-guest-auth';

export const ConversationGuestAuthWall = () => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid={CONVERSATION_GUEST_AUTH_TEST_ID}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'auto',
        backgroundColor: 'rgba(10, 18, 30, 0.94)',
        padding: '24px 12px 40px',
      }}
    >
      <AuthWall
        startOnAuth
        signInTitle={i18n._('Sign in to unlock more features')}
        singInSubTitle={i18n._(
          'Personalized plan, community, daily questions, grammar rules, and much more.',
        )}
        authActionTitle={i18n._('Continue to talk')}
        authListAfterActions
      >
        <></>
      </AuthWall>
    </Stack>
  );
};
