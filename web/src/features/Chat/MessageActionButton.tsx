import { Stack, Typography } from '@mui/material';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';

export const MessageActionButton = ({
  isActive,
  onClick,
  label,
  count,
  iconName,
  leftShift,
  iconSize,
}: {
  isActive: boolean;
  onClick: (e: HTMLElement) => void;
  label: string;
  count?: number;
  iconName: IconName;
  leftShift?: string;
  iconSize?: string;
}) => {
  const color = isActive ? '#ff0034' : 'inherit';
  return (
    <Stack
      onClick={(e) => onClick(e.currentTarget)}
      component={'button'}
      aria-label={label}
      sx={{
        flexDirection: 'row',
        gap: '6px',
        alignItems: 'center',
        border: 'none',
        background: 'rgba(255, 255, 255, 0)',
        color: 'inherit',
        cursor: 'pointer',
        padding: '6px 10px 6px 12px',
        position: 'relative',
        left: leftShift || '-12px',
        borderRadius: '28px',
        ':hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <DynamicIcon
        name={iconName}
        size={iconSize || '20px'}
        style={{
          opacity: isActive ? 1 : 0.7,
          color: color,
          fill: isActive ? color : 'none',
        }}
      />
      {count !== undefined && (
        <Typography
          variant="body2"
          sx={{
            opacity: isActive ? 1 : 0.7,
            color: color,
            fontWeight: 400,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count || 0}
        </Typography>
      )}
    </Stack>
  );
};
