'use client';

import { Box, ButtonBase } from '@mui/material';
import { useLingui } from '@lingui/react';
import { VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * A muted loop until the viewer clicks the circle.
 * A second click mutes it again. The browser controls stay hidden.
 */
export const MutedPreviewVideo = ({ src }: { src: string }) => {
  const { i18n } = useLingui();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (soundOn) {
      video.muted = true;
      video.loop = true;
      setSoundOn(false);
      void video.play();
      return;
    }
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // Playback still starts at the beginning once metadata is ready.
    }
    video.muted = false;
    video.loop = false;
    setSoundOn(true);
    void video.play();
  };

  return (
    <ButtonBase
      disableRipple
      onClick={toggleSound}
      aria-label={soundOn ? i18n._('Mute') : i18n._('Unmute')}
      data-testid="muted-preview-unmute"
      sx={{
        position: 'relative',
        width: 'min(280px, 70vw)',
        height: 'min(280px, 70vw)',
        aspectRatio: '1',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#041018',
        border: '1px solid rgba(125, 222, 170, 0.28)',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <video
        ref={videoRef}
        src={src}
        data-testid="muted-preview-video"
        autoPlay
        muted={!soundOn}
        loop={!soundOn}
        controls={false}
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          backgroundColor: '#041018',
        }}
      />
      {soundOn ? null : (
        <Box
          aria-hidden
          data-testid="muted-preview-muted-icon"
          sx={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'grid',
            placeItems: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        >
          <VolumeX size={18} />
        </Box>
      )}
    </ButtonBase>
  );
};
