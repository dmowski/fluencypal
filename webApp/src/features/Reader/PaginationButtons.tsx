import { Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationButtons = ({
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
}: {
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <Stack
        component={'button'}
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          color: '#333',
          opacity: isFirstPage ? 0.4 : 1,
        }}
        disabled={isFirstPage}
        onClick={onPrevious}
      >
        <ChevronLeft />
      </Stack>

      <Stack
        component={'button'}
        sx={{
          border: 'none',
          backgroundColor: 'transparent',
          color: '#333',
          opacity: isLastPage ? 0.4 : 1,
        }}
        disabled={isLastPage}
        onClick={onNext}
      >
        <ChevronRight />
      </Stack>
    </Stack>
  );
};
