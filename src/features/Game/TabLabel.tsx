'use client';
import { Stack, Typography } from '@mui/material';

export const TabLabel = ({
  badgeNumber,
  label,
  badgeHighlight,
}: {
  label: string;
  badgeNumber?: number;
  badgeHighlight?: boolean;
}) => {
  return (
    <Stack sx={{ flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
      <Typography variant="caption">{label}</Typography>
      {badgeNumber && (
        <Typography
          component={'span'}
          sx={{
            color: badgeHighlight ? '#ff3d00' : 'inherit',
            border: badgeHighlight ? '1px solid #ff3d00' : '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 400,
            borderRadius: '6px',
            fontSize: '11px',
            padding: '1px 3px',
            minWidth: '16px',
          }}
        >
          {badgeNumber}
        </Typography>
      )}
    </Stack>
  );
};
