import { IconButton, Popover, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { RefObject } from 'react';
import { useEffect, useState } from 'react';

const HIGHLIGHT_COLORS = ['#FFE066', '#FFB3C6', '#BDE0FE', '#CDEAC0', '#E9D5FF'];

// Map colors to keyboard shortcuts
export const COLOR_SHORTCUTS: Record<string, string> = {
  '#FFE066': 'Y', // Yellow
  '#FFB3C6': 'P', // Pink
  '#BDE0FE': 'B', // Blue
  '#CDEAC0': 'G', // Green
  '#E9D5FF': 'V', // Violet
};

type TextPopoverProps = {
  anchorPosition: {
    top: number;
    left: number;
  } | null;
  paperRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  onPlayText?: () => void;
  activeColor?: string;
  translatedText?: string | null;
  isTranslationLoading?: boolean;
};

export const TextPopover = ({
  anchorPosition,
  paperRef,
  onClose,
  onColorSelect,
  onPlayText,
  activeColor,
  translatedText,
  isTranslationLoading,
}: TextPopoverProps) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (!anchorPosition) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept copy/paste or other modifier key combinations
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      // Use event.code (physical key position) so shortcuts work regardless of keyboard layout.
      // e.g. 'KeyY' matches shortcut 'Y' whether the user has EN or RU layout active.
      const color = Object.entries(COLOR_SHORTCUTS).find(
        ([, shortcut]) => `Key${shortcut}` === event.code,
      )?.[0];

      if (color) {
        event.preventDefault();
        onColorSelect(color);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorPosition, onColorSelect]);

  return (
    <Popover
      data-testid="reader-text-popover"
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      hideBackdrop={!isTouchDevice}
      disableScrollLock
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      sx={{ pointerEvents: isTouchDevice ? 'auto' : 'none' }}
      slotProps={{
        backdrop: {
          invisible: true,
          sx: {
            backgroundColor: 'transparent',
          },
        },
        paper: {
          ref: paperRef,
          sx: {
            pointerEvents: 'auto',
          },
        },
      }}
    >
      <Stack sx={{ gap: '5px', padding: '6px', minWidth: '150px' }}>
        <Stack direction="row" sx={{ gap: '4px', alignItems: 'center' }}>
          {HIGHLIGHT_COLORS.map((color) => {
            const shortcut = COLOR_SHORTCUTS[color];
            return (
              <Stack
                key={color}
                component="button"
                type="button"
                data-testid={`reader-highlight-color-${shortcut}`}
                onClick={() => onColorSelect(color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '3px',
                  border: activeColor === color ? '5px solid #333' : '1px solid #C7C7C7',
                  backgroundColor: color,
                  cursor: 'pointer',
                  outline: activeColor === color ? '2px solid #fff' : 'none',
                  outlineOffset: '-3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#333',
                  textShadow: '0 0 1px rgba(255, 255, 255, 0.8)',
                }}
              >
                {shortcut}
              </Stack>
            );
          })}
          <IconButton
            data-testid="reader-play-text-button"
            size="small"
            onClick={onPlayText}
            sx={{
              marginLeft: 'auto',
              padding: '2px',
              color: '#333',
            }}
          >
            <PlayArrowIcon fontSize="small" />
          </IconButton>
        </Stack>

        {isTranslationLoading ? (
          <Typography sx={{ fontSize: '12px' }}>Translating...</Typography>
        ) : translatedText ? (
          <Typography
            sx={{
              fontSize: '13px',
              lineHeight: 1.35,
              maxWidth: '150px',
            }}
          >
            {translatedText}
          </Typography>
        ) : null}
      </Stack>
    </Popover>
  );
};
