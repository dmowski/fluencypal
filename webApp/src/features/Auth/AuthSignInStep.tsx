'use client';

import { ReactElement, ReactNode } from 'react';
import Google from '@mui/icons-material/Google';
import { Badge, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight, Mail } from 'lucide-react';
import { ColorIconTextList } from '../Survey/ColorIconTextList';
import { ListItem } from '../Survey/IconTextList';

const pillButtonSx = {
  width: '100%',
  minWidth: '200px',
  paddingTop: '12px',
  paddingBottom: '12px',
  borderRadius: '128px',
  textTransform: 'none',
} as const;

const lastUsedBadgeSx = {
  display: 'flex',
  width: '100%',
  '& .MuiBadge-badge': {
    left: 16,
    right: 'auto',
    width: 'max-content',
    top: 0,
    transform: 'translateY(-50%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
} as const;

// An empty MUI badge stays in the DOM as "invisible". On the first paint its
// anchor falls back to the top-right, and the positioning override above turns
// that into a full-width bar. Mount the badge only when it has a label.
const LastUsedBadge = ({
  show,
  label,
  children,
}: {
  show: boolean;
  label: string;
  children: ReactElement;
}) => {
  if (!show) {
    return children;
  }

  return (
    <Badge
      badgeContent={<span data-testid="auth-wall-last-method-badge">{label}</span>}
      color="secondary"
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      sx={lastUsedBadgeSx}
    >
      {children}
    </Badge>
  );
};

export const AuthSignInStep = ({
  title,
  subTitle,
  subComponent,
  reassuranceItems,
  email,
  onEmailChange,
  emailError,
  onSendLink,
  isSendingLink,
  sendDisabled,
  googleTitle,
  onGoogle,
  isGoogleLoading,
  googleError,
  lastUsedMethod,
  privacyHref,
  termsHref,
  hideActions,
  quiet,
}: {
  title: string;
  subTitle?: string;
  subComponent?: ReactNode;
  reassuranceItems: ListItem[];
  email: string;
  onEmailChange: (email: string) => void;
  emailError: string;
  onSendLink: () => void;
  isSendingLink: boolean;
  sendDisabled: boolean;
  googleTitle: string;
  onGoogle: () => void;
  isGoogleLoading: boolean;
  googleError: string;
  lastUsedMethod: 'google' | 'email' | null;
  privacyHref?: string;
  termsHref?: string;
  hideActions: boolean;
  quiet: boolean;
}) => {
  const { i18n } = useLingui();
  const lastUsedLabel = 'Last used';

  return (
    <Stack
      data-testid="auth-sign-in"
      sx={{
        gap: '10px',
        padding: '40px 10px 20px',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 660,
          lineHeight: '1.2',
        }}
      >
        {title}
      </Typography>
      {subTitle ? (
        <Typography
          variant="body1"
          sx={{
            opacity: 0.9,
            paddingTop: '4px',
          }}
        >
          {subTitle}
        </Typography>
      ) : null}

      {subComponent}

      {!hideActions && reassuranceItems.length > 0 ? (
        <Stack sx={{ paddingTop: '16px' }}>
          <ColorIconTextList listItems={reassuranceItems} iconSize="22px" gap="16px" />
        </Stack>
      ) : null}

      {!hideActions ? (
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!isSendingLink && !sendDisabled) {
              onSendLink();
            }
          }}
          sx={{
            width: '100%',
            maxWidth: '420px',
            gap: '14px',
            paddingTop: '22px',
            alignItems: 'stretch',
          }}
        >
          <TextField
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            fullWidth
            label={i18n._('Email')}
            type="email"
            name="email"
            autoComplete="email"
            error={emailError !== ''}
            helperText={emailError || i18n._("We'll email you a sign-in link.")}
            disabled={isSendingLink}
          />

          <LastUsedBadge show={!quiet && lastUsedMethod === 'email'} label={lastUsedLabel}>
            <Button
              type="submit"
              variant={quiet ? 'text' : 'contained'}
              color="primary"
              size="large"
              disabled={sendDisabled || isSendingLink}
              data-analytics="auth-email-send"
              endIcon={quiet ? undefined : <ArrowRight />}
              sx={pillButtonSx}
            >
              {isSendingLink ? i18n._('Sending...') : i18n._('Send link')}
            </Button>
          </LastUsedBadge>

          <Typography
            variant="body2"
            align="center"
            sx={{
              opacity: 0.55,
            }}
          >
            {i18n._('or')}
          </Typography>

          <LastUsedBadge show={!quiet && lastUsedMethod === 'google'} label={lastUsedLabel}>
            <Button
              type="button"
              variant={quiet ? 'text' : 'outlined'}
              color="primary"
              size="large"
              disabled={isGoogleLoading}
              onClick={onGoogle}
              data-analytics="auth-google"
              startIcon={<Google />}
              endIcon={quiet ? undefined : <ArrowRight />}
              sx={pillButtonSx}
            >
              {isGoogleLoading ? i18n._('Signing in...') : googleTitle}
            </Button>
          </LastUsedBadge>

          {googleError ? (
            <Typography color="error" variant="body2">
              {googleError}
            </Typography>
          ) : null}

          {privacyHref && termsHref ? (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.72,
                paddingTop: '6px',
                lineHeight: 1.5,
              }}
            >
              {[
                i18n._('By continuing, you agree to the'),
                ' ',
                <Link key="privacy" href={privacyHref} target="_blank" rel="noopener noreferrer">
                  {i18n._('Privacy Policy')}
                </Link>,
                ' ',
                i18n._('and'),
                ' ',
                <Link key="terms" href={termsHref} target="_blank" rel="noopener noreferrer">
                  {i18n._('Terms of Use')}
                </Link>,
                '.',
              ]}
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};

export const AuthEmailSentStep = ({
  email,
  onSendAgain,
}: {
  email: string;
  onSendAgain: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid="auth-email-sent"
      sx={{
        gap: '10px',
        padding: '40px 10px 28px',
        maxWidth: '460px',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 660,
          lineHeight: 1.2,
        }}
      >
        {i18n._('Check your email')}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          opacity: 0.9,
          paddingTop: '8px',
        }}
      >
        {i18n._(
          'We sent a sign-in link to your email. Please check your inbox and click the link to sign in.',
        )}
      </Typography>
      <Typography sx={{ paddingTop: '8px', fontWeight: 660 }}>{email}</Typography>
      <Typography sx={{ opacity: 0.8 }}>
        {i18n._("Check your spam folder if you don't see the email.")}
      </Typography>
      <Button
        type="button"
        variant="contained"
        color="primary"
        size="large"
        onClick={onSendAgain}
        endIcon={<Mail />}
        sx={{
          ...pillButtonSx,
          width: 'max-content',
          marginTop: '16px',
        }}
      >
        {i18n._('Send email again')}
      </Button>
    </Stack>
  );
};
