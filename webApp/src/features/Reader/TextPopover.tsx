import { Popover, Stack } from '@mui/material';

const HIGHLIGHT_COLORS = ['#FFE066', '#FFB3C6', '#BDE0FE', '#CDEAC0', '#E9D5FF'];

type TextPopoverProps = {
  anchorPosition: {
    top: number;
    left: number;
  } | null;
  onClose: () => void;
};

export const TextPopover = ({ anchorPosition, onClose }: TextPopoverProps) => {
  return (
    <Popover
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? { top: 0, left: 0 }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Stack direction="row" sx={{ gap: '4px', padding: '5px' }}>
        {HIGHLIGHT_COLORS.map((color) => (
          <Stack
            key={color}
            component="button"
            type="button"
            onClick={onClose}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '3px',
              border: '1px solid #C7C7C7',
              backgroundColor: color,
              cursor: 'pointer',
            }}
          />
        ))}
      </Stack>
    </Popover>
  );
};
