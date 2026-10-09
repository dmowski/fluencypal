'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SignInResult } from './googleSignIn';
import { normalizeEmail } from './normalizeEmail';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const EmailLinkConfirmForm = ({
  onConfirm,
}: {
  onConfirm: (email: string) => Promise<SignInResult>;
}) => {
  const { i18n } = useLingui();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError(i18n._('Please enter a valid email address'));
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await onConfirm(normalized);
    setIsSubmitting(false);
    if (result.isDone) return;
    setError(
      result.error === 'mismatch'
        ? i18n._('That email does not match this link, or the link has expired.')
        : i18n._('Failed to sign in with the email link. Please try again.'),
    );
  };

  return (
    <Stack
      component="form"
      data-testid="email-link-confirm"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'rgba(10, 18, 30, 0.94)',
      }}
    >
      <Stack sx={{ width: '100%', maxWidth: '460px', gap: '16px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {i18n._('Confirm your email')}
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>
          {i18n._('Enter the email you used to request this sign-in link.')}
        </Typography>
        <TextField
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
          }}
          required
          fullWidth
          type="email"
          name="email"
          autoComplete="email"
          label={i18n._('Email')}
          disabled={isSubmitting}
          slotProps={{ htmlInput: { 'data-testid': 'email-link-confirm-email' } }}
        />
        {error ? <Typography color="error">{error}</Typography> : null}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          data-testid="email-link-confirm-submit"
          sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
        >
          {isSubmitting ? i18n._('Signing in...') : i18n._('Sign in')}
        </Button>
      </Stack>
    </Stack>
  );
};
