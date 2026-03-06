import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronRight } from 'lucide-react';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { GrammarImprovement } from './types';
import dayjs from 'dayjs';

export const GrammarImprovementRow = ({
  improvement,
  isLoading,
  onClick,
  createdAtDayIso,
}: {
  improvement: GrammarImprovement | null;
  isLoading: boolean;
  onClick: () => void;
  createdAtDayIso: string;
}) => {
  const rowHeight = '75px';
  if (isLoading || !improvement)
    return (
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <LoadingShapes sizes={[rowHeight]} />
      </Stack>
    );

  return (
    <Stack
      onClick={onClick}
      sx={{
        width: '100%',
        gap: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 20px 8px 20px',
        alignItems: 'center',
        minHeight: rowHeight,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        flexDirection: 'row',
      }}
      component={'button'}
    >
      <Stack>
        <Typography
          sx={{
            opacity: 0.8,
            textTransform: 'uppercase',
          }}
          variant="caption"
        >
          {dayjs(createdAtDayIso).format('D MMMM')}
        </Typography>
        <Typography>{improvement.title}</Typography>
      </Stack>
      <ChevronRight size={'30px'} />
    </Stack>
  );
};
