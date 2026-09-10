'use client';

import { useRef, useState } from 'react';
import { Stack } from '@mui/material';
import { WebCamButtons } from './WebCamButtons';

const videoSx = {
  aspectRatio: '16/10',
  maxWidth: '100%',
  objectFit: 'cover',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.21)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  width: '100%',
  borderRadius: '12px 12px 0 0',
} as const;

export const WebcamPreviewPlayer = ({
  idleVideoUrl,
  talkingVideoUrl,
}: {
  idleVideoUrl: string;
  talkingVideoUrl?: string;
}) => {
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const talkingVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const showIdle = () => {
    const talkingVideo = talkingVideoRef.current;
    talkingVideo?.pause();
    if (talkingVideo) {
      talkingVideo.currentTime = 0;
    }
    setIsPlaying(false);
    setIsTalking(false);
    void idleVideoRef.current?.play();
  };

  const togglePlayback = () => {
    const talkingVideo = talkingVideoRef.current;
    if (!talkingVideoUrl || !talkingVideo) {
      return;
    }

    if (isPlaying) {
      talkingVideo.pause();
      setIsPlaying(false);
      return;
    }

    idleVideoRef.current?.pause();
    setIsTalking(true);
    void talkingVideo.play().then(
      () => {
        setIsPlaying(true);
      },
      () => {
        setIsTalking(false);
        setIsPlaying(false);
      },
    );
  };

  return (
    <Stack
      sx={{
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Stack
        component={'video'}
        ref={idleVideoRef}
        autoPlay
        loop
        playsInline
        controls={false}
        muted
        src={idleVideoUrl}
        data-testid="webcam-idle-video"
        sx={{
          ...videoSx,
          visibility: isTalking ? 'hidden' : 'visible',
        }}
      />
      {talkingVideoUrl && (
        <Stack
          component={'video'}
          ref={talkingVideoRef}
          playsInline
          controls={false}
          muted={false}
          preload="auto"
          src={talkingVideoUrl}
          onEnded={showIdle}
          data-testid="webcam-talking-video"
          sx={{
            ...videoSx,
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: isTalking ? 'visible' : 'hidden',
          }}
        />
      )}
      <WebCamButtons
        isPlaying={isPlaying}
        onToggle={talkingVideoUrl ? togglePlayback : undefined}
      />
    </Stack>
  );
};
