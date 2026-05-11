'use client';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { Book } from '../model/types';

export type DeleteBookModalMode =
  /** Shared book, current user is a collaborator (not owner). */
  | 'leave'
  /** Shared book, current user is the owner. */
  | 'owner-shared';

interface Props {
  book: Book;
  mode: DeleteBookModalMode;
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  /** Owner only: remove the book for everyone. */
  onDeleteForAll: () => void;
  /** Non-owner: remove self from the book. */
  onLeave: () => void;
  /** Owner: open the sharing settings to re-assign ownership. */
  onOpenSharingSettings: () => void;
}

export const DeleteBookModal = ({
  book,
  mode,
  open,
  isLoading = false,
  onClose,
  onDeleteForAll,
  onLeave,
  onOpenSharingSettings,
}: Props) => {
  const i18n = useLingui();

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      data-testid="delete-book-modal"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          {mode === 'leave' ? i18n._('Leave shared book') : i18n._('Delete shared book')}
        </Typography>
        {!isLoading && (
          <IconButton aria-label="Close" size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent>
        {mode === 'leave' ? (
          <Stack gap="20px">
            <Typography variant="body2">
              {i18n._(
                'This book is shared. Removing it will only remove you from the list — the book will remain for other members.',
              )}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {book.title}
            </Typography>
            <Stack direction="row" gap="12px" justifyContent="flex-end">
              <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                {i18n._('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={onLeave}
                disabled={isLoading}
                data-testid="delete-modal-leave-btn"
              >
                {isLoading ? <CircularProgress size={18} color="inherit" /> : i18n._('Leave book')}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack gap="20px">
            <Typography variant="body2">
              {i18n._(
                'This book is shared with other users. Deleting it will permanently remove it for everyone.',
              )}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {book.title}
            </Typography>
            <Stack gap="8px">
              <Button
                variant="contained"
                color="error"
                onClick={onDeleteForAll}
                disabled={isLoading}
                fullWidth
                data-testid="delete-modal-delete-for-all-btn"
              >
                {isLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  i18n._('Delete for all')
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={onOpenSharingSettings}
                disabled={isLoading}
                fullWidth
                data-testid="delete-modal-open-sharing-btn"
              >
                {i18n._('Open sharing settings')}
              </Button>
              <Button variant="text" onClick={onClose} disabled={isLoading} fullWidth>
                {i18n._('Cancel')}
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
