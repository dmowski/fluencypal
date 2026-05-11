'use client';

import { useState, useRef } from 'react';
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
import { Crown, Trash2, X } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { Book } from '../model/types';
import { findUserByEmail } from '../api/sharingRequests';

interface Props {
  book: Book;
  open: boolean;
  onClose: () => void;
  currentUserUid: string;
  currentUserEmail: string | null;
  getToken: () => Promise<string>;
  onShare: (userId: string, email: string) => void;
  onRemoveUser: (userId: string) => void;
  /** If provided, owner sees a "Make owner" button per collaborator. */
  onReassignOwner?: (userId: string) => void;
}

type ShareStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; email: string }
  | { kind: 'error'; message: string };

export const ShareBookModal = ({
  book,
  open,
  onClose,
  currentUserUid,
  currentUserEmail,
  getToken,
  onShare,
  onRemoveUser,
  onReassignOwner,
}: Props) => {
  const i18n = useLingui();
  const [emailInput, setEmailInput] = useState('');
  const [status, setStatus] = useState<ShareStatus>({ kind: 'idle' });
  const inputRef = useRef<HTMLInputElement>(null);

  const isOwner = book.ownerUserId === currentUserUid;

  const ownerEmail =
    book.ownerUserId === currentUserUid
      ? (currentUserEmail ?? book.memberEmails?.[book.ownerUserId ?? ''] ?? '')
      : (book.memberEmails?.[book.ownerUserId ?? ''] ?? '');

  const handleClose = () => {
    setEmailInput('');
    setStatus({ kind: 'idle' });
    onClose();
  };

  const handleShare = async () => {
    const email = emailInput.toLowerCase().trim();
    if (!email) return;

    if (email === currentUserEmail?.toLowerCase()) {
      setStatus({ kind: 'error', message: i18n._('You are already the owner of this book.') });
      return;
    }

    const alreadySharedEmail = Object.values(book.memberEmails ?? {}).find(
      (e) => e.toLowerCase() === email,
    );
    if (alreadySharedEmail) {
      setStatus({
        kind: 'error',
        message: i18n._('This book is already shared with that user.'),
      });
      return;
    }

    setStatus({ kind: 'loading' });
    try {
      const result = await findUserByEmail(email, getToken);
      if (!result) {
        setStatus({
          kind: 'error',
          message: i18n._(
            'No account found for that email. Ask them to sign up first, then try again.',
          ),
        });
        return;
      }

      onShare(result.uid, email);
      setEmailInput('');
      setStatus({ kind: 'success', email });
    } catch {
      setStatus({
        kind: 'error',
        message: i18n._('Something went wrong. Please try again.'),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleShare();
  };

  const sharedUsers = (book.userIds ?? []).map((uid) => ({
    uid,
    email: book.memberEmails?.[uid] ?? uid,
  }));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      data-testid="share-book-modal"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{i18n._('Share book')}</Typography>
        <IconButton aria-label="Close share modal" size="small" onClick={handleClose}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack gap="16px">
          {/* Members list */}
          <Stack gap="8px">
            {/* Owner row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: '4px' }}
              data-testid="share-modal-owner-row"
            >
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {ownerEmail || book.ownerUserId || i18n._('Unknown owner')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  px: '6px',
                  py: '2px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {i18n._('Owner')}
              </Typography>
            </Stack>

            {/* Shared users */}
            {sharedUsers.map(({ uid, email }) => (
              <Stack
                key={uid}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: '4px' }}
                data-testid={`share-modal-member-${uid}`}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
                  {email}
                </Typography>
                {isOwner && (
                  <Stack direction="row" gap="4px" sx={{ ml: 1, flexShrink: 0 }}>
                    {onReassignOwner && (
                      <IconButton
                        size="small"
                        aria-label={`Make ${email} owner`}
                        data-testid={`share-modal-make-owner-${uid}`}
                        onClick={() => onReassignOwner(uid)}
                        title={i18n._('Make owner')}
                      >
                        <Crown size={14} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      aria-label={`Remove ${email}`}
                      data-testid={`share-modal-remove-${uid}`}
                      onClick={() => onRemoveUser(uid)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>

          {/* Add new member — only owner can share */}
          {isOwner && (
            <Stack gap="8px" sx={{ pt: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {i18n._('Share with someone by email')}
              </Typography>

              <Stack direction="row" gap="8px">
                <TextField
                  inputRef={inputRef}
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (status.kind !== 'idle') setStatus({ kind: 'idle' });
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={i18n._('Email address')}
                  size="small"
                  fullWidth
                  disabled={status.kind === 'loading'}
                  inputProps={{ 'data-testid': 'share-email-input' }}
                />
                <Button
                  variant="contained"
                  disabled={!emailInput.trim() || status.kind === 'loading'}
                  onClick={() => void handleShare()}
                  data-testid="share-email-submit"
                  sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {status.kind === 'loading' ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    i18n._('Share')
                  )}
                </Button>
              </Stack>

              {status.kind === 'success' && (
                <Typography
                  variant="caption"
                  color="success.main"
                  data-testid="share-success-message"
                >
                  {i18n._('Book shared with')} {status.email}
                </Typography>
              )}
              {status.kind === 'error' && (
                <Typography variant="caption" color="error" data-testid="share-error-message">
                  {status.message}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
