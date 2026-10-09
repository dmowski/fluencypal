'use client';

import { IconButton, Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * Plays muted until the viewer asks for sound.
 * That click restarts the clip and shows the native controls.
 */
export const MutedPreviewVideo = ({ src }: { src: string }) => {
  const { i18n } = useLingui();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // Playback still starts at the beginning once metadata is ready.
    }
    video.muted = false;
    setSoundOn(true);
    void video.play();
  };

  return (
    <Stack
      sx={{
        position: 'relative',
        width: 'min(380px, 100%)',
        aspectRatio: '464 / 848',
        maxHeight: '72vh',
        borderRadius: '28px',
        overflow: 'hidden',
        backgroundColor: '#041018',
        border: '1px solid rgba(125, 222, 170, 0.28)',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        data-testid="muted-preview-video"
        autoPlay
        muted={!soundOn}
        loop={!soundOn}
        controls={soundOn}
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          backgroundColor: '#041018',
        }}
      />
      {soundOn ? null : (
        <IconButton
          onClick={playWithSound}
          aria-label={i18n._('Play with sound')}
          data-testid="muted-preview-unmute"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            color: '#fff',
            backgroundColor: 'rgba(4, 16, 24, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            '&:hover': {
              backgroundColor: 'rgba(4, 16, 24, 0.75)',
            },
          }}
        >
          <Volume2 size={40} />
        </IconButton>
      )}
    </Stack>
  );
};
