'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';

export const VoiceReportDialog = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
}) => {
  const { i18n } = useLingui();
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  return (
    <CustomModal
      isOpen
      onClose={() => {
        setNote('');
        setSent(false);
        onClose();
      }}
      zIndex={1500}
      data-testid="voice-report"
    >
      <Stack sx={{ width: '100%', maxWidth: 420, gap: '12px' }}>
        {sent ? (
          <Typography>{i18n._('Thanks. We will look at this.')}</Typography>
        ) : (
          <>
            <Typography sx={{ fontWeight: 750 }}>{i18n._('Report')}</Typography>
            <Typography sx={{ opacity: 0.75 }}>
              {i18n._('Tell us what is wrong. You can leave this empty.')}
            </Typography>
            <TextField
              value={note}
              multiline
              minRows={3}
              onChange={(event) => setNote(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            <Button
              variant="contained"
              color="info"
              disabled={sending}
              onClick={() => {
                setSending(true);
                void onSubmit(note.trim())
                  .then(() => setSent(true))
                  .catch(() => {})
                  .finally(() => setSending(false));
              }}
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              {sending ? i18n._('Sending...') : i18n._('Send report')}
            </Button>
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
