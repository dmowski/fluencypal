import { useEffect, useMemo, useState } from "react";
import { useAudio } from "./useAudio";
import { IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SyncIcon from "@mui/icons-material/Sync";
export interface AudioPlayIconProps {
  text: string;
}

export const AudioPlayIcon = ({ text }: AudioPlayIconProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audio = useMemo(() => new Audio(), []);
  const [countOfAttempts, setCountOfAttempts] = useState(0);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { getAudioUrl } = useAudio();

  const togglePlay = async () => {
    if (isPlaying) {
      audio.pause();
      audio.src = "";

      setIsPlaying(false);
      return;
    }

    setCountOfAttempts(countOfAttempts + 1);
    let speed = 1;
    if (countOfAttempts > 1 && countOfAttempts % 2 === 0) {
      speed = 0.8;
    }

    if (audioUrl) {
      audio.src = audioUrl;
      audio.playbackRate = speed;
      audio.play();

      setIsPlaying(true);
      return;
    } else {
      setIsLoading(true);
      try {
        const url = await getAudioUrl(text);
        setAudioUrl(url);
        audio.src = url;
        audio.playbackRate = speed;
        audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error(error);
        setError("Failed to play audio");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    setError(null);
    audio.src = "";
    setIsPlaying(false);
    setAudioUrl(null);
    setCountOfAttempts(0);
    audio.onended = () => {
      console.log("audio ended");
      setIsPlaying(false);
    };
    return () => {
      audio.pause();
    };
  }, [text]);

  return (
    <Tooltip title={error || ""}>
      <IconButton
        disabled={isLoading}
        color={error ? "error" : undefined}
        onClick={togglePlay}
        size="small"
        sx={{
          opacity: 0.7,
        }}
      >
        {isLoading ? (
          <SyncIcon fontSize="small" />
        ) : isPlaying ? (
          <StopIcon fontSize="small" />
        ) : (
          <PlayArrowIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};
