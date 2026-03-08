import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { StatRow } from './StatRow';

export const TextConstructorStats = ({
  progressPercent,
  myPoints,
  myPosition,
}: {
  progressPercent: number;
  myPoints: number;
  myPosition: number;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        width: 'max-content',
        padding: '10px 0',
        borderRadius: '8px',
        marginTop: '20px',
        gap: '3px',
      }}
    >
      <StatRow label={i18n._('Story progress:')} value={`${progressPercent}%`} />
      <StatRow label={i18n._('My Points:')} value={`${myPoints}`} />
      <StatRow label={i18n._('My Position:')} value={`${myPosition}`} />
    </Stack>
  );
};
