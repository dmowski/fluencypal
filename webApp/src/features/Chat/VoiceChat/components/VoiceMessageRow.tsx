'use client';

import { useRef, useState } from 'react';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Heart, MoreVertical, Pause, Play } from 'lucide-react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { RoomMessage } from '../types';
import { VoiceUserAvatar } from './VoiceUserAvatar';
import { VoiceWaveform } from './VoiceWaveform';

export const VoiceMessageRow = ({
  message,
  audioUrl,
  canRemove,
  canLike,
  locked,
  senderBio,
  onRemove,
  onLike,
}: {
  message: RoomMessage;
  audioUrl: string | null;
  canRemove: boolean;
  canLike?: boolean;
  locked?: boolean;
  senderBio?: string;
  onRemove: () => void;
  onLike?: () => void;
}) => {
  const { i18n } = useLingui();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaDuration, setMediaDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationSec =
    mediaDuration && mediaDuration > message.durationSec + 0.5
      ? Math.round(mediaDuration)
      : message.durationSec;

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
        sx={{ width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </IconButton>
      <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
          <Stack
            sx={{
              flex: 1,
              padding: '12px 0 0 10px',
            }}
          >
            <VoiceWaveform
              audioUrl={locked ? null : audioUrl}
              audioRef={audioRef}
              onPlayingChange={setIsPlaying}
              onDuration={setMediaDuration}
              previewSeed={locked ? message.id : undefined}
            />
            <Typography sx={{ opacity: 0.75, flexShrink: 0, fontSize: '11px' }}>
              {i18n._('{count} sec', { count: durationSec })}
            </Typography>
          </Stack>
          <Stack
            sx={{
              gap: '0px',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <IconButton
              aria-label={i18n._('Like')}
              data-testid="voice-chat-like"
              disabled={!canLike}
              onClick={onLike}
              sx={{ color: message.likedByMe ? '#ff6b8a' : 'inherit' }}
            >
              <Heart size={22} fill={message.likedByMe ? '#ff6b8a' : 'none'} />
            </IconButton>
            {!!message.likeCount && (
              <Typography sx={{ opacity: 0.75, minWidth: 12, fontSize: '12px' }}>
                {message.likeCount || ''}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', gap: '14px' }}>
            <VoiceUserAvatar
              userId={message.senderId}
              size="44px"
              onClick={() => setShowProfile(true)}
            />
          </Stack>

          <IconButton
            aria-label={i18n._('Message options')}
            data-testid="voice-chat-message-menu"
            onClick={(event) => setMenu(event.currentTarget)}
          >
            <MoreVertical size={18} />
          </IconButton>
        </Stack>
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
      {showProfile ? (
        <CustomModal
          isOpen
          onClose={() => setShowProfile(false)}
          zIndex={1400}
          data-testid="voice-message-profile"
        >
          <Stack sx={{ width: '100%', maxWidth: 420, alignItems: 'center', gap: '12px' }}>
            <VoiceUserAvatar userId={message.senderId} size="96px" />
            <Stack sx={{ gap: '4px' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {message.senderName}
              </Typography>
              <Typography sx={{ opacity: senderBio ? 0.9 : 0.6, textAlign: 'center' }}>
                {senderBio || i18n._('No introduction yet')}
              </Typography>
            </Stack>
          </Stack>
        </CustomModal>
      ) : null}
    </Stack>
  );
};
