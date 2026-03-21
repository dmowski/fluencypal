import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronRight } from 'lucide-react';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { GrammarImprovement } from './types';
import dayjs from 'dayjs';
import { AdvancedUserRecord } from '@/features/User/userInfo';

export const GrammarImprovementRow = ({
  improvement,
  isLoading,
  record,
  onClick,
  createdAtDayIso,
}: {
  improvement: GrammarImprovement | null;
  record: AdvancedUserRecord;
  isLoading: boolean;
  onClick: () => void;
  createdAtDayIso: string;
}) => {
  const rowHeight = '75px';

  const maxTitleLength = 50;
  const truncatedTitle =
    record.value.length > maxTitleLength
      ? record.value.slice(0, maxTitleLength) + '...'
      : record.value;

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
        display: 'grid',
        gridTemplateColumns: '1fr auto',
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
        <Typography
          sx={
            {
              //textWrap: 'balance',
            }
          }
        >
          {truncatedTitle}
        </Typography>
      </Stack>
      <ChevronRight size={'30px'} />
    </Stack>
  );
};
