import { Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationPanel = ({
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
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '10px 0',
        zIndex: 0,
      }}
    >
      <PaginationButtons
        onPrevious={onPrevious}
        onNext={onNext}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
      />
    </Stack>
  );
};

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
