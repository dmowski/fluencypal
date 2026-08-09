'use client';

import { useLingui } from '@lingui/react';
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Check, Mic, Send, Settings, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isMicrophoneGranted, listAudioInputDevices, type AudioInputDevice } from '@/libs/mic';
import { useVoiceChatRecorder } from '../useVoiceChatRecorder';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatPlayer } from './VoiceChatPlayer';

interface VoiceChatRecorderPanelProps {
  title: string;
  submitLabel: string;
  minSeconds?: number;
  onSubmit: (blob: Blob, durationSec: number) => Promise<void>;
  onCancel?: () => void;
}

export const VoiceChatRecorderPanel = ({
  title,
  submitLabel,
  minSeconds = 1,
  onSubmit,
  onCancel,
}: VoiceChatRecorderPanelProps) => {
  const { i18n } = useLingui();
  const recorder = useVoiceChatRecorder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [microphones, setMicrophones] = useState<AudioInputDevice[]>([]);
  const [isLoadingMicrophones, setIsLoadingMicrophones] = useState(false);
  const previewUrl = useMemo(() => {
    if (!recorder.recordedBlob) return null;
    return URL.createObjectURL(recorder.recordedBlob);
  }, [recorder.recordedBlob]);

  const closeSettings = () => setSettingsAnchor(null);

  const openSettings = async (anchor: HTMLElement) => {
    setSettingsAnchor(anchor);
    setIsLoadingMicrophones(true);
    try {
      const granted = await isMicrophoneGranted();
      if (!granted && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch {
          // Permission denied — menu still offers system default.
        }
      }
      setMicrophones(await listAudioInputDevices());
    } finally {
      setIsLoadingMicrophones(false);
    }
  };

  const selectMicrophone = (deviceId: string | null) => {
    recorder.setMicrophoneDeviceId(deviceId);
    closeSettings();
  };

  const handleSubmit = async () => {
    if (!recorder.recordedBlob) return;
    if (recorder.recordingSeconds < minSeconds) {
      alert(
        i18n._('Please record at least {minSeconds} seconds.', {
          minSeconds,
        }),
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(recorder.recordedBlob, recorder.recordingSeconds);
      recorder.clearRecording();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack
      gap={1.25}
      data-testid="voice-chat-recorder"
      sx={{
        position: 'relative',
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${voiceChatUi.borderSubtle}`,
        bgcolor: voiceChatUi.surfaceSubtle,
      }}
    >
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ minHeight: 28 }}>
        <IconButton
          size="small"
          aria-label={i18n._('Recording settings')}
          data-testid="voice-chat-recorder-settings"
          onClick={(event) => void openSettings(event.currentTarget)}
          disabled={recorder.isRecording}
          sx={{
            color: voiceChatUi.textMuted,
            '&:hover': { color: voiceChatUi.textSecondary, bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <Settings size={16} />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
      </Stack>

      <Menu
        anchorEl={settingsAnchor}
        open={!!settingsAnchor}
        onClose={closeSettings}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        data-testid="voice-chat-recorder-mic-menu"
        MenuListProps={{
          subheader: (
            <ListSubheader
              sx={{
                bgcolor: 'transparent',
                lineHeight: '32px',
                fontSize: 12,
                color: voiceChatUi.textMuted,
              }}
            >
              {i18n._('Microphone')}
            </ListSubheader>
          ),
        }}
      >
        {isLoadingMicrophones && (
          <MenuItem disabled sx={{ fontSize: 14 }}>
            {i18n._('Loading…')}
          </MenuItem>
        )}
        {!isLoadingMicrophones && (
          <MenuItem
            selected={!recorder.microphoneDeviceId}
            onClick={() => selectMicrophone(null)}
            sx={{ fontSize: 14 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {!recorder.microphoneDeviceId ? <Check size={16} /> : null}
            </ListItemIcon>
            <ListItemText primary={i18n._('System default')} />
          </MenuItem>
        )}
        {!isLoadingMicrophones &&
          microphones.map((mic) => {
            const isSelected = recorder.microphoneDeviceId === mic.deviceId;
            return (
              <MenuItem
                key={mic.deviceId}
                selected={isSelected}
                onClick={() => selectMicrophone(mic.deviceId)}
                sx={{ fontSize: 14 }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {isSelected ? <Check size={16} /> : null}
                </ListItemIcon>
                <ListItemText primary={mic.label} />
              </MenuItem>
            );
          })}
        {!isLoadingMicrophones && microphones.length === 0 && (
          <MenuItem disabled sx={{ fontSize: 14, whiteSpace: 'normal', maxWidth: 280 }}>
            {i18n._('No microphones found. Allow microphone access and try again.')}
          </MenuItem>
        )}
      </Menu>

      {recorder.visualizer}

      {recorder.error && (
        <Typography color="error" variant="caption">
          {recorder.error}
        </Typography>
      )}

      {!recorder.isRecording && !recorder.recordedBlob && (
        <Stack alignItems="center" gap={1} sx={{ py: 0.5 }}>
          <IconButton
            onClick={() => void recorder.startRecording()}
            aria-label={i18n._('Start recording')}
            sx={{
              width: 52,
              height: 52,
              bgcolor: voiceChatUi.accent,
              color: '#111',
              '&:hover': { bgcolor: '#79b8ff' },
            }}
          >
            <Mic size={22} />
          </IconButton>
          <Typography variant="caption" sx={{ color: voiceChatUi.textMuted }}>
            {i18n._('Start recording')}
          </Typography>
        </Stack>
      )}

      {recorder.isRecording && (
        <Stack direction="row" gap={1.25} alignItems="center" flexWrap="wrap">
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Stack
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#f85149',
                animation: 'pulse 1.4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.35 },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {i18n._('Recording… {seconds}s', { seconds: recorder.recordingSeconds })}
            </Typography>
          </Stack>
          <Stack direction="row" gap={0.75} sx={{ ml: 'auto' }}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Square size={14} fill="currentColor" />}
              onClick={recorder.stopRecording}
            >
              {i18n._('Stop')}
            </Button>
            <Button size="small" variant="text" onClick={recorder.cancelRecording}>
              {i18n._('Cancel')}
            </Button>
          </Stack>
        </Stack>
      )}

      {recorder.recordedBlob && !recorder.isRecording && (
        <Stack gap={1.25}>
          <VoiceChatPlayer audioUrl={previewUrl} />
          <Stack direction="row" gap={0.75}>
            <Button
              startIcon={<Send size={14} fill="currentColor" />}
              color="info"
              variant="contained"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? i18n._('Sending…') : submitLabel}
            </Button>
            <Button
              variant="text"
              disabled={isSubmitting}
              onClick={() => {
                recorder.clearRecording();
                onCancel?.();
              }}
            >
              {i18n._('Discard')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
