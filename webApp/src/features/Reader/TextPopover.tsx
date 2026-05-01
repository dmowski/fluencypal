import { Popover, Stack, Typography } from '@mui/material';

const HIGHLIGHT_COLORS = ['#FFE066', '#FFB3C6', '#BDE0FE', '#CDEAC0', '#E9D5FF'];

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
  return (
    <Popover
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Stack sx={{ gap: '5px', padding: '6px', minWidth: '150px' }}>
        <Stack direction="row" sx={{ gap: '4px' }}>
          {HIGHLIGHT_COLORS.map((color) => (
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
              }}
            />
          ))}
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
