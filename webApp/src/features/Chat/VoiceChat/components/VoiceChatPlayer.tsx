'use client';

import { useLingui } from '@lingui/react';
import { IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import { MoreVertical, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatVoiceDuration, voiceChatUi } from '../voiceChatUi';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { useGame } from '@/features/Game/useGame';

interface VoiceChatPlayerProps {
  audioUrl: string | null;
  autoPlay?: boolean;
  isPausedExternally?: boolean;
  onPlayStart?: () => void;
  onProgressListen?: () => void;
  onEnded?: () => void;
  label?: string;
  senderId?: string;
  messageId?: string;
  isUnRead?: boolean;
  onOpenMenu?: (anchor: HTMLElement) => void;
}

export const VoiceChatPlayer = ({
  senderId,
  audioUrl,
  autoPlay = false,
  isPausedExternally = false,
  onPlayStart,
  onProgressListen,
  onEnded,
  label,
  messageId,
  isUnRead = false,
  onOpenMenu,
}: VoiceChatPlayerProps) => {
  const { i18n } = useLingui();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedListening, setHasStartedListening] = useState(false);
  const hasMarkedListen = useRef(false);
  const onPlayStartRef = useRef(onPlayStart);
  onPlayStartRef.current = onPlayStart;

  const game = useGame();

  useEffect(() => {
    hasMarkedListen.current = false;
    setHasStartedListening(false);
    setProgress(0);
    setIsPlaying(false);
    setDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (!hasMarkedListen.current && audio.currentTime > 0) {
        hasMarkedListen.current = true;
        setHasStartedListening(true);
        onProgressListen?.();
      }
    };
    const onLoaded = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioUrl, onEnded, onProgressListen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!autoPlay || !audio || !audioUrl) return;
    onPlayStartRef.current?.();
    void audio.play();
  }, [autoPlay, audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!isPausedExternally || !audio || audio.paused) return;
    audio.pause();
  }, [isPausedExternally]);

  const startPlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    onPlayStartRef.current?.();
    await audio.play();
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (audio.paused) {
      await startPlayback();
    } else {
      audio.pause();
    }
  };

  const rewind = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void startPlayback();
  };

  const percent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const showAsUnread = isUnRead && !hasStartedListening;

  return (
    <Stack gap={0.75} data-testid="voice-chat-player">
      {label && (
        <Typography
          variant="caption"
          sx={{ color: voiceChatUi.textMuted, letterSpacing: '0.02em' }}
        >
          {label}
        </Typography>
      )}
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          gap: '10px',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton
          size="small"
          onClick={() => void togglePlay()}
          disabled={!audioUrl}
          aria-label={isPlaying ? i18n._('Pause') : i18n._('Play')}
          sx={{
            borderRadius: '50px',
            border: '1px solid #000',
            bgcolor: showAsUnread ? '#fff' : 'rgba(255, 255, 255, 0.4)',
            color: '#000',
            width: '50px',
            height: '50px',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            '&:hover': { bgcolor: '#f0f0f0' },
            '&.Mui-disabled': { opacity: 0.35 },
          }}
        >
          {isPlaying ? <Pause size={'18px'} /> : <Play size={'18px'} />}
        </IconButton>

        <Stack
          sx={{
            width: '100%',
            paddingTop: senderId ? '5px' : 0,
            gap: '3px',
          }}
        >
          {senderId && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                gap: '7px',
              }}
              minWidth={0}
            >
              <Avatar url={game.getUserAvatarUrl(senderId)} avatarSize={'16px'} />
              <UserName
                userId={senderId}
                userName={game.getUserName(senderId)}
                bold
                size="small"
                hideBadge={true}
              />
              {showAsUnread && (
                <Typography
                  component="span"
                  data-testid="voice-chat-new-badge"
                  sx={{
                    flexShrink: 0,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 400,
                    letterSpacing: '0.04em',
                    lineHeight: 1.4,
                    color: '#1a1408',
                    bgcolor: '#58A6FF',
                    position: 'relative',
                    top: '-2px',
                  }}
                >
                  {i18n._('New')}
                </Typography>
              )}
            </Stack>
          )}
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: '5px',
              borderRadius: 2,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': { bgcolor: voiceChatUi.progressBar, borderRadius: 2 },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: voiceChatUi.textMuted,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}
          >
            {formatVoiceDuration(progress)} / {formatVoiceDuration(duration || 0)}
          </Typography>
        </Stack>
        {messageId && onOpenMenu && (
          <IconButton
            aria-label={i18n._('Message options')}
            data-testid={`voice-chat-message-menu-${messageId}`}
            onClick={(event) => onOpenMenu(event.currentTarget)}
            sx={{
              flexShrink: 0,
              color: voiceChatUi.textMuted,
              '&:hover': { bgcolor: voiceChatUi.surfaceSubtle },
            }}
          >
            <MoreVertical size={18} />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};
