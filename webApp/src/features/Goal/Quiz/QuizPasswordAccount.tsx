'use client';

import { useRef, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '@/features/Survey/InfoStep';
import { getLandingUrlStart } from '@/features/Lang/getUrlStart';
import { useAuth } from '@/features/Auth/useAuth';
import { normalizeEmail } from '@/features/Auth/normalizeEmail';
import { QuizPasswordErrorCode, QuizPasswordMode } from '@/features/Auth/quizPasswordAccount';

export const QuizPasswordAccountForm = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const messageForCode = (code: QuizPasswordErrorCode): string => {
    switch (code) {
      case 'invalid-email':
        return i18n._('Please enter a valid email address');
      case 'weak-password':
        return i18n._('Use at least 6 characters.');
      case 'wrong-password':
        return i18n._('Wrong email or password.');
      case 'too-many-requests':
        return i18n._('Too many attempts. Wait a moment and try again.');
      case 'network':
        return i18n._('Network error. Check your connection and try again.');
      case 'unavailable':
        return i18n._('Password sign-in is not available right now.');
      case 'save-failed':
        return i18n._('Could not save your quiz on this account. Please try again.');
      case 'no-session':
        return i18n._('Could not start your account. Please try again.');
      default:
        return i18n._('Could not create the account. Please try again.');
    }
  };
  const [mode, setMode] = useState<QuizPasswordMode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const isCreate = mode === 'create';

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormError('');
    setResetNotice('');
    setIsSubmitting(true);
    const result = await auth.submitQuizPassword(email, password, mode);
    submittingRef.current = false;
    setIsSubmitting(false);
    if (result.status === 'email-taken') {
      setMode('signIn');
      setFormError(i18n._('This email already has an account. Sign in with its password.'));
      return;
    }
    if (result.status === 'error') {
      setFormError(messageForCode(result.code));
    }
  };

  const sendReset = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormError('');
    setResetNotice('');
    setIsSubmitting(true);
    const result = await auth.sendQuizPasswordReset(email);
    submittingRef.current = false;
    setIsSubmitting(false);
    if (result.status === 'sent') {
      setResetNotice(i18n._('We sent a password reset link. Check your inbox.'));
      return;
    }
    setFormError(messageForCode(result.code));
  };

  return (
    <InfoStep
      title={isCreate ? i18n._('Create account') : i18n._('Sign in')}
      subTitle={
        isCreate
          ? i18n._('Email and password. Your practice stays on this account.')
          : i18n._('Use the email and password for your account.')
      }
      actionButtonTitle={
        isSubmitting
          ? isCreate
            ? i18n._('Creating account...')
            : i18n._('Signing in...')
          : isCreate
            ? i18n._('Create account')
            : i18n._('Sign in')
      }
      actionButtonAnalyticsId={isCreate ? 'quiz-create-account' : 'quiz-password-sign-in'}
      onClick={() => void submit()}
      disabled={isSubmitting}
      isStepLoading={isSubmitting}
      secondButtonTitle={
        isCreate ? i18n._('I already have an account') : i18n._('Create a new account')
      }
      secondButtonAnalyticsId={isCreate ? 'quiz-account-sign-in' : 'quiz-account-create'}
      secondButtonDisabled={isSubmitting}
      onSecondButtonClick={() => {
        setMode(isCreate ? 'signIn' : 'create');
        setFormError('');
        setResetNotice('');
      }}
      listItemsAfterActions
      listItems={[
        {
          title: i18n._('Privacy Policy'),
          iconName: 'scroll-text',
          href: `${getLandingUrlStart('en')}privacy`,
        },
        {
          title: i18n._('Terms of Use'),
          iconName: 'pencil-ruler',
          href: `${getLandingUrlStart('en')}terms`,
        },
      ]}
      subComponent={
        <Stack sx={{ paddingTop: '12px', gap: '12px' }}>
          <TextField
            value={email}
            onChange={(event) => {
              setEmail(normalizeEmail(event.target.value));
              setFormError('');
            }}
            fullWidth
            label={i18n._('Email')}
            type="email"
            autoComplete="email"
            name="email"
            disabled={isSubmitting}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit();
            }}
          />
          <TextField
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFormError('');
            }}
            fullWidth
            label={i18n._('Password')}
            type="password"
            autoComplete={isCreate ? 'new-password' : 'current-password'}
            name="password"
            disabled={isSubmitting}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit();
            }}
          />
          {formError ? <Typography color="error">{formError}</Typography> : null}
          {resetNotice ? <Typography>{resetNotice}</Typography> : null}
          {mode === 'signIn' ? (
            <Button
              variant="text"
              disabled={isSubmitting}
              onClick={() => void sendReset()}
              data-analytics="quiz-password-reset"
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              {i18n._('Forgot password?')}
            </Button>
          ) : null}
        </Stack>
      }
    />
  );
};
