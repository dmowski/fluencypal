'use client';

import { useLingui } from '@lingui/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

interface VoiceChatRulesDialogProps {
  open: boolean;
  onClose: () => void;
}

export const VoiceChatRulesDialog = ({ open, onClose }: VoiceChatRulesDialogProps) => {
  const { i18n } = useLingui();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 600 }}>{i18n._('Rules of chat')}</DialogTitle>
      <DialogContent>
        <Stack gap={1.25}>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {i18n._('Be kind. This is a small voice-only space.')}
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {i18n._('No text messages and no transcripts.')}
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {i18n._('Messages are removed after 4 days.')}
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {i18n._('You can remove your own messages anytime.')}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{i18n._('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
