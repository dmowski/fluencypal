'use client';

import { useLingui } from '@lingui/react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useState, type ReactNode } from 'react';
import { voiceChatUi } from '../voiceChatUi';

export const VoiceChatChecklistRow = ({
  title,
  info,
  done,
  action,
}: {
  title: string;
  info: string;
  done: boolean;
  action?: ReactNode;
}) => {
  const { i18n } = useLingui();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={1.25}
        sx={{
          py: 1,
          borderBottom: `1px solid ${voiceChatUi.borderSubtle}`,
          '&:last-of-type': { borderBottom: 'none' },
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 20,
            height: 20,
            mt: 0.15,
            borderRadius: '50%',
            flexShrink: 0,
            border: '1.5px solid',
            borderColor: done ? voiceChatUi.success : voiceChatUi.borderSubtle,
            bgcolor: done ? 'rgba(72,187,120,0.12)' : 'transparent',
            color: done ? voiceChatUi.success : voiceChatUi.textMuted,
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {done ? '✓' : ''}
        </Stack>

        <Stack flex={1} gap={0.75} minWidth={0}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: done ? voiceChatUi.textMuted : 'inherit',
              textDecoration: done ? 'line-through' : 'none',
              textDecorationColor: voiceChatUi.textMuted,
            }}
          >
            {title}
          </Typography>
          {action}
        </Stack>

        <IconButton
          size="small"
          onClick={() => setOpen(true)}
          aria-label={i18n._('Info')}
          sx={{ mt: -0.25, color: voiceChatUi.textMuted }}
        >
          <InfoOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: voiceChatUi.textSecondary, lineHeight: 1.6 }}>
            {info}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{i18n._('Close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
