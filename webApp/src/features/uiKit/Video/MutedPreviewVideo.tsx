'use client';

import { Box, ButtonBase } from '@mui/material';
import { useLingui } from '@lingui/react';
import { VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * A muted loop until the viewer clicks the circle.
 * A second click mutes it again. The browser controls stay hidden.
 */
export const MutedPreviewVideo = ({
  src,
  muteSize = '280px',
  playSize = '280px',
}: {
  src: string;
  muteSize?: string;
  playSize?: string;
}) => {
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

  const size = soundOn ? playSize : muteSize;
  const muteIconSize = 18;

  return (
    <ButtonBase
      disableRipple
      onClick={toggleSound}
      aria-label={soundOn ? i18n._('Mute') : i18n._('Unmute')}
      data-testid="muted-preview-unmute"
      sx={{
        position: 'relative',
        width: `min(${size}, 70vw)`,
        height: `min(${size}, 70vw)`,
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
        transitionDelay: '0.1s',
        aspectRatio: '1',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#041018',
        //border: '1px solid rgba(222, 222, 170, 0.28)',
        cursor: 'pointer',
        padding: 0,
        ':after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: '50%',
          boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        },
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
            top: `calc(50% - 15px)`,
            left: '20px',
            transform: 'translateX(-50%)',
            display: 'grid',
            placeItems: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            color: '#fff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
          }}
        >
          <VolumeX size={15} />
        </Box>
      )}
    </ButtonBase>
  );
};
