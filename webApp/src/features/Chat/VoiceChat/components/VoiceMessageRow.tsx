'use client';

import { useRef, useState } from 'react';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Heart, MoreVertical, Pause, Play } from 'lucide-react';
import { RoomMessage } from '../types';
import { VoiceUserAvatar } from './VoiceUserAvatar';
import { VoiceWaveform } from './VoiceWaveform';

export const VoiceMessageRow = ({
  message,
  audioUrl,
  canRemove,
  canLike,
  locked,
  onRemove,
  onLike,
}: {
  message: RoomMessage;
  audioUrl: string | null;
  canRemove: boolean;
  canLike?: boolean;
  locked?: boolean;
  onRemove: () => void;
  onLike?: () => void;
}) => {
  const { i18n } = useLingui();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (message.kind === 'join') {
    return (
      <Typography
        data-testid={`voice-chat-joined-${message.id}`}
        sx={{ textAlign: 'center', opacity: 0.75, fontWeight: 650 }}
      >
        {i18n._('{name} joined the room.', { name: message.senderName })}
      </Typography>
    );
  }

  return (
    <Stack
      data-testid={`voice-chat-message-${message.id}`}
      direction="row"
      sx={{ gap: '10px', alignItems: 'flex-start', width: '100%' }}
    >
      <VoiceUserAvatar userId={message.senderId} size="32px" />
      <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <Typography sx={{ fontWeight: 700 }}>{message.senderName}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
          <IconButton
            aria-label={isPlaying ? i18n._('Pause') : i18n._('Play')}
            data-testid="voice-chat-player"
            disabled={Boolean(locked) || !audioUrl}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) void audio.play();
              else audio.pause();
            }}
            sx={{ width: 52, height: 52 }}
          >
            {isPlaying ? <Pause size={30} /> : <Play size={30} />}
          </IconButton>
          <VoiceWaveform
            audioUrl={locked ? null : audioUrl}
            audioRef={audioRef}
            onPlayingChange={setIsPlaying}
            previewSeed={locked ? message.id : undefined}
          />
          <Typography sx={{ opacity: 0.75, flexShrink: 0 }}>
            {i18n._('{count} sec', { count: message.durationSec })}
          </Typography>
          <IconButton
            aria-label={i18n._('Like')}
            data-testid="voice-chat-like"
            disabled={!canLike}
            onClick={onLike}
            sx={{ color: message.likedByMe ? '#ff6b8a' : 'inherit' }}
          >
            <Heart size={18} fill={message.likedByMe ? '#ff6b8a' : 'none'} />
          </IconButton>
          <Typography sx={{ opacity: 0.75, minWidth: 12 }}>{message.likeCount || ''}</Typography>
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
