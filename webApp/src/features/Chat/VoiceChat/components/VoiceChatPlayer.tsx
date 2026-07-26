'use client';

import { useLingui } from '@lingui/react';
import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import { Pause, Play, RotateCcw, SkipBack } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VoiceChatPlayerProps {
  audioUrl: string | null;
  onProgressListen?: () => void;
  onEnded?: () => void;
  label?: string;
}

export const VoiceChatPlayer = ({
  audioUrl,
  onProgressListen,
  onEnded,
  label,
}: VoiceChatPlayerProps) => {
  const { i18n } = useLingui();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasMarkedListen = useRef(false);

  useEffect(() => {
    hasMarkedListen.current = false;
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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (audio.paused) {
      await audio.play();
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
    void audio.play();
  };

  const percent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <Stack gap={1} data-testid="voice-chat-player">
      {label && (
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {label}
        </Typography>
      )}
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />
      <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4 }} />
      <Stack direction="row" gap={1} alignItems="center">
        <Button
          size="small"
          variant="contained"
          onClick={() => void togglePlay()}
          disabled={!audioUrl}
          startIcon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
        >
          {isPlaying ? i18n._('Pause') : i18n._('Play')}
        </Button>
        <Button size="small" variant="outlined" onClick={rewind} disabled={!audioUrl} aria-label={i18n._('Rewind')}>
          <SkipBack size={16} />
        </Button>
        <Button size="small" variant="outlined" onClick={restart} disabled={!audioUrl} aria-label={i18n._('Restart')}>
          <RotateCcw size={16} />
        </Button>
        <Typography variant="caption" sx={{ ml: 'auto' }}>
          {Math.floor(progress)}s / {Math.floor(duration || 0)}s
        </Typography>
      </Stack>
    </Stack>
  );
};
