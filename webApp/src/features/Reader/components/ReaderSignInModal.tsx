'use client';
import { useState } from 'react';
import {
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Google from '@mui/icons-material/Google';
import { Mail } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional reason shown before the sign-in buttons (e.g. "To open PDF files, please sign in.") */
  message?: string;
  'data-testid'?: string;
}

export const ReaderSignInModal = ({ open, onClose, message, 'data-testid': testId }: Props) => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [googleSignInError, setGoogleSignInError] = useState('');
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleSignInError('');
    setIsGoogleSignInLoading(true);
    const result = await auth.signInWithGoogle();
    setIsGoogleSignInLoading(false);
    if (result.isDone) {
      onClose();
    } else if (result.error) {
      setGoogleSignInError(result.error);
    }
  };

  const handleEmailSignIn = async () => {
    setIsEmailLoading(true);
    setEmailError('');
    const result = await auth.signInWithEmail(email);
    setIsEmailLoading(false);
    if (result.isDone) {
      setEmailSent(true);
    } else {
      setEmailError(result.error || i18n._('Something went wrong. Please try again.'));
    }
  };

  const handleLogout = async () => {
    await auth.logout();
    onClose();
  };

  const handleClose = () => {
    setEmailMode(false);
    setEmail('');
    setEmailSent(false);
    setEmailError('');
    onClose();
  };

  const renderContent = () => {
    if (auth.loading) {
      return (
        <Stack alignItems="center" padding="24px">
          <CircularProgress size={32} />
        </Stack>
      );
    }

    if (auth.isAuthorized) {
      return (
        <Stack gap="26px" alignItems="center" padding="8px">
          <Stack alignItems="center">
            <Avatar
              src={auth.userInfo?.photoURL || ''}
              alt={auth.userInfo?.displayName || ''}
              sx={{ width: 64, height: 64 }}
            />

            <Typography variant="h6" sx={{ marginTop: '8px' }}>
              {auth.userInfo?.displayName || auth.userInfo?.email}
            </Typography>
            {auth.userInfo?.displayName && auth.userInfo?.email && (
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                {auth.userInfo.email}
              </Typography>
            )}
          </Stack>
          <Button variant="outlined" onClick={() => void handleLogout()}>
            {i18n._('Logout')}
          </Button>
        </Stack>
      );
    }

    if (emailSent) {
      return (
        <Stack gap="12px" padding="8px">
          <Typography variant="h6">{i18n._('Check your email')}</Typography>
          <Typography>
            {i18n._('We sent a sign-in link to')} <b>{email}</b>
          </Typography>
          <Typography variant="caption">
            {i18n._("Check your spam folder if you don't see the email.")}
          </Typography>
        </Stack>
      );
    }

    if (emailMode) {
      return (
        <Stack gap="16px" padding="8px">
          <Typography variant="h6">{i18n._('Sign in with email')}</Typography>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            label={i18n._('Email')}
            type="email"
            error={emailError !== ''}
            helperText={emailError}
          />
          <Button
            variant="contained"
            startIcon={<Mail size={18} />}
            disabled={isEmailLoading || email.trim() === ''}
            onClick={() => void handleEmailSignIn()}
          >
            {isEmailLoading ? i18n._('Sending...') : i18n._('Send sign-in link')}
          </Button>
          <Button variant="text" onClick={() => setEmailMode(false)}>
            {i18n._('Back')}
          </Button>
        </Stack>
      );
    }

    return (
      <Stack gap="16px" padding="8px">
        <Typography variant="h6">{i18n._('Sign In')}</Typography>
        {message && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {message}
          </Typography>
        )}
        {googleSignInError && (
          <Typography variant="body2" color="error">
            {googleSignInError}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<Google />}
          disabled={isGoogleSignInLoading}
          onClick={() => void handleGoogleSignIn()}
        >
          {isGoogleSignInLoading ? i18n._('Signing in...') : i18n._('Sign in with Google')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Mail size={18} />}
          onClick={() => setEmailMode(true)}
        >
          {i18n._('Sign in with email')}
        </Button>
      </Stack>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth data-testid={testId}>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
};
