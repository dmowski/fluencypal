import { IconButton, Stack, Typography } from '@mui/material';
import { Pause, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { StringDiff } from 'react-string-diff';

export const UserMessageSection = ({
  label,
  message,
  isTranscribing,
  fontSize,
  transcribingLabel,
  transcriptionBlob,
}: {
  label: string;
  message: string;
  isTranscribing: boolean;
  fontSize: string;
  transcribingLabel: string;
  transcriptionBlob: Blob | null;
}) => {
  const displayedMessage = isTranscribing ? transcribingLabel : message || '';

  const [isPlaying, setIsPlaying] = useState(false);
  const playAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTranscription = async () => {
    if (transcriptionBlob) {
      setIsPlaying(true);
      const url = URL.createObjectURL(transcriptionBlob);
      const audio = new Audio(url);
      playAudioRef.current = audio;
      await audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    }
  };

  const stopTranscription = () => {
    setIsPlaying(false);
    if (playAudioRef.current) {
      playAudioRef.current.pause();
      playAudioRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopTranscription();
    } else {
      playTranscription();
    }
  };

  return (
    <Stack>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
            fontWeight: 350,
          }}
        >
          {label}
        </Typography>
        <IconButton
          size="small"
          onClick={togglePlayback}
          sx={{
            opacity: transcriptionBlob ? 1 : 0.2,
          }}
        >
          {isPlaying ? <Pause size={'14px'} /> : <Play size={'14px'} />}
        </IconButton>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          gap: '12px',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          component={'div'}
          className={isTranscribing ? 'loading-shimmer' : ''}
          sx={{
            fontWeight: 400,
            fontSize: fontSize,
            paddingBottom: '3px',
            opacity: isTranscribing ? 0.7 : 0.9,
          }}
        >
          <StringDiff oldValue={displayedMessage} newValue={displayedMessage} />
        </Typography>
      </Stack>
    </Stack>
  );
};
