"use client";
import { useEffect, useMemo, useState } from "react";
import { useAudio } from "./useAudio";
import { IconButton, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SyncIcon from "@mui/icons-material/Sync";
import { TextToAudioVoice } from "@/app/api/textToAudio/types";
import { Loader, Pause, Volume2 } from "lucide-react";
export interface AudioPlayIconProps {
  text: string;
  voice: TextToAudioVoice;
  instructions: string;
  autoplay?: boolean;
  borderColor?: string;
}

export const AudioPlayIcon = ({
  text,
  autoplay,
  borderColor,
  instructions,
  voice,
}: AudioPlayIconProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audio = useMemo(() => {
    const isWindow = typeof window !== "undefined";
    return isWindow ? new Audio() : null;
  }, []);
  const [countOfAttempts, setCountOfAttempts] = useState(0);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { getAudioUrl } = useAudio();

  const togglePlay = async () => {
    if (isPlaying) {
      audio?.pause();
      if (audio) {
        audio.src = "";
      }

      setIsPlaying(false);
      return;
    }

    setCountOfAttempts(countOfAttempts + 1);
    let speed = 1;
    if (countOfAttempts > 1 && countOfAttempts % 2 === 0) {
      speed = 0.8;
    }

    if (audioUrl) {
      if (audio) {
        audio.src = audioUrl;
        audio.playbackRate = speed;
        audio.play();
      }

      setIsPlaying(true);
      return;
    } else {
      setIsLoading(true);
      try {
        const url = await getAudioUrl(text, instructions, voice);
        setAudioUrl(url);
        if (audio) {
          audio.src = url;
          audio.playbackRate = speed;
          audio.play();
        }
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
    if (audio) {
      audio.src = "";
    }
    setIsPlaying(false);
    setAudioUrl(null);
    setCountOfAttempts(0);
    if (audio)
      audio.onended = () => {
        console.log("audio ended");
        setIsPlaying(false);
      };

    const timeOut = setTimeout(() => {
      if (autoplay && text) {
        togglePlay();
      }
    }, 500);

    return () => {
      if (audio) audio.pause();
      clearTimeout(timeOut);
    };
  }, [text]);

  return (
    <Tooltip title={error || ""}>
      <IconButton
        disabled={isLoading}
        color={error ? "error" : undefined}
        onClick={togglePlay}
        sx={{
          opacity: 0.7,
          border: borderColor ? `1px solid ${borderColor}` : "none",
        }}
      >
        {isLoading ? (
          <Loader size={"18px"} />
        ) : isPlaying ? (
          <Pause size={"18px"} />
        ) : (
          <Volume2 size={"18px"} />
        )}
      </IconButton>
    </Tooltip>
  );
};
