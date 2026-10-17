'use client';

import { useRef, useState } from 'react';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { MoreVertical, Pause, Play } from 'lucide-react';
import { RoomMessage } from '../types';
import { VoiceUserAvatar } from './VoiceUserAvatar';
import { VoiceWaveform } from './VoiceWaveform';

export const VoiceMessageRow = ({
  message,
  audioUrl,
  canRemove,
  onRemove,
}: {
  message: RoomMessage;
  audioUrl: string | null;
  canRemove: boolean;
  onRemove: () => void;
}) => {
  const { i18n } = useLingui();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <Stack
      data-testid={`voice-chat-message-${message.id}`}
      direction="row"
      sx={{ gap: '10px', alignItems: 'flex-start', width: '100%' }}
    >
      <VoiceUserAvatar userId={message.senderId} size="42px" />
      <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <Typography sx={{ fontWeight: 700 }}>{message.senderName}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
          <IconButton
            aria-label={isPlaying ? i18n._('Pause') : i18n._('Play')}
            data-testid="voice-chat-player"
            disabled={!audioUrl}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) void audio.play();
              else audio.pause();
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </IconButton>
          <VoiceWaveform audioUrl={audioUrl} audioRef={audioRef} onPlayingChange={setIsPlaying} />
          <Typography sx={{ opacity: 0.75, flexShrink: 0 }}>
            {i18n._('{count} sec', { count: message.durationSec })}
          </Typography>
          <IconButton
            aria-label={i18n._('Message options')}
            data-testid="voice-chat-message-menu"
            onClick={(event) => setMenu(event.currentTarget)}
          >
            <MoreVertical size={18} />
          </IconButton>
          <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
            <MenuItem
              data-testid="voice-chat-transcription"
              onClick={() => {
                setShowTranscript((value) => !value);
                setMenu(null);
              }}
            >
              {i18n._('Transcription')}
            </MenuItem>
            {canRemove ? (
              <MenuItem
                onClick={() => {
                  setMenu(null);
                  onRemove();
                }}
              >
                {i18n._('Remove')}
              </MenuItem>
            ) : null}
          </Menu>
        </Stack>
        {showTranscript ? (
          <Stack data-testid="voice-chat-transcript" sx={{ gap: '4px' }}>
            <Typography>{message.transcript}</Typography>
            {message.correctedTranscript &&
            message.correctedTranscript.trim() !== message.transcript.trim() ? (
              <Typography sx={{ opacity: 0.8 }}>
                {i18n._('Clearer: {text}', { text: message.correctedTranscript })}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
};
