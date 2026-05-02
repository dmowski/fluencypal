import { Popover, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';

const HIGHLIGHT_COLORS = ['#FFE066', '#FFB3C6', '#BDE0FE', '#CDEAC0', '#E9D5FF'];

// Map colors to keyboard shortcuts
const COLOR_SHORTCUTS: Record<string, string> = {
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
  onClose: () => void;
  onColorSelect: (color: string) => void;
  activeColor?: string;
  translatedText?: string | null;
  isTranslationLoading?: boolean;
};

export const TextPopover = ({
  anchorPosition,
  onClose,
  onColorSelect,
  activeColor,
  translatedText,
  isTranslationLoading,
}: TextPopoverProps) => {
  useEffect(() => {
    if (!anchorPosition) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept copy/paste or other modifier key combinations
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const key = event.key.toUpperCase();

      // Find color by shortcut key
      const color = Object.entries(COLOR_SHORTCUTS).find(([, shortcut]) => shortcut === key)?.[0];

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
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      hideBackdrop
      disableScrollLock
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      sx={{ pointerEvents: 'none' }}
      slotProps={{
        paper: {
          sx: {
            pointerEvents: 'auto',
          },
        },
      }}
    >
      <Stack sx={{ gap: '5px', padding: '6px', minWidth: '150px' }}>
        <Stack direction="row" sx={{ gap: '4px' }}>
          {HIGHLIGHT_COLORS.map((color) => {
            const shortcut = COLOR_SHORTCUTS[color];
            return (
              <Stack
                key={color}
                component="button"
                type="button"
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
        </Stack>

        {isTranslationLoading ? (
          <Typography sx={{ fontSize: '12px', color: '#eee' }}>Translating...</Typography>
        ) : translatedText ? (
          <Typography
            sx={{
              fontSize: '13px',
              lineHeight: 1.35,
              color: '#fff',
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
