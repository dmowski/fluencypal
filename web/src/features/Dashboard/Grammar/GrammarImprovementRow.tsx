import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronRight } from 'lucide-react';
import { LoadingShapes } from '../../uiKit/Loading/LoadingShapes';
import { GrammarImprovement } from './types';

export const GrammarImprovementRow = ({
  improvement,
  isLoading,
  onClick,
}: {
  improvement: GrammarImprovement | null;
  isLoading: boolean;
  onClick: () => void;
}) => {
  const rowHeight = '40px';
  if (isLoading || !improvement) return <LoadingShapes sizes={[rowHeight]} />;

  return (
    <Stack
      onClick={onClick}
      sx={{
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '0px 10px',
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
      <Typography>{improvement.title}</Typography>
      <ChevronRight size={'20px'} />
    </Stack>
  );
};
