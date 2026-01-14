"use client";
import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { TextToAudioVoice } from "@/app/api/textToAudio/types";
import { Loader, Pause, Volume2 } from "lucide-react";
import { useConversationAudio } from "./useConversationAudio";
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

  const audio = useConversationAudio();

  const [countOfAttempts, setCountOfAttempts] = useState(0);

  const togglePlay = async () => {
    if (audio.isUnlocked() === false) {
      await audio.startConversationAudio();
    }

    if (audio.isPlaying()) {
      audio.interrupt();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCountOfAttempts(countOfAttempts + 1);
    let speed = 1;
    if (countOfAttempts > 1 && countOfAttempts % 2 === 0) {
      speed = 0.8;
    }
    await audio.speak(text, { voice, instructions });

    const checkIfEnded = setInterval(() => {
      if (!audio.isPlaying()) {
        setIsPlaying(false);
        clearInterval(checkIfEnded);
      }
    }, 500);
  };

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
