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
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px',
        zIndex: 0,
        '@media (max-width: 600px)': {
          justifyContent: 'flex-end',
        },
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

const PaginationButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Stack
      component={'button'}
      sx={{
        border: 'none',
        color: '#333',
        opacity: disabled ? 0.4 : 1,
        borderRadius: '50px',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        ':hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          cursor: disabled ? 'default' : 'pointer',
        },
        '@media (max-width: 600px)': {
          padding: '10px',
        },
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
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
      <PaginationButton disabled={isFirstPage} onClick={onPrevious}>
        <ChevronLeft />
      </PaginationButton>

      <PaginationButton disabled={isLastPage} onClick={onNext}>
        <ChevronRight />
      </PaginationButton>
    </Stack>
  );
};
