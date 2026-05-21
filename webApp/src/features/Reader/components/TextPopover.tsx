import { IconButton, Popover, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SlidersHorizontal } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { type MouseEvent, type PointerEvent, type RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

const HIGHLIGHT_COLORS = ['#FFE066', '#FFB3C6', '#BDE0FE', '#CDEAC0', '#E9D5FF'];

// Map colors to keyboard shortcuts
export const COLOR_SHORTCUTS: Record<string, string> = {
  '#FFE066': 'Y', // Yellow
  '#FFB3C6': 'P', // Pink
  '#BDE0FE': 'B', // Blue
  '#CDEAC0': 'G', // Green
  '#E9D5FF': 'V', // Violet
};

export type ReaderTranslationSetupHint = 'missing-target' | 'same-language';

type TextPopoverProps = {
  anchorPosition: {
    top: number;
    left: number;
  } | null;
  paperRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  onPlayText: () => void;
  activeColor?: string;
  translatedText?: string | null;
  isTranslationLoading?: boolean;
  translationSetupHint?: ReaderTranslationSetupHint | null;
  onOpenSettings?: () => void;
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
  translationSetupHint,
  onOpenSettings,
}: TextPopoverProps) => {
  const { i18n } = useLingui();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const wasPlayTriggeredByPointer = useRef(false);

  const setupHintLabel =
    translationSetupHint === 'same-language'
      ? i18n._('Choose another language in Settings')
      : i18n._('Set translate language in Settings');

  const playSelectionText = () => {
    onPlayText();
  };

  const handlePlayPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    wasPlayTriggeredByPointer.current = true;
    playSelectionText();
  };

  const handlePlayClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (wasPlayTriggeredByPointer.current) {
      wasPlayTriggeredByPointer.current = false;
      return;
    }

    // Keep keyboard activation (Enter/Space) working on IconButton.
    playSelectionText();
  };

  const handlePlayPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleOpenSettings = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.getSelection()?.removeAllRanges();
    onClose();
    onOpenSettings?.();
  };

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
            onPointerDown={handlePlayPointerDown}
            onPointerUp={handlePlayPointerUp}
            onClick={handlePlayClick}
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
          <Typography sx={{ fontSize: '12px' }}>{i18n._('Translating...')}</Typography>
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
        ) : translationSetupHint && onOpenSettings ? (
          <Stack
            component="button"
            type="button"
            data-testid="reader-translation-setup-hint"
            onClick={handleOpenSettings}
            direction="row"
            alignItems="flex-start"
            sx={{
              gap: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
              color: '#555',
              '&:hover': {
                color: '#111',
              },
            }}
          >
            <SlidersHorizontal size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <Typography
              sx={{
                fontSize: '12px',
                lineHeight: 1.35,
                maxWidth: '170px',
                color: 'inherit',
              }}
            >
              {setupHintLabel}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Popover>
  );
};
