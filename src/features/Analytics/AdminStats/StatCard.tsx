import { Stack, Typography } from '@mui/material';

interface StatCardProps {
  value: number | string;
  label: string;
  sublabel?: string;
  isActive?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function StatCard({
  value,
  label,
  sublabel,
  isActive = false,
  isHighlighted = false,
  onClick,
}: StatCardProps) {
  return (
    <Stack
      className={['stat-card', isActive ? 'active' : ''].join(' ')}
      onClick={onClick}
      sx={{
        backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Typography className="value">{value}</Typography>
      <Stack>
        <Typography align="center" variant="body2" className="label">
          {label}
        </Typography>
        {sublabel && (
          <Typography align="center" variant="caption" sx={{ opacity: 0.7 }}>
            {sublabel}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
