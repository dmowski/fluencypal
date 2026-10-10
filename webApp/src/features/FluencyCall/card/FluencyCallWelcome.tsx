'use client';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { ChevronRight, Play } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { MutedPreviewVideo } from '@/features/uiKit/Video/MutedPreviewVideo';
import { token } from './styles';

export const FluencyCallWelcomeButton = ({
  welcomeVideoSrc,
  onOpen,
}: {
  welcomeVideoSrc: string | null;
  onOpen: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <ButtonBase
      data-testid="fluency-call-welcome"
      onClick={onOpen}
      sx={{
        margin: '23px 0 25px',
        padding: '13px 16px',
        backgroundColor: token.soft,
        borderRadius: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        width: '100%',
        color: token.text,
        textAlign: 'left',
        '&:hover': { backgroundColor: '#292c38' },
      }}
    >
      {welcomeVideoSrc ? (
        <Box
          sx={{
            width: 68,
            height: 68,
            flexShrink: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#041018',
            border: '1px solid rgba(125, 222, 170, 0.28)',
          }}
        >
          <video
            src={welcomeVideoSrc}
            data-testid="fluency-call-welcome-preview"
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              pointerEvents: 'none',
              backgroundColor: '#041018',
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: token.bg,
            border: '1px solid rgba(255,255,255, 0.81)',
            color: 'rgba(255,255,255, 0.81)',
          }}
        >
          <Play size={17} />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="strong" sx={{ color: token.text, fontWeight: 650 }}>
          {i18n._('First time? Meet your host')}
        </Typography>
        <Typography sx={{ color: token.muted, fontSize: '13px' }}>
          {i18n._('A short hello from Alex · What to expect')}
        </Typography>
      </Box>
      <ChevronRight size={18} color={token.muted} />
    </ButtonBase>
  );
};

export const FluencyCallWelcomeModal = ({
  open,
  welcomeVideoSrc,
  onClose,
}: {
  open: boolean;
  welcomeVideoSrc: string | null;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      zIndex={1400}
      backgroundColor={token.bg}
      data-testid="fluency-call-welcome-modal"
    >
      <Stack sx={{ width: '100%', maxWidth: '600px', gap: '20px' }}>
        {welcomeVideoSrc ? (
          <Stack sx={{ alignItems: 'center', width: '100%' }}>
            <MutedPreviewVideo src={welcomeVideoSrc} />
          </Stack>
        ) : null}
        <ModalHeader
          title={i18n._('A hello from Alex')}
          subtitle={i18n._(
            "We'll say hello and start with something simple, like how your week is going. Take your time — we're all here to practise.",
          )}
        />
      </Stack>
    </CustomModal>
  );
};
