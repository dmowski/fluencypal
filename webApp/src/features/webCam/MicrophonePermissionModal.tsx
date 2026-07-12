'use client';

import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { Mic, ShieldCheck } from 'lucide-react';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  isRequesting: boolean;
  wasDenied: boolean;
  onGrant: () => void;
  onClose: () => void;
}

export const MicrophonePermissionModal = ({
  isOpen,
  isRequesting,
  wasDenied,
  onGrant,
  onClose,
}: MicrophonePermissionModalProps) => {
  const { i18n } = useLingui();

  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      mobilePadding="24px 16px"
      desktopPadding="40px 24px"
      zIndex={1100}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '520px',
          gap: '28px',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Stack
          sx={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(46, 193, 233, 1) 0%, rgba(0, 166, 255, 1) 100%)',
            boxShadow: '0 12px 40px rgba(0, 166, 255, 0.35)',
          }}
        >
          <Mic size={44} color="#fff" strokeWidth={2.2} />
        </Stack>

        <Stack sx={{ gap: '12px' }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {i18n._('Microphone access needed')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.78)',
              lineHeight: 1.6,
            }}
          >
            {i18n._(
              'FluencyPal needs your microphone so you can speak with the AI. Your voice stays in your browser — we only use it for your practice session.',
            )}
          </Typography>
        </Stack>

        <Stack
          sx={{
            width: '100%',
            gap: '12px',
            padding: '16px 18px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'left',
          }}
        >
          <Stack sx={{ flexDirection: 'row', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck size={20} color="rgba(46, 193, 233, 1)" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              {i18n._(
                'When you tap the button below, your browser will ask for permission. Choose "Allow" so the conversation can start.',
              )}
            </Typography>
          </Stack>
        </Stack>

        {wasDenied && (
          <Stack
            sx={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 67, 54, 0.12)',
              border: '1px solid rgba(244, 67, 54, 0.35)',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ color: '#ff8a80', lineHeight: 1.5 }}>
              {i18n._(
                'Microphone access was blocked. Open your browser settings, allow microphone access for this site, then tap "Grant microphone permission" again.',
              )}
            </Typography>
          </Stack>
        )}

        <Stack
          sx={{
            width: '100%',
            gap: '12px',
          }}
        >
          <Button
            variant="contained"
            color="info"
            size="large"
            fullWidth
            disabled={isRequesting}
            startIcon={isRequesting ? <CircularProgress size={18} color="inherit" /> : <Mic size={18} />}
            onClick={onGrant}
            sx={{
              padding: '14px 20px',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {isRequesting
              ? i18n._('Requesting access...')
              : i18n._('Grant microphone permission')}
          </Button>
          <Button variant="text" color="inherit" onClick={onClose} disabled={isRequesting}>
            {i18n._('Not now')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
