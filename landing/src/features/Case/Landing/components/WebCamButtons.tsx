'use client';

import { IconButton, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export const MARIN_IDLE_VIDEO_SRC = '/call/marin/sit.webm';
export const MARIN_TALKING_VIDEO_SRC = '/call/marin/marin_talking.webm';

export const WebCamButtons = ({
  isPlaying,
  onToggle,
}: {
  isPlaying?: boolean;
  onToggle?: () => void;
}) => {
  return (
    <Stack
      sx={{
        position: 'absolute',
        left: '0px',
        bottom: '0px',
        alignItems: 'center',
        width: '100%',
        padding: isPlaying ? '10px 0 10px 0' : '10px 0 15px 0',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <IconButton
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={onToggle}
        data-testid="webcam-play-button"
        data-analytics={isPlaying ? 'webcam-pause' : 'webcam-play'}
        sx={{
          width: isPlaying ? 38 : 76,
          height: isPlaying ? 38 : 76,
          padding: 0,
          backgroundColor: isPlaying ? 'rgba(255, 255, 255, 0.3)' : '#1E88FF',
          color: '#fff',
          transition: 'all 0.2s ease-in-out',
          boxShadow: isPlaying
            ? '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 1)'
            : '0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 6px rgba(255, 255, 255, 1)',
          ':hover': {
            backgroundColor: '#3A98FF',
          },
          '& .MuiSvgIcon-root': {
            display: 'block',
          },
        }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: 20 }} />
        ) : (
          <PlayArrowIcon sx={{ fontSize: 40, transform: 'translateX(0px)' }} />
        )}
      </IconButton>
    </Stack>
  );
};
