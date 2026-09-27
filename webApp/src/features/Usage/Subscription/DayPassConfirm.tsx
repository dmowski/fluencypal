'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { AuthWall } from '@/features/Auth/AuthWall';
import { ConfirmPaymentForm } from '../HoursPaymentModal/ConfirmPaymentForm';

export const DAY_PASS_CONFIRM_TEST_ID = 'day-pass-confirm';

export type DayPassConfirmLesson = {
  title: string;
  details: string;
};

export const DayPassConfirm = ({
  lesson,
  accessLine,
  amountInUsd,
  isIdentified,
  isAuthLoading = false,
  isRedirecting,
  onConfirm,
}: {
  lesson: DayPassConfirmLesson;
  accessLine: string;
  amountInUsd: number;
  isIdentified: boolean;
  isAuthLoading?: boolean;
  isRedirecting: boolean;
  onConfirm: () => void;
}) => {
  const { i18n } = useLingui();

  if (!isIdentified) {
    return (
      <Stack
        data-testid={DAY_PASS_CONFIRM_TEST_ID}
        sx={{
          width: '100%',
          alignItems: 'center',
          paddingTop: '30px',
        }}
      >
        {isAuthLoading ? null : (
          <AuthWall
            startOnAuth
            signInTitle={i18n._('Sign in to continue this lesson')}
            singInSubTitle={i18n._('So we can save your purchase to your account')}
            authListAfterActions
          >
            {null}
          </AuthWall>
        )}
      </Stack>
    );
  }

  return (
    <Stack
      data-testid={DAY_PASS_CONFIRM_TEST_ID}
      sx={{
        maxWidth: '700px',
        width: '100%',
        boxSizing: 'border-box',
        gap: '24px',
        alignItems: 'center',
        paddingTop: '30px',
      }}
    >
      <Stack sx={{ width: '100%', gap: '8px' }}>
        <Typography sx={{ width: '100%', fontWeight: 800 }} variant="h3" component="h2">
          {lesson.title}
        </Typography>
        {lesson.details ? (
          <Typography sx={{ width: '100%', fontSize: '22px' }}>{lesson.details}</Typography>
        ) : null}
        <Typography sx={{ width: '100%', fontSize: '18px' }}>{accessLine}</Typography>
      </Stack>

      <ConfirmPaymentForm
        amountInUsd={amountInUsd}
        isRedirecting={isRedirecting}
        onConfirmRequest={onConfirm}
      />
    </Stack>
  );
};
