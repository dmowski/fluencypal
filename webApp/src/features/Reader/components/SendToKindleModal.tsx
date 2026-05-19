'use client';

import { useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { Book } from '../model/types';
import { sendToKindleRequest } from '../api/sendToKindleRequest';

const KINDLE_FROM_EMAIL = 'contact@fluencypal.com';
const KINDLE_EMAIL_KEY = 'kindle_email';
const KINDLE_INSTRUCTIONS_SEEN_KEY = 'kindle_instructions_seen';

const readStoredKindleEmail = (): string => {
  try {
    return localStorage.getItem(KINDLE_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
};

const writeStoredKindleEmail = (email: string): void => {
  try {
    localStorage.setItem(KINDLE_EMAIL_KEY, email);
  } catch {
    // ignore
  }
};

const hasSeenInstructions = (): boolean => {
  try {
    return localStorage.getItem(KINDLE_INSTRUCTIONS_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

const markInstructionsSeen = (): void => {
  try {
    localStorage.setItem(KINDLE_INSTRUCTIONS_SEEN_KEY, 'true');
  } catch {
    // ignore
  }
};

interface Props {
  book: Book;
  open: boolean;
  onClose: () => void;
  getToken: () => Promise<string>;
}

type Step = 'instructions' | 'email';
type SendStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

export const SendToKindleModal = ({ book, open, onClose, getToken }: Props) => {
  const i18n = useLingui();
  const [step, setStep] = useState<Step>(() => (hasSeenInstructions() ? 'email' : 'instructions'));
  const [kindleEmail, setKindleEmail] = useState<string>(() => readStoredKindleEmail());
  const [status, setStatus] = useState<SendStatus>({ kind: 'idle' });

  const handleClose = () => {
    setStatus({ kind: 'idle' });
    onClose();
  };

  const handleProceedToEmail = () => {
    markInstructionsSeen();
    setStep('email');
  };

  const handleSend = async () => {
    const email = kindleEmail.trim().toLowerCase();
    if (!email) return;

    setStatus({ kind: 'loading' });
    writeStoredKindleEmail(email);

    try {
      await sendToKindleRequest({ bookId: book.id, kindleEmail: email, getToken });
      setStatus({ kind: 'success' });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : i18n._('Failed to send to Kindle'),
      });
    }
  };

  const isLoading = status.kind === 'loading';

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="send-to-kindle-modal"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {i18n._('Send to Kindle')}
          <IconButton
            size="small"
            onClick={handleClose}
            disabled={isLoading}
            aria-label={i18n._('Close')}
          >
            <X size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {step === 'instructions' ? (
          <Stack gap="16px">
            <Typography variant="body2">
              {i18n._(
                'To receive books on your Kindle, you must first add our sender email to your approved list.',
              )}
            </Typography>

            <Stack gap="8px">
              <Typography variant="body2" fontWeight={600}>
                {i18n._('Steps:')}
              </Typography>
              <Typography variant="body2" component="div">
                <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                  <li>
                    {i18n._('Go to')}{' '}
                    <Typography
                      component="a"
                      variant="body2"
                      href="https://www.amazon.com/hz/mycd/myx#/home/settings/pdoc"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: 'primary.main' }}
                    >
                      amazon.com → Account → Manage Your Content and Devices → Preferences
                    </Typography>
                  </li>
                  <li>
                    {i18n._(
                      'Find "Personal Document Settings" → "Approved Personal Document Email List"',
                    )}
                  </li>
                  <li>
                    {i18n._('Click "Add a new approved e-mail address" and enter:')}{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        backgroundColor: 'action.hover',
                        px: '4px',
                        borderRadius: '4px',
                      }}
                    >
                      {KINDLE_FROM_EMAIL}
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </Stack>

            <Button
              variant="contained"
              onClick={handleProceedToEmail}
              data-testid="kindle-instructions-done-btn"
              sx={{ alignSelf: 'flex-start' }}
            >
              {i18n._("I've done this — continue")}
            </Button>
          </Stack>
        ) : status.kind === 'success' ? (
          <Stack gap="16px">
            <Typography variant="body2">
              {i18n._('Book sent! It should appear on your Kindle within a few minutes.')}
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              data-testid="kindle-success-close-btn"
              sx={{ alignSelf: 'flex-start' }}
            >
              {i18n._('Close')}
            </Button>
          </Stack>
        ) : (
          <Stack gap="16px">
            <Typography variant="body2">
              {i18n._(
                'Enter your Kindle email address. The book will be sent as an EPUB attachment.',
              )}
            </Typography>

            <TextField
              label={i18n._('Kindle email')}
              placeholder="yourname@kindle.com"
              value={kindleEmail}
              onChange={(e) => {
                setKindleEmail(e.target.value);
                if (status.kind === 'error') setStatus({ kind: 'idle' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) void handleSend();
              }}
              disabled={isLoading}
              fullWidth
              size="small"
              inputProps={{ 'data-testid': 'kindle-email-input' }}
            />

            {status.kind === 'error' && (
              <Typography variant="caption" color="error" data-testid="kindle-send-error">
                {status.message}
              </Typography>
            )}

            <Stack direction="row" gap="8px">
              <Button
                variant="contained"
                onClick={() => void handleSend()}
                disabled={isLoading || !kindleEmail.trim()}
                data-testid="kindle-send-btn"
                startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : null}
              >
                {i18n._('Send to Kindle')}
              </Button>
              <Button variant="text" onClick={handleClose} disabled={isLoading}>
                {i18n._('Cancel')}
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
